import { getOllamaEmbed, streamOllamaChat } from "../../services/api";
import type {
    ChatMessage,
    OllamaMessage,
    StreamChatParams,
} from "../../types/Chat";

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

    await streamOllamaChat(
        {
            model,
            messages,
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
            const stage = message.assistantStage as
                | "thinking"
                | "planning"
                | "questioning"
                | "tools_calling"
                | "answering"
                | undefined;

            if (message.author === "assistant") {
                return stage === "answering" || !stage;
            }

            return message.author === "system" || message.author === "user";
        })
        .map((message) => ({
            role: message.author,
            content: message.content,
        }));

export const embedOllama = async (params: {
    model: string;
    input: string | string[];
}): Promise<number[][]> => {
    const result = await getOllamaEmbed({
        model: params.model,
        input: params.input,
    });

    return result.embeddings;
};
