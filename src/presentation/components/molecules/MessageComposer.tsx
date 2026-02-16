import { useCallback, useMemo, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import { observer } from "mobx-react-lite";
import { toolsStore } from "../../../stores/toolsStore";
import { useFileUpload } from "../../../hooks/files";
import type { UploadedFileData } from "../../../types/ElectronApi";
import {
    AutoFillSelector,
    Button,
    Dropdown,
    InputBig,
    InputCheckbox,
    InputSmall,
    Modal,
} from "../atoms";

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
    const [msgContent, setMsgContent] = useState("");
    const [isToolsModalOpen, setIsToolsModalOpen] = useState(false);
    const [toolsQuery, setToolsQuery] = useState("");
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

    const filteredPackages = useMemo(
        () => toolsStore.getFilteredPackages(toolsQuery),
        [toolsQuery],
    );

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
                <div className="space-y-4">
                    <InputSmall
                        value={toolsQuery}
                        onChange={(event) => setToolsQuery(event.target.value)}
                        placeholder="Поиск по пакетам и инструментам"
                    />

                    <div className="rounded-xl border border-main-700/70 bg-main-900/50 p-3">
                        <p className="text-sm font-semibold text-main-100">
                            Инструменты для обязательного использования
                        </p>
                        <p className="mt-1 text-xs text-main-400">
                            Выбранные инструменты будут обязательно использованы
                            при ответе во време работы над задачей.
                        </p>
                        <AutoFillSelector
                            className="mt-3"
                            options={toolsStore.enabledToolOptions}
                            value={toolsStore.requiredPromptTools}
                            onChange={toolsStore.setRequiredPromptTools}
                            placeholder="Выберите инструменты"
                        />
                    </div>

                    {filteredPackages.length === 0 ? (
                        <div className="rounded-xl border border-main-700/70 bg-main-900/45 p-4 text-sm text-main-400">
                            По вашему запросу ничего не найдено.
                        </div>
                    ) : (
                        filteredPackages.map((pkg) => (
                            <article
                                key={pkg.id}
                                className="rounded-2xl bg-main-900/45 p-4"
                            >
                                <div className="mb-3">
                                    <p className="text-base font-semibold text-main-100">
                                        {pkg.title}
                                    </p>
                                    <p className="mt-1 text-xs text-main-400">
                                        {pkg.description}
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    {pkg.tools.map((tool) => {
                                        const toolName =
                                            tool.schema.function.name;
                                        const isEnabled =
                                            toolsStore.isToolEnabled(toolName);

                                        return (
                                            <div
                                                key={`${pkg.id}_${toolName}`}
                                                className="flex items-start justify-between gap-3 rounded-xl border border-main-700/70 bg-main-900/60 p-3"
                                            >
                                                <div>
                                                    <p className="text-sm font-semibold text-main-100">
                                                        {toolName}
                                                    </p>
                                                    <p className="mt-1 text-xs text-main-400">
                                                        {tool.schema.function
                                                            .description ||
                                                            "Без описания"}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs text-main-400">
                                                        {isEnabled
                                                            ? "Включен"
                                                            : "Выключен"}
                                                    </span>
                                                    <InputCheckbox
                                                        checked={isEnabled}
                                                        onChange={(checked) =>
                                                            toolsStore.setToolEnabled(
                                                                toolName,
                                                                checked,
                                                            )
                                                        }
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </article>
                        ))
                    )}
                </div>
            </Modal>
        </>
    );
});
