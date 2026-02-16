import path from "node:path";
import { readFile } from "node:fs/promises";

import { app, BrowserWindow, dialog, ipcMain, shell } from "electron";
import { fileURLToPath } from "node:url";
import { InitService } from "./services/InitService";
import { UserDataService } from "./services/UserDataService";
import { CommandExecService } from "./services/CommandExecService";
import type { UserProfile } from "../src/types/App";
import type { ChatDialog } from "../src/types/Chat";
import type { UploadedFileData } from "../src/types/ElectronApi";
import type { CreateProjectPayload } from "../src/types/Project";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │
process.env.APP_ROOT = path.join(__dirname, "..");

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
export const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
export const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
    ? path.join(process.env.APP_ROOT, "public")
    : RENDERER_DIST;

let win: BrowserWindow | null;
let userDataService: UserDataService;
let commandExecService: CommandExecService;

const getMimeTypeByExtension = (filePath: string): string => {
    const extension = path.extname(filePath).toLowerCase();

    const mimeByExtension: Record<string, string> = {
        ".png": "image/png",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".gif": "image/gif",
        ".webp": "image/webp",
        ".bmp": "image/bmp",
        ".svg": "image/svg+xml",
        ".avif": "image/avif",
    };

    return mimeByExtension[extension] || "application/octet-stream";
};

const imageExtensions = [
    "png",
    "jpg",
    "jpeg",
    "gif",
    "webp",
    "bmp",
    "svg",
    "avif",
];

function createWindow() {
    win = new BrowserWindow({
        icon: path.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
        webPreferences: {
            preload: path.join(__dirname, "preload.mjs"),
        },
    });

    win.webContents.on("did-finish-load", () => {
        win?.webContents.send(
            "main-process-message",
            new Date().toLocaleString(),
        );
    });

    if (VITE_DEV_SERVER_URL) {
        win.loadURL(VITE_DEV_SERVER_URL);
    } else {
        win.loadFile(path.join(RENDERER_DIST, "index.html"));
    }

    win.maximize();
}

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
        win = null;
    }
});

app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

app.whenReady().then(() => {
    const initDirectoriesService = new InitService(app.getPath("userData"));

    initDirectoriesService.initialize();
    userDataService = new UserDataService(app.getPath("userData"));
    commandExecService = new CommandExecService();

    ipcMain.handle("app:get-boot-data", () => userDataService.getBootData());
    ipcMain.handle("app:get-themes-list", () =>
        userDataService.getThemesList(),
    );
    ipcMain.handle("app:get-theme-data", (_event, themeId: string) =>
        userDataService.getThemeData(themeId),
    );
    ipcMain.handle(
        "app:update-user-profile",
        (_event, nextProfile: Partial<UserProfile>) =>
            userDataService.updateUserProfile(nextProfile),
    );
    ipcMain.handle("app:get-active-dialog", () =>
        userDataService.getActiveDialog(),
    );
    ipcMain.handle("app:get-dialogs-list", () =>
        userDataService.getDialogsList(),
    );
    ipcMain.handle("app:get-dialog-by-id", (_event, dialogId: string) =>
        userDataService.getDialogById(dialogId),
    );
    ipcMain.handle("app:create-dialog", () => userDataService.createDialog());
    ipcMain.handle(
        "app:rename-dialog",
        (_event, dialogId: string, title: string) =>
            userDataService.renameDialog(dialogId, title),
    );
    ipcMain.handle("app:delete-dialog", (_event, dialogId: string) =>
        userDataService.deleteDialog(dialogId),
    );
    ipcMain.handle(
        "app:delete-message-from-dialog",
        (_event, dialogId: string, messageId: string) =>
            userDataService.deleteMessageFromDialog(dialogId, messageId),
    );
    ipcMain.handle(
        "app:truncate-dialog-from-message",
        (_event, dialogId: string, messageId: string) =>
            userDataService.truncateDialogFromMessage(dialogId, messageId),
    );
    ipcMain.handle("app:save-dialog-snapshot", (_event, dialog: ChatDialog) =>
        userDataService.saveDialogSnapshot(dialog),
    );
    ipcMain.handle("app:get-projects-list", () =>
        userDataService.getProjectsList(),
    );
    ipcMain.handle("app:get-default-projects-directory", () =>
        userDataService.getDefaultProjectsDirectory(),
    );
    ipcMain.handle("app:get-project-by-id", (_event, projectId: string) =>
        userDataService.getProjectById(projectId),
    );
    ipcMain.handle(
        "app:create-project",
        (_event, payload: CreateProjectPayload) =>
            userDataService.createProject(payload),
    );
    ipcMain.handle("app:delete-project", (_event, projectId: string) =>
        userDataService.deleteProject(projectId),
    );
    ipcMain.handle("app:save-files", (_event, files: UploadedFileData[]) =>
        userDataService.saveFiles(files),
    );
    ipcMain.handle("app:get-files-by-ids", (_event, fileIds: string[]) =>
        userDataService.getFilesByIds(fileIds),
    );
    ipcMain.handle("app:open-saved-file", async (_event, fileId: string) => {
        const file = userDataService.getFileById(fileId);

        if (!file) {
            return false;
        }

        const openResult = await shell.openPath(file.path);
        return openResult === "";
    });
    ipcMain.handle(
        "app:exec-shell-command",
        (_event, command: string, cwd?: string) =>
            commandExecService.execute(command, cwd),
    );
    ipcMain.handle(
        "app:pick-files",
        async (event, options?: { accept?: string[]; multiple?: boolean }) => {
            const currentWindow = BrowserWindow.fromWebContents(event.sender);

            const accept = options?.accept ?? [];
            const filters =
                accept.length > 0
                    ? [
                          {
                              name: "Allowed files",
                              extensions: accept
                                  .flatMap((item) =>
                                      item
                                          .split(",")
                                          .map((part) =>
                                              part.trim().toLowerCase(),
                                          ),
                                  )
                                  .flatMap((item) =>
                                      item === "image/*"
                                          ? imageExtensions
                                          : [item],
                                  )
                                  .map((item) =>
                                      item.startsWith(".")
                                          ? item.slice(1)
                                          : item
                                                .replace(/^[*]/, "")
                                                .replace(/^[.]/, ""),
                                  )
                                  .filter((item) => item && item !== "*"),
                          },
                      ]
                    : [];

            const dialogProperties: Array<"openFile" | "multiSelections"> = [
                "openFile",
            ];

            if (options?.multiple) {
                dialogProperties.push("multiSelections");
            }

            const openDialogOptions = {
                properties: dialogProperties,
                filters,
            };

            const selection = currentWindow
                ? await dialog.showOpenDialog(currentWindow, openDialogOptions)
                : await dialog.showOpenDialog(openDialogOptions);

            if (selection.canceled || selection.filePaths.length === 0) {
                return [] satisfies UploadedFileData[];
            }

            const files = await Promise.all(
                selection.filePaths.map(
                    async (filePath): Promise<UploadedFileData> => {
                        const buffer = await readFile(filePath);
                        const mimeType = getMimeTypeByExtension(filePath);

                        return {
                            name: path.basename(filePath),
                            mimeType,
                            size: buffer.byteLength,
                            dataUrl: `data:${mimeType};base64,${buffer.toString("base64")}`,
                        };
                    },
                ),
            );

            return files;
        },
    );

    ipcMain.handle(
        "app:pick-path",
        async (event, options?: { forFolders?: boolean }) => {
            const currentWindow = BrowserWindow.fromWebContents(event.sender);
            const dialogProperties: Array<"openFile" | "openDirectory"> = [
                options?.forFolders ? "openDirectory" : "openFile",
            ];

            const openDialogOptions = {
                properties: dialogProperties,
            };

            const selection = currentWindow
                ? await dialog.showOpenDialog(currentWindow, openDialogOptions)
                : await dialog.showOpenDialog(openDialogOptions);

            if (selection.canceled || selection.filePaths.length === 0) {
                return null;
            }

            return selection.filePaths[0] ?? null;
        },
    );

    createWindow();
});
