import { Icon } from "@iconify/react";
import { Avatar, Button, InputBig } from "../../../atoms";

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
