import { Config } from "../../../config";
import { userProfileStore } from "../../../stores/userProfileStore";
import type {
    ChatMessage,
    OllamaChatChunk,
    OllamaMessage,
    StreamChatParams,
} from "../../../types/Chat";
import type { ChatProviderAdapter } from "../../../types/AIRequests";

type CreateOllamaAdapterParams = {
    model: string;
    format?: StreamChatParams["format"];
};

export const createOllamaRequest = (endpoint: string) => {
    const ollamaToken = userProfileStore.userProfile.ollamaToken.trim();
    const normalizedEndpoint = endpoint.replace(/^\/+/, "");

    return {
        url: `${Config.OLLAMA_BASE_URL}/${normalizedEndpoint}`,
        init: {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...(ollamaToken && {
                    Authorization: `Bearer ${ollamaToken}`,
                }),
            },
        } satisfies RequestInit,
    };
};

const streamChatOllama = async ({
    model,
    messages,
    tools,
    format,
    signal,
    onChunk,
}: Omit<StreamChatParams, "token">) => {
    const request = createOllamaRequest("chat");
    const response = await fetch(request.url, {
        ...request.init,
        body: JSON.stringify({
            model,
            messages,
            stream: true,
            think: true,
            ...(tools && tools.length > 0 ? { tools } : {}),
            ...(format ? { format } : {}),
        }),
        signal,
    });

    if (!response.ok) {
        const body = await response.text();
        throw new Error(
            body || `Ollama request failed with status ${response.status}`,
        );
    }

    if (!response.body) {
        throw new Error("Streaming response body is not available");
    }

    const decoder = new TextDecoder();
    const reader = response.body.getReader();
    let buffer = "";

    let isReading = true;

    while (isReading) {
        const { done, value } = await reader.read();

        if (done) {
            isReading = false;
            continue;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
            const trimmed = line.trim();

            if (!trimmed) {
                continue;
            }

            const chunk = JSON.parse(trimmed) as OllamaChatChunk;

            if (chunk.error) {
                throw new Error(chunk.error);
            }

            onChunk?.(chunk);

            if (chunk.done) {
                return;
            }
        }
    }

    const rest = buffer.trim();

    if (rest) {
        const chunk = JSON.parse(rest) as OllamaChatChunk;

        if (chunk.error) {
            throw new Error(chunk.error);
        }

        onChunk?.(chunk);
    }
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
    format,
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

                await streamChatOllama({
                    model,
                    messages,
                    tools,
                    format,
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
