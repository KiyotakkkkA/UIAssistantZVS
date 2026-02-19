import { useCallback, useEffect } from "react";
import type { ChatDialog } from "../../types/Chat";
import { chatsStore } from "../../stores/chatsStore";

export const useDialogs = () => {
    useEffect(() => {
        chatsStore.initialize();
    }, []);

    const dialogs = chatsStore.dialogs;
    const activeDialogId = chatsStore.activeDialog?.id ?? "";
    const canDeleteDialog = dialogs.length > 1;

    const switchDialog = useCallback(async (dialogId: string) => {
        if (!dialogId || dialogId === chatsStore.activeDialog?.id) {
            return;
        }

        await chatsStore.switchDialog(dialogId);
    }, []);

    const createDialog = useCallback(
        async (title?: string): Promise<ChatDialog | null> => {
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
        },
        [],
    );

    const renameDialog = useCallback(
        async (dialogId: string, title: string) => {
            const trimmedTitle = title.trim();

            if (!trimmedTitle) {
                return;
            }

            await chatsStore.renameDialog(dialogId, trimmedTitle);
        },
        [],
    );

    const deleteDialog = useCallback(async (dialogId: string) => {
        if (chatsStore.dialogs.length <= 1) {
            return;
        }

        await chatsStore.deleteDialog(dialogId);
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
