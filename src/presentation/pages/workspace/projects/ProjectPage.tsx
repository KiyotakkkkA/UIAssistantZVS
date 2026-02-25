import { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { useNavigate, useParams } from "react-router-dom";
import { useChat } from "../../../../hooks/agents";
import { useProjects, useToasts } from "../../../../hooks";
import { useFileSave } from "../../../../hooks/files";
import { Icon } from "@iconify/react";
import { MessageComposer } from "../../../components/molecules";
import { Button, Modal } from "../../../components/atoms";
import { ChatHeader, MessageFeed } from "../../../components/organisms/chat";
import type { SavedFileRecord } from "../../../../types/ElectronApi";
import { LoadingFallbackPage } from "../../LoadingFallbackPage";

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

    const formatFileSize = (bytes: number) => {
        if (!Number.isFinite(bytes) || bytes <= 0) {
            return "0 B";
        }

        const units = ["B", "KB", "MB", "GB"];
        const exponent = Math.min(
            Math.floor(Math.log(bytes) / Math.log(1024)),
            units.length - 1,
        );
        const value = bytes / 1024 ** exponent;

        return `${value.toFixed(value >= 10 || exponent === 0 ? 0 : 1)} ${units[exponent]}`;
    };

    const formatSavedAt = (savedAt: string) => {
        if (!savedAt) {
            return "Дата неизвестна";
        }

        const parsedDate = new Date(savedAt);

        if (Number.isNaN(parsedDate.getTime())) {
            return "Дата неизвестна";
        }

        return parsedDate.toLocaleString("ru-RU", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

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
                className="max-w-2xl"
            >
                {documents.length > 0 ? (
                    <div className="space-y-2">
                        {documents.map((file) => (
                            <button
                                key={file.id}
                                type="button"
                                className="group flex w-full items-center justify-between gap-3 rounded-xl border border-main-700/70 bg-main-900/55 px-3 py-2.5 text-left transition-colors hover:bg-main-800/70"
                                onClick={() => {
                                    void openDocument(file.id);
                                }}
                            >
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2">
                                        <Icon
                                            icon="mdi:file-document-outline"
                                            className="text-main-300"
                                            width={18}
                                            height={18}
                                        />
                                        <p className="truncate text-sm font-medium text-main-100">
                                            {file.originalName}
                                        </p>
                                    </div>
                                    <p className="mt-1 truncate text-xs text-main-400">
                                        Добавлен: {formatSavedAt(file.savedAt)}
                                    </p>
                                </div>
                                <div className="flex shrink-0 items-center gap-2 text-xs text-main-400">
                                    <span>{formatFileSize(file.size)}</span>
                                    <Icon
                                        icon="mdi:open-in-new"
                                        className="text-main-500 transition-colors group-hover:text-main-300"
                                        width={16}
                                        height={16}
                                    />
                                </div>
                            </button>
                        ))}
                    </div>
                ) : (
                    <p className="rounded-xl border border-dashed border-main-700/70 bg-main-900/40 px-3 py-4 text-center text-sm text-main-400">
                        Документы проекта отсутствуют.
                    </p>
                )}
            </Modal>
        </section>
    );
});
