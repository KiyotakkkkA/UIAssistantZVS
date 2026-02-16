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
import { createUserDataPaths } from "./userData/UserDataPaths";
import { UserProfileService } from "./userData/UserProfileService";
import { ThemesService } from "./userData/ThemesService";
import { DialogsService } from "./userData/DialogsService";

export class UserDataService {
    private readonly userProfileService: UserProfileService;
    private readonly themesService: ThemesService;
    private readonly dialogsService: DialogsService;

    constructor(basePath: string) {
        const paths = createUserDataPaths(basePath);

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
}
