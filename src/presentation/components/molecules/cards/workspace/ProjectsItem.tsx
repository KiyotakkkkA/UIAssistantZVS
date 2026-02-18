import { Icon } from "@iconify/react";
import { Button } from "../../../atoms";

type ProjectsItemProps = {
    id: string;
    title: string;
    preview: string;
    time: string;
    active?: boolean;
    onSelect: (projectId: string) => void;
    onDelete: (projectId: string) => void;
};

export function ProjectsItem({
    id,
    title,
    preview,
    time,
    active = false,
    onSelect,
    onDelete,
}: ProjectsItemProps) {
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
            className={`w-full rounded-xl p-3 text-left transition-colors cursor-pointer hover:bg-main-600/70 ${
                active ? "bg-main-500/20" : "bg-transparent"
            }`}
        >
            <div className="flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-main-100">
                        {title}
                    </p>
                </div>
                <div className="flex items-center gap-1">
                    <span className="text-xs text-main-400">{time}</span>
                    <Button
                        variant=""
                        className="border-transparent items-center justify-center rounded-lg cursor-pointer text-base text-main-300 hover:bg-main-700/70 hover:text-main-100"
                        onClick={(event) => {
                            event.stopPropagation();
                            onDelete(id);
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
            <p className="mt-1 truncate text-xs text-main-400">{preview}</p>
        </div>
    );
}
