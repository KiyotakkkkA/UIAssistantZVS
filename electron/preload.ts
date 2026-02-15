import { ipcRenderer, contextBridge } from "electron";
import type {
    BootData,
    ThemeData,
    ThemeListItem,
    UserProfile,
} from "../src/types/App";
import type {
    ChatDialog,
    ChatDialogListItem,
    DeleteDialogResult,
} from "../src/types/Chat";

// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld("ipcRenderer", {
    on(...args: Parameters<typeof ipcRenderer.on>) {
        const [channel, listener] = args;
        return ipcRenderer.on(channel, (event, ...nextArgs) =>
            listener(event, ...nextArgs),
        );
    },
    off(...args: Parameters<typeof ipcRenderer.off>) {
        const [channel, ...nextArgs] = args;
        return ipcRenderer.off(channel, ...nextArgs);
    },
    send(...args: Parameters<typeof ipcRenderer.send>) {
        const [channel, ...nextArgs] = args;
        return ipcRenderer.send(channel, ...nextArgs);
    },
    invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
        const [channel, ...nextArgs] = args;
        return ipcRenderer.invoke(channel, ...nextArgs);
    },
});

contextBridge.exposeInMainWorld("appApi", {
    getBootData: (): Promise<BootData> =>
        ipcRenderer.invoke("app:get-boot-data"),
    getThemesList: (): Promise<ThemeListItem[]> =>
        ipcRenderer.invoke("app:get-themes-list"),
    getThemeData: (themeId: string): Promise<ThemeData> =>
        ipcRenderer.invoke("app:get-theme-data", themeId),
    updateUserProfile: (
        nextProfile: Partial<UserProfile>,
    ): Promise<UserProfile> =>
        ipcRenderer.invoke("app:update-user-profile", nextProfile),
    getActiveDialog: (): Promise<ChatDialog> =>
        ipcRenderer.invoke("app:get-active-dialog"),
    getDialogsList: (): Promise<ChatDialogListItem[]> =>
        ipcRenderer.invoke("app:get-dialogs-list"),
    getDialogById: (dialogId: string): Promise<ChatDialog> =>
        ipcRenderer.invoke("app:get-dialog-by-id", dialogId),
    createDialog: (): Promise<ChatDialog> =>
        ipcRenderer.invoke("app:create-dialog"),
    renameDialog: (dialogId: string, title: string): Promise<ChatDialog> =>
        ipcRenderer.invoke("app:rename-dialog", dialogId, title),
    deleteDialog: (dialogId: string): Promise<DeleteDialogResult> =>
        ipcRenderer.invoke("app:delete-dialog", dialogId),
    deleteMessageFromDialog: (
        dialogId: string,
        messageId: string,
    ): Promise<ChatDialog> =>
        ipcRenderer.invoke(
            "app:delete-message-from-dialog",
            dialogId,
            messageId,
        ),
    truncateDialogFromMessage: (
        dialogId: string,
        messageId: string,
    ): Promise<ChatDialog> =>
        ipcRenderer.invoke(
            "app:truncate-dialog-from-message",
            dialogId,
            messageId,
        ),
    webSearchTool: (request: string, ollamaToken: string): Promise<unknown> =>
        ipcRenderer.invoke("app:web-search-tool", request, ollamaToken),
    webFetchTool: (url: string, ollamaToken: string): Promise<unknown> =>
        ipcRenderer.invoke("app:web-fetch-tool", url, ollamaToken),
    execShellCommand: (
        command: string,
        cwd?: string,
    ): Promise<{
        command: string;
        cwd: string;
        isAdmin: false;
        exitCode: number;
        stdout: string;
        stderr: string;
    }> => ipcRenderer.invoke("app:exec-shell-command", command, cwd),
    saveDialogSnapshot: (dialog: ChatDialog): Promise<ChatDialog> =>
        ipcRenderer.invoke("app:save-dialog-snapshot", dialog),
});
