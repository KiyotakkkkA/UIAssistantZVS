import { useMemo, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import { observer } from "mobx-react-lite";
import { toolsStore } from "../../../stores/toolsStore";
import { useToasts } from "../../../hooks";
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
    const [attachValue, setAttachValue] = useState("");
    const areaRef = useRef<HTMLTextAreaElement>(null);
    const toasts = useToasts();

    const filteredPackages = useMemo(
        () => toolsStore.getFilteredPackages(toolsQuery),
        [toolsQuery, toolsStore.enabledToolNames.size],
    );

    const attachOptions = useMemo(
        () => [
            {
                value: "attach-image",
                label: "Прикрепить изображение",
                icon: <Icon icon="mdi:image-outline" width="16" height="16" />,
                onClick: () => {
                    toasts.info({
                        title: "Скоро будет доступно",
                        description:
                            "Прикрепление изображений пока не реализовано.",
                    });
                },
            },
        ],
        [toasts],
    );

    const handleSend = () => {
        const payload = msgContent.trim();

        if (!payload || isStreaming) {
            return;
        }

        onMessageSend(payload);
        setMsgContent("");
        requestAnimationFrame(() => {
            areaRef.current?.focus();
        });
    };

    return (
        <>
            <footer className="rounded-2xl bg-main-900/90 ring-main-300/20">
                <div className="relative items-center gap-3">
                    <InputBig
                        ref={areaRef}
                        value={msgContent}
                        onChange={setMsgContent}
                        placeholder="Напишите сообщение модели..."
                        className="pr-14 pl-24 bg-main-800/70 text-main-100 placeholder:text-main-400"
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

                    <Button
                        label="Tools"
                        className="absolute left-2 top-1.5 p-2"
                        shape="rounded-l-full"
                        variant="primary"
                        onClick={() => setIsToolsModalOpen(true)}
                    >
                        <Icon icon="mdi:tools" />
                    </Button>

                    <div className="absolute left-12 top-1.5 z-20">
                        <Dropdown
                            value={attachValue}
                            onChange={() => setAttachValue("")}
                            options={attachOptions}
                            menuPlacement="top"
                            menuClassName="w-62"
                            matchTriggerWidth={false}
                            renderTrigger={({
                                toggleOpen,
                                triggerRef,
                                disabled,
                                ariaProps,
                            }) => (
                                <Button
                                    label="Attach"
                                    className="p-2"
                                    shape="rounded-r-full"
                                    ref={triggerRef}
                                    disabled={disabled}
                                    onClick={toggleOpen}
                                    {...ariaProps}
                                >
                                    <Icon icon="mdi:paperclip" />
                                </Button>
                            )}
                        />
                    </div>

                    <Button
                        onClick={isStreaming ? onCancelGeneration : handleSend}
                        label={isStreaming ? "Cancel" : "Send"}
                        className="absolute right-2 top-1.5 p-2"
                        variant="primary"
                        disabled={!isStreaming && !msgContent.trim()}
                    >
                        <Icon icon={isStreaming ? "mdi:stop" : "mdi:send"} />
                    </Button>
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
                            Выбранные инструменты будут добавлены в промпт как:
                            <br />
                            You must use these tools while completing task:
                            TOOLS - ...
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
