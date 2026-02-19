import type { ReactNode } from "react";

type WorkspaceListItemProps = {
    id: string;
    title: string;
    preview: string;
    active?: boolean;
    onSelect: (id: string) => void;
    actions: ReactNode;
};

export function WorkspaceListItem({
    id,
    title,
    preview,
    active = false,
    onSelect,
    actions,
}: WorkspaceListItemProps) {
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
                <p className="min-w-0 flex-1 truncate text-sm font-medium text-main-100">
                    {title}
                </p>
                {actions}
            </div>
            <p className="mt-1 truncate text-xs text-main-400">{preview}</p>
        </div>
    );
}
