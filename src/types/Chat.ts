export type MessageRole = "system" | "user" | "assistant" | "tool";

export type ChatMessage = {
    id: string;
    author: MessageRole;
    content: string;
    timestamp: string;
};

export type ChatDialog = {
    id: string;
    title: string;
    messages: ChatMessage[];
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
