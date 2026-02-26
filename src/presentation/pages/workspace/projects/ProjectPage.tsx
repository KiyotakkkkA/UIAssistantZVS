import { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { useNavigate, useParams } from "react-router-dom";
import { useChat } from "../../../../hooks/agents";
import { useProjects, useToasts } from "../../../../hooks";
import { useFileSave } from "../../../../hooks/files";
import { Icon } from "@iconify/react";
import { MessageComposer } from "../../../components/molecules";
import { Button, Modal, Select } from "../../../components/atoms";
import { ChatHeader, MessageFeed } from "../../../components/organisms/chat";
import type { SavedFileRecord } from "../../../../types/ElectronApi";
import { LoadingFallbackPage } from "../../LoadingFallbackPage";
import { StoredFileCard } from "../../../components/molecules/cards/storage";
import { storageStore } from "../../../../stores/storageStore";

export const ProjectPage = observer(function ProjectPage() {
    const { projectId = "" } = useParams();
    const navigate = useNavigate();
    const toasts = useToasts();
    const { switchProject, activeProject } = useProjects();
    const { getFilesByIds, openFile, openPath } = useFileSave();

    const {
        messages,
        sendMessage,
        cancelGeneration,
        isStreaming,
        isAwaitingFirstChunk,
        activeStage,
        activeResponseToId,
    } = useChat();

    const [documents, setDocuments] = useState<SavedFileRecord[]>([]);
    const [isDocumentsOpen, setIsDocumentsOpen] = useState(false);
    const [isProjectLoading, setIsProjectLoading] = useState(true);
    const [selectedVectorStorageId, setSelectedVectorStorageId] = useState("");
    const [isVectorBindingSaving, setIsVectorBindingSaving] = useState(false);

    useEffect(() => {
        setIsProjectLoading(true);

        if (!projectId) {
            setDocuments([]);
            setIsProjectLoading(false);
            return;
        }

        let isCancelled = false;

        void (async () => {
            const project = await switchProject(projectId);

            if (!project || isCancelled) {
                if (!isCancelled) {
                    setDocuments([]);
                    setIsProjectLoading(false);
                    toasts.warning({
                        title: "Проект не найден",
                        description: "Открыт список диалогов по умолчанию.",
                    });
                    navigate("/workspace/dialogs", { replace: true });
                }
                return;
            }

            const files = await getFilesByIds(project.fileUUIDs);

            if (!isCancelled) {
                setDocuments(files);
                setIsProjectLoading(false);
            }
        })();

        return () => {
            isCancelled = true;
        };
    }, [projectId, switchProject, getFilesByIds, navigate, toasts]);

    useEffect(() => {
        if (!isDocumentsOpen) {
            return;
        }

        void storageStore.loadVectorStoragesData();
    }, [isDocumentsOpen]);

    const linkedVectorStorage = activeProject?.linkedVectorStorage ?? null;

    useEffect(() => {
        if (!isDocumentsOpen) {
            return;
        }

        setSelectedVectorStorageId(linkedVectorStorage?.id ?? "");
    }, [isDocumentsOpen, linkedVectorStorage?.id]);

    const vectorStorageOptions = [
        {
            value: "",
            label: "Не подключено",
        },
        ...storageStore.vectorStorages.map((vectorStorage) => ({
            value: vectorStorage.id,
            label: vectorStorage.name,
        })),
    ];

    const openDocument = async (fileId: string) => {
        const isOpened = await openFile(fileId);

        if (isOpened) {
            return;
        }

        toasts.warning({
            title: "Не удалось открыть файл",
            description: "Файл недоступен или был перемещён.",
        });
    };

    const openProjectDirectory = async () => {
        const directoryPath = activeProject?.directoryPath?.trim();

        if (!directoryPath) {
            toasts.warning({
                title: "Директория не указана",
                description: "У проекта отсутствует путь директории.",
            });
            return;
        }

        const isOpened = await openPath(directoryPath);

        if (isOpened) {
            return;
        }

        toasts.warning({
            title: "Не удалось открыть папку",
            description: "Папка недоступна или была перемещена.",
        });
    };

    const saveVectorBinding = async () => {
        const api = window.appApi?.vectorStorages;

        if (!api || !activeProject) {
            return;
        }

        const projectId = activeProject.id;

        try {
            setIsVectorBindingSaving(true);

            const vectorStorages = await api.getVectorStorages();
            const currentLinkedStorage =
                vectorStorages.find((vectorStorage) =>
                    vectorStorage.usedByProjects.some(
                        (projectRef) => projectRef.id === projectId,
                    ),
                ) ?? null;

            if ((currentLinkedStorage?.id ?? "") === selectedVectorStorageId) {
                toasts.info({
                    title: "Без изменений",
                    description: "Привязка векторного хранилища уже актуальна.",
                });
                return;
            }

            for (const vectorStorage of vectorStorages) {
                const currentProjectIds = vectorStorage.usedByProjects.map(
                    (projectRef) => projectRef.id,
                );
                const hasProject = currentProjectIds.includes(projectId);
                const shouldHaveProject =
                    selectedVectorStorageId.length > 0 &&
                    vectorStorage.id === selectedVectorStorageId;

                if (hasProject === shouldHaveProject) {
                    continue;
                }

                const nextProjectIds = shouldHaveProject
                    ? [...new Set([...currentProjectIds, projectId])]
                    : currentProjectIds.filter(
                          (currentProjectId) => currentProjectId !== projectId,
                      );

                await api.updateVectorStorage(vectorStorage.id, {
                    projectIds: nextProjectIds,
                });
            }

            await storageStore.loadVectorStoragesData();
            await switchProject(projectId);
            setSelectedVectorStorageId(selectedVectorStorageId);

            toasts.success({
                title: "Привязка обновлена",
                description: selectedVectorStorageId
                    ? "Векторное хранилище подключено к проекту."
                    : "Векторное хранилище отключено от проекта.",
            });
        } finally {
            setIsVectorBindingSaving(false);
        }
    };

    if (isProjectLoading) {
        return <LoadingFallbackPage title="Загрузка проекта..." />;
    }

    return (
        <section className="animate-page-fade-in flex min-w-0 flex-1 flex-col gap-3 rounded-3xl bg-main-900/70 backdrop-blur-md">
            <ChatHeader
                title={activeProject?.name || "Проект"}
                onOpenDocuments={() => setIsDocumentsOpen(true)}
            />
            <div className="mx-4 mt-1 rounded-xl border border-main-700/70 bg-main-900/40 px-3 py-2 flex gap-2 items-center justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <Icon
                            icon="mdi:folder-marker-outline"
                            className="text-main-300"
                            width={16}
                            height={16}
                        />
                        <p className="text-xs text-main-400">
                            Директория проекта
                        </p>
                    </div>
                    <div className="mt-1">
                        <p
                            className="min-w-0 flex-1 truncate text-sm text-main-100"
                            title={activeProject?.directoryPath || "Не указана"}
                        >
                            {activeProject?.directoryPath || "Не указана"}
                        </p>
                    </div>
                </div>
                <Button
                    variant="primary"
                    shape="rounded-lg"
                    className="h-8 px-3 text-xs"
                    onClick={() => {
                        void openProjectDirectory();
                    }}
                >
                    <Icon
                        className="mr-2"
                        icon="mdi:folder-open-outline"
                        width={16}
                        height={16}
                    />
                    Открыть папку
                </Button>
            </div>
            {linkedVectorStorage && (
                <div className="mx-4 mt-1 rounded-xl border border-main-700/70 bg-main-900/40 px-3 py-2 flex gap-2 items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <Icon
                                icon="mdi:database-outline"
                                className="text-main-300"
                                width={16}
                                height={16}
                            />
                            <p className="text-xs text-main-400">
                                Векторное хранилище проекта
                            </p>
                        </div>
                        <div className="mt-1">
                            <p className="min-w-0 flex-1 truncate text-sm text-main-100">
                                {linkedVectorStorage.name}
                            </p>
                        </div>
                    </div>
                </div>
            )}
            <MessageFeed
                messages={messages}
                sendMessage={sendMessage}
                showLoader={isAwaitingFirstChunk}
                activeStage={activeStage}
                activeResponseToId={activeResponseToId}
            />
            <MessageComposer
                onMessageSend={sendMessage}
                onCancelGeneration={cancelGeneration}
                isStreaming={isStreaming}
            />

            <Modal
                open={isDocumentsOpen}
                onClose={() => setIsDocumentsOpen(false)}
                title="Документы проекта"
                className="max-w-5xl min-h-[80vh]"
            >
                <div className="space-y-3">
                    <div className="rounded-xl border border-main-700/70 bg-main-900/45 p-3">
                        <p className="text-sm font-semibold text-main-100">
                            Векторное хранилище проекта
                        </p>
                        <p className="mt-1 text-xs text-main-400">
                            Если хранилище подключено, ассистент в чате проекта
                            получает tool `vector_store_search_tool`.
                        </p>
                        <div className="mt-3 flex items-center gap-2 justify-between">
                            <Select
                                value={selectedVectorStorageId}
                                onChange={setSelectedVectorStorageId}
                                options={vectorStorageOptions}
                                placeholder="Выберите векторное хранилище"
                                className="h-9 min-w-70"
                                searchable
                                searchPlaceholder="Поиск хранилища..."
                                emptyMessage="Хранилища не найдены"
                            />
                            <Button
                                variant="primary"
                                shape="rounded-lg"
                                className="h-9 px-4"
                                onClick={() => {
                                    void saveVectorBinding();
                                }}
                                disabled={
                                    isVectorBindingSaving ||
                                    storageStore.isVectorStoragesLoading
                                }
                            >
                                {isVectorBindingSaving
                                    ? "Сохранение..."
                                    : "Сохранить"}
                            </Button>
                        </div>
                    </div>

                    {documents.length > 0 ? (
                        <div className="space-y-2">
                            {documents.map((file) => (
                                <StoredFileCard
                                    key={file.id}
                                    file={file}
                                    projectRef={
                                        activeProject
                                            ? {
                                                  id: activeProject.id,
                                                  title: activeProject.name,
                                              }
                                            : undefined
                                    }
                                    onClick={() => {
                                        void openDocument(file.id);
                                    }}
                                />
                            ))}
                        </div>
                    ) : (
                        <p className="rounded-xl border border-dashed border-main-700/70 bg-main-900/40 px-3 py-4 text-center text-sm text-main-400">
                            Документы проекта отсутствуют.
                        </p>
                    )}
                </div>
            </Modal>
        </section>
    );
});
