import api from "../../../services/api";
import type { ChatMessage } from "../../../types/Chat";
import type { ChatProviderAdapter } from "../../../types/AIRequests";

type CreateOllamaAdapterParams = {
    model: string;
    token: string;
};

const toOllamaMessages = (messages: ChatMessage[]) =>
    messages.map((message) => ({
        role: message.author,
        content: message.content,
    }));

export const createOllamaAdapter = ({
    model,
    token,
}: CreateOllamaAdapterParams): ChatProviderAdapter => {
    return {
        send: async ({ history, signal, onChunk }) => {
            await api.streamChatOllama({
                model,
                token,
                messages: toOllamaMessages(history),
                signal,
                onChunk: (chunk) => {
                    const chunkText = chunk.message?.content || "";
                    onChunk(chunkText, chunk.done);
                },
            });
        },
    };
};
