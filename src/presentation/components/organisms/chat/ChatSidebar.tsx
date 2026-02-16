import { useMemo, useState } from "react";
import { observer } from "mobx-react-lite";
import { useNavigate } from "react-router-dom";
import { useDialogs, useProjects, useToasts } from "../../../../hooks";
import { Button, Dropdown, InputSmall, Modal } from "../../atoms";
import { ConversationItem } from "../../molecules";
import { Icon } from "@iconify/react";

export const ChatSidebar = observer(function ChatSidebar() {
    const navigate = useNavigate();
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
    const { projects, activeProjectId, clearActiveProject, deleteProject } =
        useProjects();

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editMode, setEditMode] = useState<"create" | "rename">("create");
    const [dialogName, setDialogName] = useState("");
    const [targetDialogId, setTargetDialogId] = useState<string | null>(null);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteDialogId, setDeleteDialogId] = useState<string | null>(null);
    const [isDeleteProjectModalOpen, setIsDeleteProjectModalOpen] =
        useState(false);
    const [deleteProjectId, setDeleteProjectId] = useState<string | null>(null);

    const editModalTitle = useMemo(
        () =>
            editMode === "create" ? "Создать диалог" : "Переименовать диалог",
        [editMode],
    );

    const openCreateModal = () => {
        navigate("/dialogs");
        setEditMode("create");
        setDialogName("");
        setTargetDialogId(null);
        setIsEditModalOpen(true);
    };

    const openProjectsPage = () => {
        navigate("/projects/create");
    };

    const selectDialogAndOpenPage = (dialogId: string) => {
        navigate("/dialogs");
        void switchDialog(dialogId);
    };

    const selectProjectAndOpenPage = async (projectId: string) => {
        navigate(`/projects/${projectId}`);
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
            onClick: openProjectsPage,
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

    const openDeleteProjectModal = (projectId: string) => {
        setDeleteProjectId(projectId);
        setIsDeleteProjectModalOpen(true);
    };

    const closeDeleteProjectModal = () => {
        setDeleteProjectId(null);
        setIsDeleteProjectModalOpen(false);
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

    const confirmDeleteProject = async () => {
        if (!deleteProjectId) {
            return;
        }

        const deleted = await deleteProject(deleteProjectId);

        if (!deleted) {
            toasts.warning({
                title: "Не удалось удалить",
                description: "Проект не найден или уже удалён.",
            });
            closeDeleteProjectModal();
            return;
        }

        if (activeProjectId === deleteProjectId) {
            clearActiveProject();
            navigate("/dialogs");
        }

        toasts.info({
            title: "Проект удалён",
            description: "Проект, его диалог и документы удалены.",
        });

        closeDeleteProjectModal();
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
                        onSelect={selectDialogAndOpenPage}
                        onRename={openRenameModal}
                        onDelete={openDeleteModal}
                        canDelete={canDeleteDialog}
                        {...conversation}
                    />
                ))}

                <div className="my-3 flex items-center gap-3 px-1">
                    <div className="h-px flex-1 bg-main-600/70" />
                    <p className="text-[10px] uppercase tracking-[0.2em] text-main-400">
                        Проекты
                    </p>
                    <div className="h-px flex-1 bg-main-600/70" />
                </div>

                {projects.length > 0 ? (
                    projects.map((project) => {
                        const isActive = project.id === activeProjectId;

                        return (
                            <div
                                role="button"
                                tabIndex={0}
                                key={project.id}
                                onClick={() => {
                                    void selectProjectAndOpenPage(project.id);
                                }}
                                onKeyDown={(event) => {
                                    if (
                                        event.key === "Enter" ||
                                        event.key === " "
                                    ) {
                                        event.preventDefault();
                                        void selectProjectAndOpenPage(
                                            project.id,
                                        );
                                    }
                                }}
                                className={`w-full rounded-xl p-3 text-left transition-colors cursor-pointer hover:bg-main-600/70 ${
                                    isActive
                                        ? "bg-main-500/20"
                                        : "bg-transparent"
                                }`}
                            >
                                <div className="flex items-center justify-between gap-2">
                                    <div className="flex min-w-0 flex-1 items-center gap-2">
                                        <p className="truncate text-sm font-medium text-main-100">
                                            {project.title}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <span className="text-xs text-main-400">
                                            {project.time}
                                        </span>
                                        <Button
                                            variant=""
                                            className="border-transparent items-center justify-center rounded-lg cursor-pointer text-base text-main-300 hover:bg-main-700/70 hover:text-main-100"
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                openDeleteProjectModal(
                                                    project.id,
                                                );
                                            }}
                                            aria-label="Удалить проект"
                                        >
                                            <Icon
                                                icon="mdi:trash-can-outline"
                                                width="16"
                                                height="16"
                                            />
                                        </Button>
                                    </div>
                                </div>
                                <p className="mt-1 truncate text-xs text-main-400">
                                    {project.preview}
                                </p>
                            </div>
                        );
                    })
                ) : (
                    <div className="rounded-xl bg-main-900/50 p-3 text-xs text-main-400">
                        Проекты ещё не созданы.
                    </div>
                )}
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

            <Modal
                open={isDeleteProjectModalOpen}
                onClose={closeDeleteProjectModal}
                title="Удаление проекта"
                className="max-w-md"
                footer={
                    <>
                        <Button
                            variant="secondary"
                            shape="rounded-lg"
                            className="h-9 px-4"
                            onClick={closeDeleteProjectModal}
                        >
                            Отмена
                        </Button>
                        <Button
                            variant="primary"
                            shape="rounded-lg"
                            className="h-9 px-4"
                            onClick={() => {
                                void confirmDeleteProject();
                            }}
                        >
                            Удалить
                        </Button>
                    </>
                }
            >
                <p className="text-sm text-main-300">
                    Подтвердите удаление проекта вместе с диалогом и файлами.
                </p>
            </Modal>
        </aside>
    );
});
