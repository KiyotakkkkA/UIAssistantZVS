import type { BootData, ThemeData, ThemeListItem, UserProfile } from "./App";
import type {
    ChatDialog,
    ChatDialogListItem,
    DeleteDialogResult,
} from "./Chat";

export type ExecShellCommandResult = {
    command: string;
    cwd: string;
    isAdmin: false;
    exitCode: number;
    stdout: string;
    stderr: string;
};

export type AppApiBootNamespace = {
    getBootData: () => Promise<BootData>;
};

export type AppApiThemesNamespace = {
    getThemesList: () => Promise<ThemeListItem[]>;
    getThemeData: (themeId: string) => Promise<ThemeData>;
};

export type AppApiProfileNamespace = {
    updateUserProfile: (
        nextProfile: Partial<UserProfile>,
    ) => Promise<UserProfile>;
};

export type AppApiDialogsNamespace = {
    getActiveDialog: () => Promise<ChatDialog>;
    getDialogsList: () => Promise<ChatDialogListItem[]>;
    getDialogById: (dialogId: string) => Promise<ChatDialog>;
    createDialog: () => Promise<ChatDialog>;
    renameDialog: (dialogId: string, title: string) => Promise<ChatDialog>;
    deleteDialog: (dialogId: string) => Promise<DeleteDialogResult>;
    deleteMessageFromDialog: (
        dialogId: string,
        messageId: string,
    ) => Promise<ChatDialog>;
    truncateDialogFromMessage: (
        dialogId: string,
        messageId: string,
    ) => Promise<ChatDialog>;
    saveDialogSnapshot: (dialog: ChatDialog) => Promise<ChatDialog>;
};

export type AppApiToolsNamespace = {
    webSearchTool: (request: string, ollamaToken: string) => Promise<unknown>;
    webFetchTool: (url: string, ollamaToken: string) => Promise<unknown>;
};

export type AppApiShellNamespace = {
    execShellCommand: (
        command: string,
        cwd?: string,
    ) => Promise<ExecShellCommandResult>;
};

export type AppApi = {
    boot: AppApiBootNamespace;
    themes: AppApiThemesNamespace;
    profile: AppApiProfileNamespace;
    dialogs: AppApiDialogsNamespace;
    tools: AppApiToolsNamespace;
    shell: AppApiShellNamespace;
};
