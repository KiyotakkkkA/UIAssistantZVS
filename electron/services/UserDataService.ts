import type {
    BootData,
    ThemeData,
    ThemeListItem,
    UserProfile,
} from "../../src/types/App";
import type {
    ChatDialog,
    ChatDialogListItem,
    DeleteDialogResult,
} from "../../src/types/Chat";
import { randomUUID } from "node:crypto";
import type { UploadedFileData } from "../../src/types/ElectronApi";
import type { SavedFileRecord } from "../../src/types/ElectronApi";
import type {
    CreateProjectPayload,
    DeleteProjectResult,
    Project,
    ProjectListItem,
} from "../../src/types/Project";
import path from "node:path";
import { createUserDataPaths } from "./userData/UserDataPaths";
import { UserProfileService } from "./userData/UserProfileService";
import { ThemesService } from "./userData/ThemesService";
import { DialogsService } from "./userData/DialogsService";
import { ProjectsService } from "./userData/ProjectsService";
import { FileStorageService } from "./FileStorageService";

export class UserDataService {
    private readonly userProfileService: UserProfileService;
    private readonly themesService: ThemesService;
    private readonly dialogsService: DialogsService;
    private readonly projectsService: ProjectsService;
    private readonly fileStorageService: FileStorageService;
    private readonly defaultProjectsDirectory: string;

    constructor(basePath: string) {
        const paths = createUserDataPaths(basePath);
        this.defaultProjectsDirectory = path.join(
            basePath,
            "resources",
            "projects",
        );

        this.userProfileService = new UserProfileService(paths.profilePath);
        this.themesService = new ThemesService(paths.themesPath);
        this.dialogsService = new DialogsService(
            paths.dialogsPath,
            (dialogId) => {
                this.userProfileService.updateUserProfile({
                    activeDialogId: dialogId,
                });
            },
        );
        this.projectsService = new ProjectsService(paths.projectsPath);
        this.fileStorageService = new FileStorageService(
            paths.filesPath,
            paths.storageManifestPath,
        );

        this.syncProjectDialogs();
    }

    getActiveDialog(): ChatDialog {
        const profile = this.userProfileService.getUserProfile();
        return this.dialogsService.getActiveDialog(profile.activeDialogId);
    }

    getDialogsList(): ChatDialogListItem[] {
        return this.dialogsService.getDialogsList();
    }

    getDialogById(dialogId: string): ChatDialog {
        const profile = this.userProfileService.getUserProfile();
        return this.dialogsService.getDialogById(
            dialogId,
            profile.activeDialogId,
        );
    }

    createDialog(): ChatDialog {
        return this.dialogsService.createDialog();
    }

    renameDialog(dialogId: string, nextTitle: string): ChatDialog {
        const profile = this.userProfileService.getUserProfile();
        return this.dialogsService.renameDialog(
            dialogId,
            nextTitle,
            profile.activeDialogId,
        );
    }

    deleteDialog(dialogId: string): DeleteDialogResult {
        return this.dialogsService.deleteDialog(dialogId);
    }

    deleteMessageFromDialog(dialogId: string, messageId: string): ChatDialog {
        const profile = this.userProfileService.getUserProfile();
        return this.dialogsService.deleteMessageFromDialog(
            dialogId,
            messageId,
            profile.activeDialogId,
        );
    }

    truncateDialogFromMessage(dialogId: string, messageId: string): ChatDialog {
        const profile = this.userProfileService.getUserProfile();
        return this.dialogsService.truncateDialogFromMessage(
            dialogId,
            messageId,
            profile.activeDialogId,
        );
    }

    saveDialogSnapshot(dialog: ChatDialog): ChatDialog {
        return this.dialogsService.saveDialogSnapshot(dialog);
    }

    getProjectsList(): ProjectListItem[] {
        return this.projectsService.getProjectsList();
    }

    getProjectById(projectId: string): Project | null {
        return this.projectsService.getProjectById(projectId);
    }

    getDefaultProjectsDirectory(): string {
        return this.defaultProjectsDirectory;
    }

    createProject(payload: CreateProjectPayload): Project {
        const projectId = `project_${randomUUID().replace(/-/g, "")}`;
        const dialog = this.dialogsService.createDialog(projectId);
        const nextTitle = payload.name.trim();
        const selectedBaseDirectory =
            payload.directoryPath?.trim() || this.defaultProjectsDirectory;

        if (nextTitle) {
            this.dialogsService.renameDialog(dialog.id, nextTitle);
        }

        return this.projectsService.createProject({
            ...payload,
            directoryPath: selectedBaseDirectory,
            dialogId: dialog.id,
            projectId,
        });
    }

    deleteProject(projectId: string): DeleteProjectResult {
        const deletedProject = this.projectsService.deleteProject(projectId);

        if (deletedProject) {
            this.fileStorageService.deleteFilesByIds(deletedProject.fileUUIDs);
            this.dialogsService.deleteDialog(deletedProject.dialogId);
        }

        return {
            projects: this.projectsService.getProjectsList(),
            deletedProjectId: projectId,
        };
    }

    saveFiles(files: UploadedFileData[]): SavedFileRecord[] {
        return this.fileStorageService.saveFiles(files);
    }

    getFilesByIds(fileIds: string[]): SavedFileRecord[] {
        return this.fileStorageService.getFilesByIds(fileIds);
    }

    getFileById(fileId: string): SavedFileRecord | null {
        return this.fileStorageService.getFileById(fileId);
    }

    getBootData(): BootData {
        const userProfile = this.userProfileService.getUserProfile();
        const preferredThemeData = this.themesService.resolveThemePalette(
            userProfile.themePreference,
        );

        return {
            userProfile,
            preferredThemeData,
        };
    }

    getThemesList(): ThemeListItem[] {
        return this.themesService.getThemesList();
    }

    getThemeData(themeId: string): ThemeData {
        return this.themesService.getThemeData(themeId);
    }

    updateUserProfile(nextProfile: Partial<UserProfile>): UserProfile {
        return this.userProfileService.updateUserProfile(nextProfile);
    }

    private syncProjectDialogs(): void {
        const projects = this.projectsService.getProjectsList();

        for (const project of projects) {
            this.dialogsService.linkDialogToProject(
                project.dialogId,
                project.id,
            );
        }
    }
}
