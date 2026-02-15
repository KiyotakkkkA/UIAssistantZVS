import api from "../../../services/api";
import type { ChatMessage, OllamaMessage } from "../../../types/Chat";
import type { ChatProviderAdapter } from "../../../types/AIRequests";

type CreateOllamaAdapterParams = {
    model: string;
    token: string;
};

const toOllamaMessages = (messages: ChatMessage[]): OllamaMessage[] =>
    messages
        .filter((message) => {
            if (message.author === "assistant") {
                return (
                    message.assistantStage === "answer" ||
                    !message.assistantStage
                );
            }

            return message.author === "system" || message.author === "user";
        })
        .map((message) => ({
            role: message.author,
            content: message.content,
        }));

export const createOllamaAdapter = ({
    model,
    token,
}: CreateOllamaAdapterParams): ChatProviderAdapter => {
    return {
        send: async ({
            history,
            tools,
            maxToolCalls = 4,
            executeTool,
            onToolCall,
            onToolResult,
            onThinkingChunk,
            signal,
            onChunk,
        }) => {
            const messages = toOllamaMessages(history);
            let toolCallsUsed = 0;
            let shouldContinue = true;
            let callSequence = 0;

            while (shouldContinue) {
                let roundContent = "";
                const roundToolCalls: {
                    type?: "function";
                    function: {
                        index?: number;
                        name: string;
                        arguments: Record<string, unknown>;
                    };
                }[] = [];

                await api.streamChatOllama({
                    model,
                    token,
                    messages,
                    tools,
                    signal,
                    onChunk: (chunk) => {
                        const contentChunk = chunk.message?.content || "";
                        const thinkingChunk = chunk.message?.thinking || "";

                        if (thinkingChunk) {
                            onThinkingChunk?.(thinkingChunk, false);
                        }

                        if (contentChunk) {
                            roundContent += contentChunk;
                            onChunk(contentChunk, false);
                        }

                        if (chunk.message?.tool_calls?.length) {
                            roundToolCalls.push(...chunk.message.tool_calls);
                        }

                        if (chunk.done && !contentChunk) {
                            onThinkingChunk?.("", true);
                            onChunk("", true);
                        }
                    },
                });

                if (roundToolCalls.length === 0) {
                    shouldContinue = false;
                    continue;
                }

                if (!executeTool) {
                    throw new Error("Не передан обработчик executeTool");
                }

                messages.push({
                    role: "assistant",
                    content: roundContent,
                    tool_calls: roundToolCalls,
                });

                for (const call of roundToolCalls) {
                    if (toolCallsUsed >= maxToolCalls) {
                        throw new Error(
                            `Превышен лимит вызовов инструментов (${maxToolCalls})`,
                        );
                    }

                    const toolName = call.function.name;
                    const toolArgs = call.function.arguments || {};
                    callSequence += 1;
                    const callId = `tool_call_${callSequence}`;

                    onToolCall?.({
                        callId,
                        toolName,
                        args: toolArgs,
                    });
                    const toolResult = await executeTool(toolName, toolArgs, {
                        callId,
                    });
                    onToolResult?.({
                        callId,
                        toolName,
                        args: toolArgs,
                        result: toolResult,
                    });

                    messages.push({
                        role: "tool",
                        tool_name: toolName,
                        content:
                            typeof toolResult === "string"
                                ? toolResult
                                : JSON.stringify(toolResult),
                    });

                    toolCallsUsed += 1;
                }
            }
        },
    };
};
