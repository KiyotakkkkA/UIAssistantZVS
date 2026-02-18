import { ipcRenderer, contextBridge } from "electron";
import type {
    BootData,
    ThemeData,
    ThemeListItem,
    UserProfile,
} from "../src/types/App";
import type { ChatDialog } from "../src/types/Chat";
import type { AppApi, AppCacheEntry } from "../src/types/ElectronApi";
import type { CreateProjectPayload } from "../src/types/Project";

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

const appApi: AppApi = {
    boot: {
        getBootData: (): Promise<BootData> =>
            ipcRenderer.invoke("app:get-boot-data"),
    },
    themes: {
        getThemesList: (): Promise<ThemeListItem[]> =>
            ipcRenderer.invoke("app:get-themes-list"),
        getThemeData: (themeId: string): Promise<ThemeData> =>
            ipcRenderer.invoke("app:get-theme-data", themeId),
    },
    profile: {
        updateUserProfile: (
            nextProfile: Partial<UserProfile>,
        ): Promise<UserProfile> =>
            ipcRenderer.invoke("app:update-user-profile", nextProfile),
    },
    dialogs: {
        getActiveDialog: (): Promise<ChatDialog> =>
            ipcRenderer.invoke("app:get-active-dialog"),
        getDialogsList: () => ipcRenderer.invoke("app:get-dialogs-list"),
        getDialogById: (dialogId: string) =>
            ipcRenderer.invoke("app:get-dialog-by-id", dialogId),
        createDialog: () => ipcRenderer.invoke("app:create-dialog"),
        renameDialog: (dialogId: string, title: string) =>
            ipcRenderer.invoke("app:rename-dialog", dialogId, title),
        deleteDialog: (dialogId: string) =>
            ipcRenderer.invoke("app:delete-dialog", dialogId),
        deleteMessageFromDialog: (dialogId: string, messageId: string) =>
            ipcRenderer.invoke(
                "app:delete-message-from-dialog",
                dialogId,
                messageId,
            ),
        truncateDialogFromMessage: (dialogId: string, messageId: string) =>
            ipcRenderer.invoke(
                "app:truncate-dialog-from-message",
                dialogId,
                messageId,
            ),
        saveDialogSnapshot: (dialog: ChatDialog): Promise<ChatDialog> =>
            ipcRenderer.invoke("app:save-dialog-snapshot", dialog),
    },
    shell: {
        execShellCommand: (command: string, cwd?: string) =>
            ipcRenderer.invoke("app:exec-shell-command", command, cwd),
    },
    upload: {
        pickFiles: (options?: { accept?: string[]; multiple?: boolean }) =>
            ipcRenderer.invoke("app:pick-files", options),
        pickPath: (options?: { forFolders?: boolean }) =>
            ipcRenderer.invoke("app:pick-path", options),
    },
    files: {
        saveFiles: (files) => ipcRenderer.invoke("app:save-files", files),
        saveImageFromSource: (payload) =>
            ipcRenderer.invoke("app:save-image-from-source", payload),
        getFilesByIds: (fileIds) =>
            ipcRenderer.invoke("app:get-files-by-ids", fileIds),
        openFile: (fileId) => ipcRenderer.invoke("app:open-saved-file", fileId),
        openPath: (targetPath: string) =>
            ipcRenderer.invoke("app:open-path", targetPath),
        openExternalUrl: (url: string) =>
            ipcRenderer.invoke("app:open-external-url", url),
    },
    projects: {
        getProjectsList: () => ipcRenderer.invoke("app:get-projects-list"),
        getDefaultProjectsDirectory: () =>
            ipcRenderer.invoke("app:get-default-projects-directory"),
        getProjectById: (projectId: string) =>
            ipcRenderer.invoke("app:get-project-by-id", projectId),
        createProject: (payload: CreateProjectPayload) =>
            ipcRenderer.invoke("app:create-project", payload),
        deleteProject: (projectId: string) =>
            ipcRenderer.invoke("app:delete-project", projectId),
    },
    cache: {
        getCacheEntry: (key: string) =>
            ipcRenderer.invoke("app:get-cache-entry", key),
        setCacheEntry: (key: string, entry: AppCacheEntry) =>
            ipcRenderer.invoke("app:set-cache-entry", key, entry),
    },
};

contextBridge.exposeInMainWorld("appApi", appApi);
