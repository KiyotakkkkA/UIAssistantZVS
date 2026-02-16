import { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { useParams } from "react-router-dom";
import { useChat } from "../../../hooks/agents";
import { useFileSave, useProjects, useToasts } from "../../../hooks";
import { MessageComposer } from "../../components/molecules";
import { Button, Modal } from "../../components/atoms";
import { ChatHeader, MessageFeed } from "../../components/organisms/chat";
import type { SavedFileRecord } from "../../../types/ElectronApi";

export const ProjectPage = observer(function ProjectPage() {
    const { projectId = "" } = useParams();
    const toasts = useToasts();
    const { switchProject, activeProject } = useProjects();
    const { getFilesByIds, openFile } = useFileSave();

    const {
        messages,
        sendMessage,
        cancelGeneration,
        isStreaming,
        isAwaitingFirstChunk,
    } = useChat();

    const [documents, setDocuments] = useState<SavedFileRecord[]>([]);
    const [isDocumentsOpen, setIsDocumentsOpen] = useState(false);

    useEffect(() => {
        if (!projectId) {
            setDocuments([]);
            return;
        }

        let isCancelled = false;

        void (async () => {
            const project = await switchProject(projectId);

            if (!project || isCancelled) {
                if (!isCancelled) {
                    setDocuments([]);
                }
                return;
            }

            const files = await getFilesByIds(project.fileUUIDs);

            if (!isCancelled) {
                setDocuments(files);
            }
        })();

        return () => {
            isCancelled = true;
        };
    }, [projectId, switchProject, getFilesByIds]);

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

    return (
        <section className="flex min-w-0 flex-1 flex-col gap-3 rounded-3xl bg-main-900/70 backdrop-blur-md">
            <ChatHeader
                title={activeProject?.name || "Проект"}
                onOpenDocuments={() => setIsDocumentsOpen(true)}
            />
            <MessageFeed
                messages={messages}
                sendMessage={sendMessage}
                showLoader={isAwaitingFirstChunk}
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
                            <Button
                                key={file.id}
                                variant="secondary"
                                shape="rounded-lg"
                                className="flex h-auto w-full items-center justify-between px-3 py-2 text-left"
                                onClick={() => {
                                    void openDocument(file.id);
                                }}
                            >
                                <span className="truncate">
                                    {file.originalName}
                                </span>
                                <span className="text-xs text-main-400">
                                    {file.size} B
                                </span>
                            </Button>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-main-400">
                        Документы проекта отсутствуют.
                    </p>
                )}
            </Modal>
        </section>
    );
});
