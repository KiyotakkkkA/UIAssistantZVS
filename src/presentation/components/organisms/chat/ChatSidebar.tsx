import { useMemo, useState } from "react";
import { observer } from "mobx-react-lite";
import { useDialogs, useToasts } from "../../../../hooks";
import { Button, Dropdown, InputSmall, Modal } from "../../atoms";
import { ConversationItem } from "../../molecules";
import { Icon } from "@iconify/react";

export const ChatSidebar = observer(function ChatSidebar() {
    const toasts = useToasts();
    const {
        dialogs,
        activeDialogId,
        createDialog,
        renameDialog,
        deleteDialog,
        switchDialog,
        canDeleteDialog,
    } = useDialogs();

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editMode, setEditMode] = useState<"create" | "rename">("create");
    const [dialogName, setDialogName] = useState("");
    const [targetDialogId, setTargetDialogId] = useState<string | null>(null);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteDialogId, setDeleteDialogId] = useState<string | null>(null);

    const editModalTitle = useMemo(
        () =>
            editMode === "create" ? "Создать диалог" : "Переименовать диалог",
        [editMode],
    );

    const openCreateModal = () => {
        setEditMode("create");
        setDialogName("");
        setTargetDialogId(null);
        setIsEditModalOpen(true);
    };

    const createOptionsList = [
        {
            value: "dialog",
            label: "Новый диалог",
            icon: <Icon icon="mdi:plus-circle-outline" width={20} />,
            onClick: openCreateModal,
        },
        {
            value: "project",
            label: "Новый проект",
            icon: <Icon icon="mdi:plus-box-multiple" width={20} />,
        },
    ];

    const openRenameModal = (dialogId: string) => {
        const current = dialogs.find((dialog) => dialog.id === dialogId);

        setEditMode("rename");
        setTargetDialogId(dialogId);
        setDialogName(current?.title ?? "");
        setIsEditModalOpen(true);
    };

    const closeEditModal = () => {
        setIsEditModalOpen(false);
        setDialogName("");
        setTargetDialogId(null);
    };

    const submitEditModal = async () => {
        const nextName = dialogName.trim();

        if (!nextName) {
            toasts.warning({
                title: "Введите название",
                description: "Название диалога не может быть пустым.",
            });
            return;
        }

        if (editMode === "create") {
            await createDialog(nextName);
            toasts.success({
                title: "Диалог создан",
                description: "Новый диалог добавлен в рабочую область.",
            });
            closeEditModal();
            return;
        }

        if (!targetDialogId) {
            return;
        }

        await renameDialog(targetDialogId, nextName);
        toasts.success({
            title: "Диалог обновлён",
            description: "Название диалога успешно изменено.",
        });
        closeEditModal();
    };

    const openDeleteModal = (dialogId: string) => {
        if (!canDeleteDialog) {
            toasts.warning({
                title: "Нельзя удалить",
                description:
                    "В рабочей области должен остаться хотя бы один диалог.",
            });
            return;
        }

        setDeleteDialogId(dialogId);
        setIsDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setDeleteDialogId(null);
    };

    const confirmDelete = async () => {
        if (!deleteDialogId) {
            return;
        }

        await deleteDialog(deleteDialogId);
        toasts.info({
            title: "Диалог удалён",
            description: "Диалог был удалён из списка.",
        });
        closeDeleteModal();
    };

    return (
        <aside className="flex h-full w-[320px] flex-col bg-main-900/85 p-4 border-r border-main-300/20 backdrop-blur-md">
            <div className="flex items-center justify-between gap-2 border-b border-main-600 pb-4 ">
                <p className="text-xs uppercase tracking-[0.18em] text-main-400">
                    Рабочая область
                </p>
                <Dropdown
                    options={createOptionsList}
                    menuPlacement="bottom"
                    menuClassName="left-auto right-0"
                    matchTriggerWidth={false}
                    renderTrigger={({
                        toggleOpen,
                        triggerRef,
                        disabled,
                        ariaProps,
                    }) => (
                        <Button
                            label="Создать"
                            className="p-2 text-sm"
                            ref={triggerRef}
                            disabled={disabled}
                            onClick={toggleOpen}
                            {...ariaProps}
                        >
                            + Создать
                        </Button>
                    )}
                />
            </div>

            <div className="mt-4 flex-1 space-y-2 overflow-y-auto pr-1">
                {dialogs.map((conversation) => (
                    <ConversationItem
                        key={conversation.id}
                        active={conversation.id === activeDialogId}
                        onSelect={switchDialog}
                        onRename={openRenameModal}
                        onDelete={openDeleteModal}
                        canDelete={canDeleteDialog}
                        {...conversation}
                    />
                ))}
            </div>

            <Modal
                open={isEditModalOpen}
                onClose={closeEditModal}
                title={editModalTitle}
                className="max-w-md"
                footer={
                    <>
                        <Button
                            variant="secondary"
                            shape="rounded-lg"
                            className="h-9 px-4"
                            onClick={closeEditModal}
                        >
                            Отмена
                        </Button>
                        <Button
                            variant="primary"
                            shape="rounded-lg"
                            className="h-9 px-4"
                            onClick={submitEditModal}
                        >
                            Сохранить
                        </Button>
                    </>
                }
            >
                <div className="space-y-2">
                    <p className="text-sm text-main-300">Название диалога</p>
                    <InputSmall
                        value={dialogName}
                        onChange={(event) => setDialogName(event.target.value)}
                        placeholder="Введите название"
                        autoFocus
                        onKeyDown={(event) => {
                            if (event.key === "Enter") {
                                event.preventDefault();
                                void submitEditModal();
                            }
                        }}
                    />
                </div>
            </Modal>

            <Modal
                open={isDeleteModalOpen}
                onClose={closeDeleteModal}
                title="Удаление диалога"
                className="max-w-md"
                footer={
                    <>
                        <Button
                            variant="secondary"
                            shape="rounded-lg"
                            className="h-9 px-4"
                            onClick={closeDeleteModal}
                        >
                            Отмена
                        </Button>
                        <Button
                            variant="primary"
                            shape="rounded-lg"
                            className="h-9 px-4"
                            onClick={confirmDelete}
                        >
                            Удалить
                        </Button>
                    </>
                }
            >
                <p className="text-sm text-main-300">
                    Подтвердите удаление выбранного диалога.
                </p>
            </Modal>
        </aside>
    );
});
