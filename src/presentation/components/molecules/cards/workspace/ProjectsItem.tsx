import { Icon } from "@iconify/react";
import { Button } from "../../../atoms";
import { WorkspaceListItem } from "./WorkspaceListItem";

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
        <WorkspaceListItem
            id={id}
            title={title}
            preview={preview}
            active={active}
            onSelect={onSelect}
            actions={
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
            }
        />
    );
}
