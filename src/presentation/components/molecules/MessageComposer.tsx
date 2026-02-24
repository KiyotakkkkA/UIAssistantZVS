import { useCallback, useMemo, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import { observer } from "mobx-react-lite";
import { useToasts } from "../../../hooks";
import { useScenario, useScenarioConvert } from "../../../hooks/agents";
import { useFileUpload } from "../../../hooks/files";
import type { UploadedFileData } from "../../../types/ElectronApi";
import { encodeScenarioLaunchPayload } from "../../../utils/scenario/scenarioLaunchEnvelope";
import { Button, Dropdown, InputBig, Modal } from "../atoms";
import { RequiredToolsPickForm } from "../organisms/forms";

interface MessageComposerProps {
    onMessageSend: (content: string) => void;
    onCancelGeneration: () => void;
    isStreaming?: boolean;
}

export const MessageComposer = observer(function MessageComposer({
    onMessageSend,
    onCancelGeneration,
    isStreaming = false,
}: MessageComposerProps) {
    const toasts = useToasts();
    const { scenarios, switchScenario } = useScenario();
    const { scenarioToFlow } = useScenarioConvert();

    const [msgContent, setMsgContent] = useState("");
    const [isToolsModalOpen, setIsToolsModalOpen] = useState(false);
    const [isScenarioModalOpen, setIsScenarioModalOpen] = useState(false);
    const [toolsQuery, setToolsQuery] = useState("");
    const [startingScenarioId, setStartingScenarioId] = useState<string | null>(
        null,
    );
    const [attachedImages, setAttachedImages] = useState<UploadedFileData[]>(
        [],
    );
    const areaRef = useRef<HTMLTextAreaElement>(null);
    const { isUploading, pickFiles } = useFileUpload();

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) {
            return `${bytes} B`;
        }

        const kb = bytes / 1024;

        if (kb < 1024) {
            return `${kb.toFixed(1)} KB`;
        }

        return `${(kb / 1024).toFixed(1)} MB`;
    };

    const formatScenarioSavedAt = (savedAt: string) => {
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

    const attachImages = useCallback(async () => {
        const selectedFiles = await pickFiles({
            accept: ["image/*"],
            multiple: true,
        });

        if (!selectedFiles.length) {
            return;
        }

        const onlyImages = selectedFiles.filter((file) =>
            file.mimeType.startsWith("image/"),
        );

        setAttachedImages((prev) => [...prev, ...onlyImages]);
    }, [pickFiles]);

    const removeAttachedImage = (index: number) => {
        setAttachedImages((prev) =>
            prev.filter((_, current) => current !== index),
        );
    };

    const attachOptions = useMemo(
        () => [
            {
                value: "attach-image",
                label: "Прикрепить изображение",
                icon: <Icon icon="mdi:image-outline" width="16" height="16" />,
                onClick: () => {
                    void attachImages();
                },
            },
        ],
        [attachImages],
    );

    const handleSend = () => {
        const payload = msgContent.trim();

        if (!payload || isStreaming) {
            return;
        }

        onMessageSend(payload);
        setMsgContent("");
        setAttachedImages([]);
        requestAnimationFrame(() => {
            areaRef.current?.focus();
        });
    };

    const startScenario = useCallback(
        async (scenarioId: string) => {
            if (isStreaming) {
                toasts.warning({
                    title: "Дождитесь завершения ответа",
                    description:
                        "Нельзя запустить сценарий, пока модель формирует ответ.",
                });
                return;
            }

            setStartingScenarioId(scenarioId);

            try {
                const scenario = await switchScenario(scenarioId);

                if (!scenario) {
                    toasts.warning({
                        title: "Сценарий не найден",
                        description: "Не удалось загрузить выбранный сценарий.",
                    });
                    return;
                }

                const scenarioFlow = await scenarioToFlow(scenario);
                const displayMessage = [
                    "Сценарий запущен",
                    `Название: ${scenario.name}`,
                    `Описание: ${scenario.description.trim() || "Без описания"}`,
                    "Статус: ассистент выполняет шаги сценария",
                ].join("\n");

                const launchPayload = encodeScenarioLaunchPayload({
                    scenarioName: scenario.name,
                    displayMessage,
                    scenarioFlow,
                });

                onMessageSend(launchPayload);

                setMsgContent("");
                setAttachedImages([]);
                setIsScenarioModalOpen(false);
                requestAnimationFrame(() => {
                    areaRef.current?.focus();
                });
            } finally {
                setStartingScenarioId(null);
            }
        },
        [isStreaming, onMessageSend, scenarioToFlow, switchScenario, toasts],
    );

    return (
        <>
            <footer className="rounded-2xl bg-main-900/90 ring-main-300/20">
                <div className="mx-auto w-full max-w-5xl rounded-[1.75rem] border border-main-700/70 bg-main-800/65 p-3">
                    {attachedImages.length > 0 ? (
                        <div className="mb-3 flex max-w-full items-center gap-2 overflow-x-auto pb-1">
                            {attachedImages.map((file, index) => (
                                <div
                                    key={`${file.name}-${index}`}
                                    className="flex min-w-56 items-center gap-2 rounded-2xl border border-main-700/70 bg-main-900/70 p-2"
                                >
                                    <div className="h-10 w-10 overflow-hidden rounded-md bg-main-700/70">
                                        <img
                                            src={file.dataUrl}
                                            alt={file.name}
                                            className="h-full w-full object-cover"
                                        />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm text-main-100">
                                            {file.name}
                                        </p>
                                        <p className="text-xs text-main-400">
                                            {formatFileSize(file.size)}
                                        </p>
                                    </div>
                                    <Button
                                        variant="secondary"
                                        className="h-7 w-7 p-0"
                                        shape="rounded-full"
                                        onClick={() =>
                                            removeAttachedImage(index)
                                        }
                                        label={`Удалить ${file.name}`}
                                    >
                                        <Icon
                                            icon="mdi:close"
                                            width="14"
                                            height="14"
                                        />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    ) : null}

                    <div className="rounded-2xl bg-main-900/55 px-3 py-2">
                        <InputBig
                            ref={areaRef}
                            value={msgContent}
                            onChange={setMsgContent}
                            placeholder="Напишите сообщение модели..."
                            className="h-auto! min-h-9 w-full rounded-lg border-0 bg-transparent p-2 text-main-100 placeholder:text-main-400"
                            onKeyDown={(event) => {
                                if (
                                    event.key === "Enter" &&
                                    !event.shiftKey &&
                                    !isStreaming
                                ) {
                                    event.preventDefault();
                                    handleSend();
                                }
                            }}
                        />

                        <div className="mt-2 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                                <Button
                                    label="Tools"
                                    className="h-9 w-9 p-0"
                                    shape="rounded-l-full"
                                    variant="primary"
                                    onClick={() => setIsToolsModalOpen(true)}
                                >
                                    <Icon icon="mdi:tools" />
                                </Button>

                                <Button
                                    label="Tools"
                                    className="h-9 w-9 p-0"
                                    shape="rounded-sm"
                                    variant="secondary"
                                    onClick={() => setIsScenarioModalOpen(true)}
                                >
                                    <Icon icon="mdi:script" />
                                </Button>

                                <div className="z-20">
                                    <Dropdown
                                        options={attachOptions}
                                        menuPlacement="top"
                                        menuClassName="w-66"
                                        matchTriggerWidth={false}
                                        renderTrigger={({
                                            toggleOpen,
                                            triggerRef,
                                            disabled,
                                            ariaProps,
                                        }) => (
                                            <Button
                                                label="Attach"
                                                variant="primary"
                                                className="h-9 w-9 p-0"
                                                shape="rounded-r-full"
                                                ref={triggerRef}
                                                disabled={
                                                    disabled || isUploading
                                                }
                                                onClick={toggleOpen}
                                                {...ariaProps}
                                            >
                                                <Icon
                                                    icon={
                                                        isUploading
                                                            ? "mdi:loading"
                                                            : "mdi:paperclip"
                                                    }
                                                    className={
                                                        isUploading
                                                            ? "animate-spin"
                                                            : ""
                                                    }
                                                />
                                            </Button>
                                        )}
                                    />
                                </div>
                            </div>

                            <Button
                                onClick={
                                    isStreaming
                                        ? onCancelGeneration
                                        : handleSend
                                }
                                label={isStreaming ? "Cancel" : "Send"}
                                className="h-9 w-9 p-0"
                                variant="primary"
                                disabled={!isStreaming && !msgContent.trim()}
                            >
                                <Icon
                                    icon={isStreaming ? "mdi:stop" : "mdi:send"}
                                />
                            </Button>
                        </div>
                    </div>
                </div>
            </footer>

            <Modal
                open={isToolsModalOpen}
                onClose={() => setIsToolsModalOpen(false)}
                title="Настройка инструментов"
                className="max-w-6xl min-h-144"
            >
                <RequiredToolsPickForm
                    toolsQuery={toolsQuery}
                    onToolsQueryChange={setToolsQuery}
                />
            </Modal>

            <Modal
                open={isScenarioModalOpen}
                onClose={() => setIsScenarioModalOpen(false)}
                title="Запуск сценария"
                className="max-w-2xl"
            >
                {scenarios.length > 0 ? (
                    <div className="space-y-2">
                        {scenarios.map((scenario) => {
                            const isStarting =
                                startingScenarioId === scenario.id;

                            return (
                                <button
                                    key={scenario.id}
                                    type="button"
                                    className="group flex w-full items-center justify-between gap-3 rounded-xl border border-main-700/70 bg-main-900/55 px-3 py-2.5 text-left transition-colors hover:bg-main-800/70 disabled:opacity-60"
                                    onClick={() => {
                                        void startScenario(scenario.id);
                                    }}
                                    disabled={Boolean(startingScenarioId)}
                                >
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                            <Icon
                                                icon="mdi:script-text-outline"
                                                className="text-main-300"
                                                width={18}
                                                height={18}
                                            />
                                            <p className="truncate text-sm font-medium text-main-100">
                                                {scenario.title}
                                            </p>
                                        </div>
                                        <p className="mt-1 truncate text-xs text-main-400">
                                            {scenario.preview}
                                        </p>
                                        <p className="mt-1 truncate text-xs text-main-500">
                                            Обновлён:{" "}
                                            {formatScenarioSavedAt(
                                                scenario.updatedAt,
                                            )}
                                        </p>
                                    </div>
                                    <div className="flex shrink-0 items-center gap-2 text-xs text-main-400">
                                        {isStarting ? (
                                            <Icon
                                                icon="mdi:loading"
                                                className="animate-spin text-main-300"
                                                width={16}
                                                height={16}
                                            />
                                        ) : (
                                            <Icon
                                                icon="mdi:play-circle-outline"
                                                className="text-main-500 transition-colors group-hover:text-main-300"
                                                width={18}
                                                height={18}
                                            />
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                ) : (
                    <p className="rounded-xl border border-dashed border-main-700/70 bg-main-900/40 px-3 py-4 text-center text-sm text-main-400">
                        Сценарии отсутствуют.
                    </p>
                )}
            </Modal>
        </>
    );
});
