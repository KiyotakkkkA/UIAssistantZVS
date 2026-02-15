export type MessageRole = "system" | "user" | "assistant" | "tool";

export type ChatMessage = {
    author: MessageRole;
    content: string;
    timestamp: string;
};

export interface OllamaMessage {
    role: MessageRole;
    content: string;
}

export interface OllamaChatChunk {
    model?: string;
    created_at?: string;
    message?: {
        role?: MessageRole;
        content?: string;
    };
    done: boolean;
    error?: string;
}

export interface StreamChatParams {
    model: string;
    token?: string;
    messages: OllamaMessage[];
    signal?: AbortSignal;
    onChunk?: (chunk: OllamaChatChunk) => void;
}
