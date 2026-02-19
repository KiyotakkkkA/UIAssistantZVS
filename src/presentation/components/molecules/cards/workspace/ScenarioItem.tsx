import { Icon } from "@iconify/react";
import { Button } from "../../../atoms";
import { WorkspaceListItem } from "./WorkspaceListItem";

type ScenarioItemProps = {
    id: string;
    title: string;
    preview: string;
    time: string;
    active?: boolean;
    onSelect: (scenarioId: string) => void;
    onEdit: (scenarioId: string) => void;
    onDelete: (scenarioId: string) => void;
};

const iconBtnClass =
    "border-transparent items-center justify-center rounded-lg cursor-pointer text-base text-main-300 hover:bg-main-700/70 hover:text-main-100";

export function ScenarioItem({
    id,
    title,
    preview,
    time,
    active = false,
    onSelect,
    onEdit,
    onDelete,
}: ScenarioItemProps) {
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
                        className={iconBtnClass}
                        onClick={(event) => {
                            event.stopPropagation();
                            onEdit(id);
                        }}
                        aria-label="Редактировать сценарий"
                    >
                        <Icon
                            icon="mdi:pencil-outline"
                            width="16"
                            height="16"
                        />
                    </Button>
                    <Button
                        variant=""
                        className={iconBtnClass}
                        onClick={(event) => {
                            event.stopPropagation();
                            onDelete(id);
                        }}
                        aria-label="Удалить сценарий"
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
