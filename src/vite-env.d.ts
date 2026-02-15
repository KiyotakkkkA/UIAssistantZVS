/// <reference types="vite/client" />

import type {
    BootData,
    ThemeData,
    ThemeListItem,
    UserProfile,
} from "./types/App";
import type {
    ChatDialog,
    ChatDialogListItem,
    DeleteDialogResult,
} from "./types/Chat";

interface ImportMetaEnv {}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}

declare global {
    interface Window {
        appApi?: {
            getBootData: () => Promise<BootData>;
            getThemesList: () => Promise<ThemeListItem[]>;
            getThemeData: (themeId: string) => Promise<ThemeData>;
            updateUserProfile: (
                nextProfile: Partial<UserProfile>,
            ) => Promise<UserProfile>;
            getActiveDialog: () => Promise<ChatDialog>;
            getDialogsList: () => Promise<ChatDialogListItem[]>;
            getDialogById: (dialogId: string) => Promise<ChatDialog>;
            createDialog: () => Promise<ChatDialog>;
            renameDialog: (
                dialogId: string,
                title: string,
            ) => Promise<ChatDialog>;
            deleteDialog: (dialogId: string) => Promise<DeleteDialogResult>;
            deleteMessageFromDialog: (
                dialogId: string,
                messageId: string,
            ) => Promise<ChatDialog>;
            truncateDialogFromMessage: (
                dialogId: string,
                messageId: string,
            ) => Promise<ChatDialog>;
            webSearchTool: (
                request: string,
                ollamaToken: string,
            ) => Promise<unknown>;
            webFetchTool: (
                url: string,
                ollamaToken: string,
            ) => Promise<unknown>;
            execShellCommand: (
                command: string,
                cwd?: string,
            ) => Promise<{
                command: string;
                cwd: string;
                isAdmin: false;
                exitCode: number;
                stdout: string;
                stderr: string;
            }>;
            saveDialogSnapshot: (dialog: ChatDialog) => Promise<ChatDialog>;
        };
    }
}

export {};
