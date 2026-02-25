import { Icon } from "@iconify/react";
import type { SavedFileRecord } from "../../../../../types/ElectronApi";

export type StoredFileProjectRef = {
    id: string;
    title: string;
};

type StoredFileCardProps = {
    file: SavedFileRecord;
    projectRef?: StoredFileProjectRef;
    onClick?: () => void;
    selected?: boolean;
    withOpenIcon?: boolean;
};

const formatFileSize = (bytes: number) => {
    if (!Number.isFinite(bytes) || bytes <= 0) {
        return "0 B";
    }

    const units = ["B", "KB", "MB", "GB"];
    const exponent = Math.min(
        Math.floor(Math.log(bytes) / Math.log(1024)),
        units.length - 1,
    );
    const value = bytes / 1024 ** exponent;

    return `${value.toFixed(value >= 10 || exponent === 0 ? 0 : 1)} ${units[exponent]}`;
};

const formatSavedAt = (savedAt: string) => {
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

export const StoredFileCard = ({
    file,
    projectRef,
    onClick,
    selected = false,
    withOpenIcon = true,
}: StoredFileCardProps) => {
    const projectLabel = projectRef?.title ?? "Без привязки к проекту";

    return (
        <button
            type="button"
            className={`group flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left transition-colors cursor-pointer ${
                selected
                    ? " bg-main-800/80"
                    : "bg-main-900/55 hover:bg-main-800/70"
            }`}
            onClick={onClick}
        >
            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                    <Icon
                        icon="mdi:file-document-outline"
                        className="text-main-300"
                        width={18}
                        height={18}
                    />
                    <p className="truncate text-sm font-medium text-main-100">
                        {file.originalName}
                    </p>
                </div>
                <p className="mt-1 truncate text-xs text-main-400">
                    Добавлен: {formatSavedAt(file.savedAt)}
                </p>
                <p className="mt-1 truncate text-xs text-main-400">
                    Проект: {projectLabel}
                </p>
            </div>
            <div className="flex shrink-0 items-center gap-2 text-xs text-main-400">
                <span>{formatFileSize(file.size)}</span>
                {withOpenIcon ? (
                    <Icon
                        icon="mdi:open-in-new"
                        className="text-main-500 transition-colors group-hover:text-main-300"
                        width={16}
                        height={16}
                    />
                ) : null}
            </div>
        </button>
    );
};
