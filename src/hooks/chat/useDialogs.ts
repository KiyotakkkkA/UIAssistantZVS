import type { ChatDialog } from "../../types/Chat";
import { useEffect } from "react";
import { chatsStore } from "../../stores/chatsStore";

export const useDialogs = () => {
    const dialogs = chatsStore.dialogs;
    const activeDialogId = chatsStore.activeDialog?.id ?? "";

    const canDeleteDialog = dialogs.length > 1;

    const switchDialog = async (dialogId: string) => {
        if (!dialogId || dialogId === activeDialogId) {
            return;
        }

        await chatsStore.switchDialog(dialogId);
    };

    const createDialog = async (title?: string): Promise<ChatDialog | null> => {
        const createdDialog = await chatsStore.createDialog();

        if (!createdDialog) {
            return null;
        }

        const trimmedTitle = title?.trim() ?? "";

        if (!trimmedTitle) {
            return createdDialog;
        }

        const renamedDialog = await chatsStore.renameDialog(
            createdDialog.id,
            trimmedTitle,
        );

        return renamedDialog ?? createdDialog;
    };

    const renameDialog = async (dialogId: string, title: string) => {
        const trimmedTitle = title.trim();

        if (!trimmedTitle) {
            return;
        }

        await chatsStore.renameDialog(dialogId, trimmedTitle);
    };

    const deleteDialog = async (dialogId: string) => {
        if (!canDeleteDialog) {
            return;
        }

        await chatsStore.deleteDialog(dialogId);
    };
    useEffect(() => {
        chatsStore.initialize();
    }, []);

    return {
        dialogs,
        activeDialogId,
        isReady: chatsStore.isReady,
        isSwitchingDialog: chatsStore.isSwitchingDialog,
        canDeleteDialog,
        switchDialog,
        createDialog,
        renameDialog,
        deleteDialog,
    };
};
