export type MessageRole = "system" | "user" | "assistant";
export type OllamaRole = MessageRole | "tool";

export type AssistantStage = "answer" | "tool" | "thinking";

export type ToolTrace = {
    callId: string;
    toolName: string;
    args: Record<string, unknown>;
    result: unknown;
    status?: "pending" | "accepted" | "cancelled";
    command?: string;
    cwd?: string;
    isAdmin?: boolean;
};

export type ChatMessage = {
    id: string;
    author: MessageRole;
    content: string;
    timestamp: string;
    answeringAt?: string;
    assistantStage?: AssistantStage;
    toolTrace?: ToolTrace;
};

export type ChatDialog = {
    id: string;
    title: string;
    messages: ChatMessage[];
    forProjectId: string | null;
    createdAt: string;
    updatedAt: string;
};

export type ChatDialogListItem = {
    id: string;
    title: string;
    preview: string;
    time: string;
    updatedAt: string;
};

export type DeleteDialogResult = {
    dialogs: ChatDialogListItem[];
    activeDialog: ChatDialog;
};

export type DialogMessagePayload = {
    dialogId: string;
    messageId: string;
};

export interface OllamaMessage {
    role: OllamaRole;
    content: string;
    tool_calls?: OllamaToolCall[];
    tool_name?: string;
    thinking?: string;
}

export type ToolParameterSchema = {
    type: string;
    description?: string;
    enum?: string[];
    properties?: Record<string, ToolParameterSchema>;
    items?: ToolParameterSchema;
    required?: string[];
};

export type OllamaToolDefinition = {
    type: "function";
    function: {
        name: string;
        description?: string;
        parameters: ToolParameterSchema;
    };
};

export type OllamaToolCall = {
    type?: "function";
    function: {
        index?: number;
        name: string;
        arguments: Record<string, unknown>;
    };
};

export interface OllamaChatChunk {
    model?: string;
    created_at?: string;
    message?: {
        role?: OllamaRole;
        content?: string;
        thinking?: string;
        tool_calls?: OllamaToolCall[];
    };
    done: boolean;
    error?: string;
}

export interface OllamaChatResponse {
    model?: string;
    created_at?: string;
    message: {
        role?: OllamaRole;
        content?: string;
        thinking?: string;
        tool_calls?: OllamaToolCall[];
    };
    done: boolean;
    done_reason?: string;
}

export interface StreamChatParams {
    model: string;
    token?: string;
    messages: OllamaMessage[];
    tools?: OllamaToolDefinition[];
    signal?: AbortSignal;
    onChunk?: (chunk: OllamaChatChunk) => void;
}

export interface ChatOllamaParams {
    model: string;
    token?: string;
    messages: OllamaMessage[];
    tools?: OllamaToolDefinition[];
    signal?: AbortSignal;
}
