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
import type {
    CreateScenarioPayload,
    DeleteScenarioResult,
    Scenario,
    ScenarioListItem,
    UpdateScenarioPayload,
} from "./Scenario";

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

export type SaveImageFromSourcePayload = {
    src: string;
    preferredFileName?: string;
};

export type SaveImageFromSourceResult = {
    savedPath: string;
    fileName: string;
    mimeType: string;
    size: number;
    sourceKind: "remote" | "local" | "data-url";
};

export type AppCacheEntry = {
    collectedAt: number;
    ttlSeconds: number;
    expiresAt: number;
    data: unknown;
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
    pickPath: (options?: { forFolders?: boolean }) => Promise<string | null>;
};

export type AppApiFilesNamespace = {
    saveFiles: (files: UploadedFileData[]) => Promise<SavedFileRecord[]>;
    saveImageFromSource: (
        payload: SaveImageFromSourcePayload,
    ) => Promise<SaveImageFromSourceResult | null>;
    getFilesByIds: (fileIds: string[]) => Promise<SavedFileRecord[]>;
    openFile: (fileId: string) => Promise<boolean>;
    openPath: (targetPath: string) => Promise<boolean>;
    openExternalUrl: (url: string) => Promise<boolean>;
};

export type AppApiProjectsNamespace = {
    getProjectsList: () => Promise<ProjectListItem[]>;
    getDefaultProjectsDirectory: () => Promise<string>;
    getProjectById: (projectId: string) => Promise<Project | null>;
    createProject: (payload: CreateProjectPayload) => Promise<Project>;
    deleteProject: (projectId: string) => Promise<DeleteProjectResult>;
};

export type AppApiScenariosNamespace = {
    getScenariosList: () => Promise<ScenarioListItem[]>;
    getScenarioById: (scenarioId: string) => Promise<Scenario | null>;
    createScenario: (payload: CreateScenarioPayload) => Promise<Scenario>;
    updateScenario: (
        scenarioId: string,
        payload: UpdateScenarioPayload,
    ) => Promise<Scenario | null>;
    deleteScenario: (scenarioId: string) => Promise<DeleteScenarioResult>;
};

export type AppApiCacheNamespace = {
    getCacheEntry: (key: string) => Promise<AppCacheEntry | null>;
    setCacheEntry: (key: string, entry: AppCacheEntry) => Promise<void>;
};

export type AppApi = {
    boot: AppApiBootNamespace;
    themes: AppApiThemesNamespace;
    profile: AppApiProfileNamespace;
    dialogs: AppApiDialogsNamespace;
    shell: AppApiShellNamespace;
    upload: AppApiUploadNamespace;
    files: AppApiFilesNamespace;
    projects: AppApiProjectsNamespace;
    scenarios: AppApiScenariosNamespace;
    cache: AppApiCacheNamespace;
};
