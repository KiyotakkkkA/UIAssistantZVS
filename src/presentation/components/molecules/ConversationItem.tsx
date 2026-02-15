import { Icon } from "@iconify/react";
import { Button } from "../atoms";

type ConversationItemProps = {
    id: string;
    title: string;
    preview: string;
    time: string;
    active?: boolean;
    onSelect: (dialogId: string) => void;
    onRename: (dialogId: string) => void;
    onDelete: (dialogId: string) => void;
    canDelete: boolean;
};

export function ConversationItem({
    id,
    title,
    preview,
    time,
    active = false,
    onSelect,
    onRename,
    onDelete,
    canDelete,
}: ConversationItemProps) {
    return (
        <div
            role="button"
            tabIndex={0}
            onClick={() => onSelect(id)}
            onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onSelect(id);
                }
            }}
            className={`w-full rounded-xl p-3 text-left transition-colors cursor-pointer ${
                active
                    ? "bg-main-500/20"
                    : "bg-transparent ring-transparent hover:bg-main-800/70"
            }`}
        >
            <div className="flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-main-100">
                        {title}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-main-400">{time}</span>
                    <Button
                        variant=""
                        className="border-transparent items-center justify-center rounded-lg cursor-pointer text-base text-main-300 hover:bg-main-700/70 hover:text-main-100"
                        onClick={(event) => {
                            event.stopPropagation();
                            onRename(id);
                        }}
                        aria-label="Переименовать диалог"
                    >
                        <Icon
                            icon="mdi:pencil-outline"
                            width="16"
                            height="16"
                        />
                    </Button>
                    <Button
                        variant=""
                        className="border-transparent items-center justify-center rounded-lg cursor-pointer text-base text-main-300 hover:bg-main-700/70 hover:text-main-100 disabled:cursor-not-allowed disabled:opacity-40"
                        onClick={(event) => {
                            event.stopPropagation();
                            onDelete(id);
                        }}
                        disabled={!canDelete}
                        aria-label="Удалить диалог"
                    >
                        <Icon
                            icon="mdi:trash-can-outline"
                            width="16"
                            height="16"
                        />
                    </Button>
                </div>
            </div>
            <p className="mt-1 truncate text-xs text-main-400">{preview}</p>
        </div>
    );
}
