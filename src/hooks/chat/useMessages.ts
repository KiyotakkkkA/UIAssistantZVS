import { useState } from "react";
import { chatsStore } from "../../stores/chatsStore";
import { commandExecApprovalService } from "../../services/commandExecApproval";
import { useToasts } from "../useToasts";

type UseMessagesParams = {
    sendMessage: (content: string) => void;
};

export const useMessages = ({ sendMessage }: UseMessagesParams) => {
    const toasts = useToasts();

    const [deleteMessageId, setDeleteMessageId] = useState<string | null>(null);
    const [editingMessageId, setEditingMessageId] = useState<string | null>(
        null,
    );
    const [editingValue, setEditingValue] = useState("");

    const startEdit = (messageId: string, content: string) => {
        setEditingMessageId(messageId);
        setEditingValue(content);
    };

    const cancelEdit = () => {
        setEditingMessageId(null);
        setEditingValue("");
    };

    const copyMessage = async (content: string) => {
        try {
            await navigator.clipboard.writeText(content);
            toasts.success({
                title: "Скопировано",
                description: "Сообщение скопировано в буфер обмена.",
            });
        } catch {
            toasts.danger({
                title: "Ошибка копирования",
                description: "Не удалось скопировать сообщение.",
            });
        }
    };

    const requestDeleteMessage = (messageId: string) => {
        setDeleteMessageId(messageId);
    };

    const cancelDeleteMessage = () => {
        setDeleteMessageId(null);
    };

    const setToolTraceStatus = (
        messageId: string,
        status: "accepted" | "cancelled" | "answered",
    ) => {
        const dialog = chatsStore.activeDialog;
        if (!dialog) return;

        chatsStore.replaceByDialog({
            ...dialog,
            messages: dialog.messages.map((message) =>
                message.id === messageId && message.toolTrace
                    ? {
                          ...message,
                          toolTrace: { ...message.toolTrace, status },
                      }
                    : message,
            ),
            updatedAt: new Date().toISOString(),
        });
    };

    const sendQaAnswer = (qaMessageId: string, answer: string) => {
        setToolTraceStatus(qaMessageId, "answered");
        sendMessage(`__qa_hidden__${answer}`);
    };

    const truncateAndResend = async (messageId: string, content: string) => {
        const dialog = chatsStore.activeDialog;
        const trimmedContent = content.trim();

        if (!dialog || !trimmedContent) {
            return;
        }

        const api = window.appApi;

        if (api?.dialogs.truncateDialogFromMessage) {
            const updatedDialog = await api.dialogs.truncateDialogFromMessage(
                dialog.id,
                messageId,
            );
            chatsStore.replaceByDialog(updatedDialog);
        } else {
            const index = dialog.messages.findIndex(
                (message) => message.id === messageId,
            );
            if (index !== -1) {
                chatsStore.replaceByDialog({
                    ...dialog,
                    messages: dialog.messages.slice(0, index),
                    updatedAt: new Date().toISOString(),
                });
            }
        }

        cancelEdit();
        sendMessage(trimmedContent);
    };

    const submitEdit = async () => {
        if (!editingMessageId) {
            return;
        }

        const trimmedContent = editingValue.trim();

        if (!trimmedContent) {
            toasts.warning({
                title: "Пустое сообщение",
                description: "Введите текст перед отправкой.",
            });
            return;
        }

        await truncateAndResend(editingMessageId, trimmedContent);
    };

    const retryMessage = async (messageId: string, content: string) => {
        await truncateAndResend(messageId, content);
    };

    const confirmDeleteMessage = async () => {
        const dialog = chatsStore.activeDialog;

        if (!dialog || !deleteMessageId) {
            return;
        }

        const api = window.appApi;

        if (api?.dialogs.deleteMessageFromDialog) {
            const updatedDialog = await api.dialogs.deleteMessageFromDialog(
                dialog.id,
                deleteMessageId,
            );
            chatsStore.replaceByDialog(updatedDialog);
        } else {
            chatsStore.replaceByDialog({
                ...dialog,
                messages: dialog.messages.filter(
                    (message) =>
                        message.id !== deleteMessageId &&
                        message.answeringAt !== deleteMessageId,
                ),
                updatedAt: new Date().toISOString(),
            });
        }

        toasts.info({
            title: "Сообщение удалено",
            description: "Сообщение удалено из текущего диалога.",
        });

        setDeleteMessageId(null);
    };

    const setCommandExecStatus = (
        messageId: string,
        status: "accepted" | "cancelled",
    ) => {
        setToolTraceStatus(messageId, status);
    };

    const approveCommandExec = (messageId: string) => {
        setCommandExecStatus(messageId, "accepted");
        commandExecApprovalService.resolve(messageId, true);
    };

    const rejectCommandExec = (messageId: string) => {
        setCommandExecStatus(messageId, "cancelled");
        commandExecApprovalService.resolve(messageId, false);
    };

    return {
        editingMessageId,
        editingValue,
        setEditingValue,
        startEdit,
        cancelEdit,
        submitEdit,
        retryMessage,
        copyMessage,
        deleteMessageId,
        requestDeleteMessage,
        cancelDeleteMessage,
        confirmDeleteMessage,
        approveCommandExec,
        rejectCommandExec,
        sendQaAnswer,
    };
};
