import { postOllamaStream } from "../services/api";
import type {
    ChatMessage,
    OllamaChatChunk,
    OllamaMessage,
    StreamChatParams,
} from "../types/Chat";

export const streamChatOllama = async ({
    model,
    messages,
    tools,
    format,
    signal,
    onChunk,
}: Omit<StreamChatParams, "token">) => {
    if (signal?.aborted) {
        throw new DOMException("Request was aborted", "AbortError");
    }

    await postOllamaStream<OllamaChatChunk>(
        "chat",
        {
            model,
            messages,
            stream: true,
            think: true,
            ...(tools && tools.length > 0 ? { tools } : {}),
            ...(format ? { format } : {}),
        },
        {
            signal,
            onChunk: onChunk ?? (() => {}),
        },
    );
};

export const toOllamaMessages = (messages: ChatMessage[]): OllamaMessage[] =>
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
