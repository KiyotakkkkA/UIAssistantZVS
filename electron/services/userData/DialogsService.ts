import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { createBaseDialog } from "../../static/data";
import type {
    ChatDialog,
    ChatDialogListItem,
    ChatMessage,
    DeleteDialogResult,
} from "../../../src/types/Chat";

type ActiveDialogIdUpdater = (dialogId: string) => void;

export class DialogsService {
    constructor(
        private readonly dialogsPath: string,
        private readonly onActiveDialogIdUpdate: ActiveDialogIdUpdater,
    ) {}

    getActiveDialog(activeDialogId?: string): ChatDialog {
        const dialogs = this.readDialogs();

        if (activeDialogId) {
            const activeDialog = dialogs.find(
                (dialog) => dialog.id === activeDialogId,
            );

            if (activeDialog) {
                return activeDialog;
            }
        }

        const availableDialogs = dialogs.filter(
            (dialog) => dialog.forProjectId === null,
        );

        if (availableDialogs.length > 0) {
            const fallbackActiveDialog = availableDialogs[0];
            this.onActiveDialogIdUpdate(fallbackActiveDialog.id);
            return fallbackActiveDialog;
        }

        const baseDialog = createBaseDialog();
        this.writeDialog(baseDialog);
        this.onActiveDialogIdUpdate(baseDialog.id);
        return baseDialog;
    }

    getDialogsList(): ChatDialogListItem[] {
        return this.readDialogs()
            .filter((dialog) => dialog.forProjectId === null)
            .map((dialog) => this.toDialogListItem(dialog));
    }

    getDialogById(dialogId: string, activeDialogId?: string): ChatDialog {
        const dialogs = this.readDialogs();
        const dialog = dialogs.find((item) => item.id === dialogId);

        if (dialog) {
            this.onActiveDialogIdUpdate(dialog.id);
            return dialog;
        }

        return this.getActiveDialog(activeDialogId);
    }

    createDialog(forProjectId: string | null = null): ChatDialog {
        const baseDialog = createBaseDialog(forProjectId);
        this.writeDialog(baseDialog);
        this.onActiveDialogIdUpdate(baseDialog.id);
        return baseDialog;
    }

    linkDialogToProject(dialogId: string, projectId: string): void {
        const dialogs = this.readDialogs();
        const targetDialog = dialogs.find((dialog) => dialog.id === dialogId);

        if (!targetDialog || targetDialog.forProjectId === projectId) {
            return;
        }

        this.writeDialog({
            ...targetDialog,
            forProjectId: projectId,
            updatedAt: new Date().toISOString(),
        });
    }

    renameDialog(
        dialogId: string,
        nextTitle: string,
        activeDialogId?: string,
    ): ChatDialog {
        const dialog = this.getDialogById(dialogId, activeDialogId);
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

        const fallbackDialog =
            dialogs.find((dialog) => dialog.forProjectId === null) ||
            dialogs[0];

        this.onActiveDialogIdUpdate(fallbackDialog.id);

        return {
            dialogs: dialogs
                .filter((dialog) => dialog.forProjectId === null)
                .map((dialog) => this.toDialogListItem(dialog)),
            activeDialog: fallbackDialog,
        };
    }

    deleteMessageFromDialog(
        dialogId: string,
        messageId: string,
        activeDialogId?: string,
    ): ChatDialog {
        const dialog = this.getDialogById(dialogId, activeDialogId);

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

    truncateDialogFromMessage(
        dialogId: string,
        messageId: string,
        activeDialogId?: string,
    ): ChatDialog {
        const dialog = this.getDialogById(dialogId, activeDialogId);
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
            forProjectId: this.normalizeForProjectId(dialog.forProjectId),
            createdAt:
                typeof dialog.createdAt === "string" && dialog.createdAt
                    ? dialog.createdAt
                    : new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        this.writeDialog(normalizedDialog);
        this.onActiveDialogIdUpdate(normalizedDialog.id);
        return normalizedDialog;
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
                    forProjectId: this.normalizeForProjectId(
                        parsed.forProjectId,
                    ),
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

    private normalizeForProjectId(forProjectId: unknown): string | null {
        if (
            typeof forProjectId === "string" &&
            forProjectId.startsWith("project_")
        ) {
            return forProjectId;
        }

        return null;
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
