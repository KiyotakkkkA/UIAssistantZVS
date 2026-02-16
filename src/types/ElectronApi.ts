import type { BootData, ThemeData, ThemeListItem, UserProfile } from "./App";
import type {
    ChatDialog,
    ChatDialogListItem,
    DeleteDialogResult,
} from "./Chat";
import type {
    CreateProjectPayload,
    DeleteProjectResult,
    Project,
    ProjectListItem,
} from "./Project";

export type ExecShellCommandResult = {
    command: string;
    cwd: string;
    isAdmin: false;
    exitCode: number;
    stdout: string;
    stderr: string;
};

export type UploadedFileData = {
    name: string;
    mimeType: string;
    size: number;
    dataUrl: string;
};

export type FileManifestEntry = {
    path: string;
    originalName: string;
    size: number;
    savedAt: string;
};

export type SavedFileRecord = FileManifestEntry & {
    id: string;
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

export type AppApiUploadNamespace = {
    pickFiles: (options?: {
        accept?: string[];
        multiple?: boolean;
    }) => Promise<UploadedFileData[]>;
};

export type AppApiFilesNamespace = {
    saveFiles: (files: UploadedFileData[]) => Promise<SavedFileRecord[]>;
    getFilesByIds: (fileIds: string[]) => Promise<SavedFileRecord[]>;
    openFile: (fileId: string) => Promise<boolean>;
};

export type AppApiProjectsNamespace = {
    getProjectsList: () => Promise<ProjectListItem[]>;
    getProjectById: (projectId: string) => Promise<Project | null>;
    createProject: (payload: CreateProjectPayload) => Promise<Project>;
    deleteProject: (projectId: string) => Promise<DeleteProjectResult>;
};

export type AppApi = {
    boot: AppApiBootNamespace;
    themes: AppApiThemesNamespace;
    profile: AppApiProfileNamespace;
    dialogs: AppApiDialogsNamespace;
    tools: AppApiToolsNamespace;
    shell: AppApiShellNamespace;
    upload: AppApiUploadNamespace;
    files: AppApiFilesNamespace;
    projects: AppApiProjectsNamespace;
};
