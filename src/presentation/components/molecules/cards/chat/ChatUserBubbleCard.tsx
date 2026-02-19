import { Icon } from "@iconify/react";
import { Avatar, Button, InputBig } from "../../../atoms";

type ScenarioLaunchCardData = {
    title: string;
    name: string;
    description: string;
    status: string;
};

const parseScenarioLaunchCard = (
    content: string,
): ScenarioLaunchCardData | null => {
    if (!content.startsWith("Сценарий запущен")) {
        return null;
    }

    const lines = content
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);

    const readValue = (prefix: string) => {
        const line = lines.find((item) => item.startsWith(prefix));
        return line ? line.slice(prefix.length).trim() : "";
    };

    return {
        title: lines[0] || "Сценарий запущен",
        name: readValue("Название:"),
        description: readValue("Описание:"),
        status: readValue("Статус:"),
    };
};

type ChatUserBubbleCardProps = {
    messageId: string;
    content: string;
    timestamp: string;
    msgDelete?: () => void;
    msgEdit?: () => void;
    msgCopy?: () => void;
    msgRetry?: () => void;
    isEditing?: boolean;
    editValue?: string;
    onEditValueChange?: (value: string) => void;
    onEditConfirm?: () => void;
    onEditCancel?: () => void;
};

export function ChatUserBubbleCard({
    messageId,
    content,
    timestamp,
    msgDelete,
    msgEdit,
    msgCopy,
    msgRetry,
    isEditing = false,
    editValue = "",
    onEditValueChange,
    onEditConfirm,
    onEditCancel,
}: ChatUserBubbleCardProps) {
    const scenarioCard = parseScenarioLaunchCard(content);

    return (
        <article className="flex flex-col">
            <div className="flex gap-3 justify-end">
                <div
                    className={`max-w-[72%] rounded-2xl px-4 py-3 text-sm leading-relaxed bg-main-500/20 text-main-100 ring-main-300/30`}
                >
                    {isEditing ? (
                        <div className="space-y-3">
                            <InputBig
                                value={editValue}
                                onChange={(value) => onEditValueChange?.(value)}
                                className="h-24 rounded-xl border border-main-600 bg-main-800/85 px-3 py-2 text-sm text-main-100"
                            />

                            <div className="flex justify-end gap-2">
                                <Button
                                    variant="secondary"
                                    shape="rounded-lg"
                                    className="h-8 px-3 text-xs"
                                    onClick={onEditCancel}
                                >
                                    Отмена
                                </Button>
                                <Button
                                    variant="primary"
                                    shape="rounded-lg"
                                    className="h-8 px-3 text-xs"
                                    onClick={onEditConfirm}
                                >
                                    Отправить
                                </Button>
                            </div>
                        </div>
                    ) : scenarioCard ? (
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <Icon
                                    icon="mdi:script-text-play-outline"
                                    width={18}
                                    height={18}
                                    className="text-main-200"
                                />
                                <p className="text-sm font-semibold text-main-100">
                                    {scenarioCard.title}
                                </p>
                            </div>

                            <div className="rounded-xl border border-main-700/70 bg-main-900/35 p-3 space-y-1">
                                <p className="text-xs text-main-300">
                                    Название
                                </p>
                                <p className="text-sm text-main-100">
                                    {scenarioCard.name || "Без названия"}
                                </p>

                                <p className="pt-1 text-xs text-main-300">
                                    Описание
                                </p>
                                <p className="text-sm text-main-100">
                                    {scenarioCard.description || "Без описания"}
                                </p>

                                <p className="pt-1 text-xs text-main-300">
                                    Статус
                                </p>
                                <p className="text-sm text-main-100">
                                    {scenarioCard.status ||
                                        "Ассистент выполняет шаги"}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <p>{content}</p>
                    )}
                    <p className="mt-2 text-[11px] text-main-400">
                        {timestamp}
                    </p>
                </div>
                <Avatar label="YOU" tone="user" />
            </div>
            {!isEditing ? (
                <div
                    className="flex justify-end gap-2 mt-2 mr-10"
                    data-message-id={messageId}
                >
                    <Button
                        variant=""
                        className="border-transparent"
                        onClick={msgRetry}
                    >
                        <Icon
                            icon="mdi:refresh"
                            className="text-main-400 hover:text-main-300 transition-colors"
                        />
                    </Button>
                    <Button
                        variant=""
                        className="border-transparent"
                        onClick={msgCopy}
                    >
                        <Icon
                            icon="mdi:content-copy"
                            className="text-main-400 hover:text-main-300 transition-colors"
                        />
                    </Button>
                    <Button
                        variant=""
                        className="border-transparent"
                        onClick={msgEdit}
                    >
                        <Icon
                            icon="mdi:pencil"
                            className="text-main-400 hover:text-main-300 transition-colors"
                        />
                    </Button>
                    <Button
                        variant=""
                        className=" border-transparent"
                        onClick={msgDelete}
                    >
                        <Icon
                            icon="mdi:delete"
                            className="text-main-400 hover:text-red-300 transition-colors"
                        />
                    </Button>
                </div>
            ) : null}
        </article>
    );
}
