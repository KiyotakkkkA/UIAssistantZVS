import type { ChatMessage } from "./Chat";
import type { OllamaToolDefinition } from "./Chat";

export type ChatAdapterRequest = {
    history: ChatMessage[];
    tools?: OllamaToolDefinition[];
    maxToolCalls?: number;
    executeTool?: (
        toolName: string,
        args: Record<string, unknown>,
    ) => Promise<unknown>;
    onToolCall?: (payload: {
        callId: string;
        toolName: string;
        args: Record<string, unknown>;
    }) => void;
    onToolResult?: (payload: {
        callId: string;
        toolName: string;
        args: Record<string, unknown>;
        result: unknown;
    }) => void;
    onThinkingChunk?: (chunkText: string, done: boolean) => void;
    signal?: AbortSignal;
    onChunk: (chunkText: string, done: boolean) => void;
};

export type ChatProviderAdapter = {
    send: (request: ChatAdapterRequest) => Promise<void>;
};
