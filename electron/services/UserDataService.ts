import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { createBaseDialog, defaultProfile } from "../static/data";
import { staticThemesMap, staticThemesList } from "../static/themes";
import type {
    BootData,
    ChatDriver,
    ThemeData,
    ThemeListItem,
    UserProfile,
} from "../../src/types/App";
import type {
    ChatDialog,
    ChatDialogListItem,
    ChatMessage,
    DeleteDialogResult,
} from "../../src/types/Chat";

const isChatDriver = (value: unknown): value is ChatDriver => {
    return value === "ollama" || value === "";
};

export class UserDataService {
    private readonly resourcesPath: string;
    private readonly themesPath: string;
    private readonly dialogsPath: string;
    private readonly profilePath: string;

    constructor(basePath: string) {
        this.resourcesPath = path.join(basePath, "resources");
        this.themesPath = path.join(this.resourcesPath, "themes");
        this.dialogsPath = path.join(this.resourcesPath, "chats", "dialogs");
        this.profilePath = path.join(this.resourcesPath, "profile.json");
    }

    getActiveDialog(): ChatDialog {
        const profile = this.readUserProfile();
        const dialogs = this.readDialogs();

        if (
            profile.activeDialogId &&
            dialogs.some((dialog) => dialog.id === profile.activeDialogId)
        ) {
            const activeDialog =
                dialogs.find(
                    (dialog) => dialog.id === profile.activeDialogId,
                ) ?? dialogs[0];

            return activeDialog;
        }

        if (dialogs.length > 0) {
            const fallbackActiveDialog = dialogs[0];
            this.updateUserProfile({ activeDialogId: fallbackActiveDialog.id });
            return fallbackActiveDialog;
        }

        const baseDialog = createBaseDialog();
        this.writeDialog(baseDialog);
        this.updateUserProfile({ activeDialogId: baseDialog.id });
        return baseDialog;
    }

    getDialogsList(): ChatDialogListItem[] {
        return this.readDialogs().map((dialog) =>
            this.toDialogListItem(dialog),
        );
    }

    getDialogById(dialogId: string): ChatDialog {
        const dialogs = this.readDialogs();
        const dialog = dialogs.find((item) => item.id === dialogId);

        if (dialog) {
            this.updateUserProfile({ activeDialogId: dialog.id });
            return dialog;
        }

        return this.getActiveDialog();
    }

    createDialog(): ChatDialog {
        const baseDialog = createBaseDialog();
        this.writeDialog(baseDialog);
        this.updateUserProfile({ activeDialogId: baseDialog.id });
        return baseDialog;
    }

    renameDialog(dialogId: string, nextTitle: string): ChatDialog {
        const dialog = this.getDialogById(dialogId);
        const trimmedTitle = nextTitle.trim();

        const updatedDialog: ChatDialog = {
            ...dialog,
            title: trimmedTitle || dialog.title,
            updatedAt: new Date().toISOString(),
        };

        this.writeDialog(updatedDialog);
        return updatedDialog;
    }

    deleteDialog(dialogId: string): DeleteDialogResult {
        const dialogPath = path.join(this.dialogsPath, `${dialogId}.json`);

        if (fs.existsSync(dialogPath)) {
            fs.unlinkSync(dialogPath);
        }

        let dialogs = this.readDialogs();

        if (dialogs.length === 0) {
            const fallbackDialog = createBaseDialog();
            this.writeDialog(fallbackDialog);
            dialogs = [fallbackDialog];
        }

        this.updateUserProfile({ activeDialogId: dialogs[0].id });

        return {
            dialogs: dialogs.map((dialog) => this.toDialogListItem(dialog)),
            activeDialog: dialogs[0],
        };
    }

    deleteMessageFromDialog(dialogId: string, messageId: string): ChatDialog {
        const dialog = this.getDialogById(dialogId);

        const targetMessage = dialog.messages.find(
            (message) => message.id === messageId,
        );

        if (!targetMessage) {
            return dialog;
        }

        const nextMessages = dialog.messages.filter(
            (message) =>
                message.id !== messageId && message.answeringAt !== messageId,
        );

        const updatedDialog: ChatDialog = {
            ...dialog,
            messages: nextMessages,
            updatedAt: new Date().toISOString(),
        };

        this.writeDialog(updatedDialog);
        return updatedDialog;
    }

    truncateDialogFromMessage(dialogId: string, messageId: string): ChatDialog {
        const dialog = this.getDialogById(dialogId);
        const messageIndex = dialog.messages.findIndex(
            (message) => message.id === messageId,
        );

        if (messageIndex === -1) {
            return dialog;
        }

        const updatedDialog: ChatDialog = {
            ...dialog,
            messages: dialog.messages.slice(0, messageIndex),
            updatedAt: new Date().toISOString(),
        };

        this.writeDialog(updatedDialog);
        return updatedDialog;
    }

    saveDialogSnapshot(dialog: ChatDialog): ChatDialog {
        const normalizedMessages = dialog.messages.map((message) =>
            this.normalizeMessage(message),
        );

        const normalizedDialog: ChatDialog = {
            id: this.normalizeDialogId(dialog.id),
            title:
                typeof dialog.title === "string" && dialog.title.trim()
                    ? dialog.title
                    : "Новый диалог",
            messages: normalizedMessages,
            createdAt:
                typeof dialog.createdAt === "string" && dialog.createdAt
                    ? dialog.createdAt
                    : new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        this.writeDialog(normalizedDialog);
        this.updateUserProfile({ activeDialogId: normalizedDialog.id });
        return normalizedDialog;
    }

    getBootData(): BootData {
        const userProfile = this.readUserProfile();
        const preferredThemeData = this.resolveThemePalette(
            userProfile.themePreference,
        );

        return {
            userProfile,
            preferredThemeData,
        };
    }

    getThemesList(): ThemeListItem[] {
        const themes = this.readThemes();
        if (themes.length === 0) {
            return staticThemesList;
        }

        return themes.map((theme) => ({
            id: theme.id,
            name: theme.name,
        }));
    }

    getThemeData(themeId: string): ThemeData {
        const themes = this.readThemes();
        const preferredTheme = themes.find((theme) => theme.id === themeId);

        if (preferredTheme) {
            return preferredTheme;
        }

        const fallbackTheme = staticThemesMap[themeId];
        if (fallbackTheme) {
            return fallbackTheme;
        }

        return staticThemesMap[defaultProfile.themePreference];
    }

    updateUserProfile(nextProfile: Partial<UserProfile>): UserProfile {
        const currentProfile = this.readUserProfile();
        const mergedProfile: UserProfile = {
            ...currentProfile,
            ...nextProfile,
        };

        fs.writeFileSync(
            this.profilePath,
            JSON.stringify(mergedProfile, null, 2),
        );
        return mergedProfile;
    }

    private readUserProfile(): UserProfile {
        if (!fs.existsSync(this.profilePath)) {
            return defaultProfile;
        }

        try {
            const rawProfile = fs.readFileSync(this.profilePath, "utf-8");
            const parsed = JSON.parse(rawProfile) as Partial<UserProfile>;

            const normalized: UserProfile = {
                ...defaultProfile,
                ...(typeof parsed.themePreference === "string"
                    ? { themePreference: parsed.themePreference }
                    : {}),
                ...(typeof parsed.ollamaModel === "string"
                    ? { ollamaModel: parsed.ollamaModel }
                    : {}),
                ...(typeof parsed.ollamaToken === "string"
                    ? { ollamaToken: parsed.ollamaToken }
                    : {}),
                ...(isChatDriver(parsed.chatDriver)
                    ? { chatDriver: parsed.chatDriver }
                    : {}),
                ...(typeof parsed.assistantName === "string"
                    ? { assistantName: parsed.assistantName }
                    : {}),
                ...(typeof parsed.maxToolCallsPerResponse === "number" &&
                Number.isFinite(parsed.maxToolCallsPerResponse)
                    ? {
                          maxToolCallsPerResponse:
                              parsed.maxToolCallsPerResponse,
                      }
                    : {}),
                ...(typeof parsed.userName === "string"
                    ? { userName: parsed.userName }
                    : {}),
                ...(typeof parsed.userPrompt === "string"
                    ? { userPrompt: parsed.userPrompt }
                    : {}),
                ...(typeof parsed.activeDialogId === "string"
                    ? { activeDialogId: parsed.activeDialogId }
                    : {}),
            };

            return normalized;
        } catch {
            return defaultProfile;
        }
    }

    private readThemes(): ThemeData[] {
        if (!fs.existsSync(this.themesPath)) {
            return [];
        }

        const files = fs
            .readdirSync(this.themesPath)
            .filter((fileName) => fileName.endsWith(".json"));

        const result: ThemeData[] = [];

        for (const fileName of files) {
            const filePath = path.join(this.themesPath, fileName);

            try {
                const rawTheme = fs.readFileSync(filePath, "utf-8");
                const parsed = JSON.parse(rawTheme) as ThemeData;

                if (
                    typeof parsed.id === "string" &&
                    typeof parsed.name === "string" &&
                    typeof parsed.palette === "object" &&
                    parsed.palette !== null
                ) {
                    result.push(parsed);
                }
            } catch {
                continue;
            }
        }

        return result;
    }

    private readDialogs(): ChatDialog[] {
        if (!fs.existsSync(this.dialogsPath)) {
            return [];
        }

        const files = fs
            .readdirSync(this.dialogsPath)
            .filter((fileName) => fileName.endsWith(".json"));

        const dialogs: ChatDialog[] = [];

        for (const fileName of files) {
            const filePath = path.join(this.dialogsPath, fileName);

            try {
                const rawDialog = fs.readFileSync(filePath, "utf-8");
                const parsed = JSON.parse(rawDialog) as Partial<ChatDialog>;

                if (!Array.isArray(parsed.messages)) {
                    continue;
                }

                const normalizedMessages = parsed.messages
                    .map((message) =>
                        this.normalizeMessage(message as ChatMessage),
                    )
                    .filter(Boolean);

                dialogs.push({
                    id: this.normalizeDialogId(parsed.id),
                    title:
                        typeof parsed.title === "string" && parsed.title.trim()
                            ? parsed.title
                            : "Новый диалог",
                    messages: normalizedMessages,
                    createdAt:
                        typeof parsed.createdAt === "string" && parsed.createdAt
                            ? parsed.createdAt
                            : new Date().toISOString(),
                    updatedAt:
                        typeof parsed.updatedAt === "string" && parsed.updatedAt
                            ? parsed.updatedAt
                            : new Date().toISOString(),
                });
            } catch {
                continue;
            }
        }

        dialogs.sort((left, right) =>
            right.updatedAt.localeCompare(left.updatedAt),
        );

        return dialogs;
    }

    private writeDialog(dialog: ChatDialog): void {
        if (!fs.existsSync(this.dialogsPath)) {
            fs.mkdirSync(this.dialogsPath, { recursive: true });
        }

        const dialogPath = path.join(this.dialogsPath, `${dialog.id}.json`);
        fs.writeFileSync(dialogPath, JSON.stringify(dialog, null, 2));
    }

    private normalizeDialogId(id: unknown): string {
        if (typeof id === "string" && id.startsWith("dialog_")) {
            return id;
        }

        return `dialog_${randomUUID().replace(/-/g, "")}`;
    }

    private normalizeMessage(message: ChatMessage): ChatMessage {
        const rawAuthor = (message as { author?: string }).author;

        const role =
            rawAuthor === "assistant" ||
            rawAuthor === "user" ||
            rawAuthor === "system"
                ? rawAuthor
                : "assistant";

        const migratedStage =
            rawAuthor === "tool"
                ? "tool"
                : rawAuthor === "thinking"
                  ? "thinking"
                  : undefined;

        const assistantStage =
            role === "assistant"
                ? message.assistantStage === "tool" ||
                  message.assistantStage === "thinking" ||
                  message.assistantStage === "answer"
                    ? message.assistantStage
                    : migratedStage || "answer"
                : undefined;

        const toolTrace =
            role === "assistant" && assistantStage === "tool"
                ? message.toolTrace &&
                  typeof message.toolTrace.callId === "string" &&
                  typeof message.toolTrace.toolName === "string" &&
                  typeof message.toolTrace.args === "object" &&
                  message.toolTrace.args !== null
                    ? message.toolTrace
                    : undefined
                : undefined;

        return {
            id:
                typeof message.id === "string" && message.id.startsWith("msg_")
                    ? message.id
                    : `msg_${randomUUID().replace(/-/g, "")}`,
            author: role,
            content: typeof message.content === "string" ? message.content : "",
            timestamp:
                typeof message.timestamp === "string" && message.timestamp
                    ? message.timestamp
                    : new Date().toLocaleTimeString("ru-RU", {
                          hour: "2-digit",
                          minute: "2-digit",
                      }),
            ...(typeof message.answeringAt === "string"
                ? { answeringAt: message.answeringAt }
                : {}),
            ...(assistantStage ? { assistantStage } : {}),
            ...(toolTrace ? { toolTrace } : {}),
        };
    }

    private resolveThemePalette(themeId: string): Record<string, string> {
        const themes = this.readThemes();
        const preferredTheme = themes.find((theme) => theme.id === themeId);

        if (preferredTheme) {
            return preferredTheme.palette;
        }

        return staticThemesMap[defaultProfile.themePreference].palette;
    }

    private toDialogListItem(dialog: ChatDialog): ChatDialogListItem {
        const lastMessage =
            dialog.messages.length > 0
                ? dialog.messages[dialog.messages.length - 1]
                : null;

        return {
            id: dialog.id,
            title: dialog.title,
            preview:
                lastMessage?.content?.trim() ||
                "Пустой диалог — отправьте первое сообщение",
            time: new Date(dialog.updatedAt).toLocaleTimeString("ru-RU", {
                hour: "2-digit",
                minute: "2-digit",
            }),
            updatedAt: dialog.updatedAt,
        };
    }
}
