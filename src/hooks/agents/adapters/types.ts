import type { ChatMessage } from "../../../types/Chat";

export type ChatAdapterRequest = {
    history: ChatMessage[];
    signal?: AbortSignal;
    onChunk: (chunkText: string, done: boolean) => void;
};

export type ChatProviderAdapter = {
    send: (request: ChatAdapterRequest) => Promise<void>;
};
