import { Icon } from "@iconify/react";
import { type MouseEvent, type PointerEvent, type ReactNode } from "react";
import type { ScenarioSimpleBlockNode } from "../../../../../types/Scenario";
import { Button } from "../../../atoms";

type ScenarioBlockFrameProps = {
    block: ScenarioSimpleBlockNode;
    isConnectSource: boolean;
    icon: string;
    iconBgClassName: string;
    subtitle: string;
    onPointerDown: (
        event: PointerEvent<HTMLDivElement>,
        blockId: string,
    ) => void;
    onContextMenu?: (
        event: MouseEvent<HTMLDivElement>,
        blockId: string,
    ) => void;
    onOpenSettings?: (blockId: string) => void;
    onRequestDelete?: (blockId: string) => void;
    children?: ReactNode;
};

export function ScenarioBlockFrame({
    block,
    isConnectSource,
    icon,
    iconBgClassName,
    subtitle,
    onPointerDown,
    onContextMenu,
    onOpenSettings,
    onRequestDelete,
    children,
}: ScenarioBlockFrameProps) {
    const hasActions =
        typeof onOpenSettings === "function" &&
        typeof onRequestDelete === "function";

    return (
        <div
            className={`absolute select-none rounded-xl border border-main-700/70 bg-main-900/95 shadow-sm ${isConnectSource ? "ring-2 ring-main-300/70" : ""}`}
            style={{
                width: block.width,
                height: block.height,
                transform: `translate(${block.x}px, ${block.y}px)`,
                transformOrigin: "top left",
            }}
            onPointerDown={(event) => onPointerDown(event, block.id)}
            onContextMenu={
                onContextMenu
                    ? (event) => onContextMenu(event, block.id)
                    : undefined
            }
        >
            <div className="flex h-full overflow-hidden rounded-xl">
                <div
                    className={`flex w-12 items-center justify-center text-main-100 ${iconBgClassName}`}
                >
                    <Icon icon={icon} width={20} height={20} />
                </div>
                <div className="min-w-0 flex-1 px-3 py-2">
                    <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-semibold text-main-100">
                            {block.title}
                        </p>
                        {hasActions ? (
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="secondary"
                                    shape="rounded-md"
                                    className="p-1"
                                    onPointerDown={(event) => {
                                        event.stopPropagation();
                                        event.preventDefault();
                                        onOpenSettings(block.id);
                                    }}
                                    title="Настройки"
                                >
                                    <Icon
                                        icon="mdi:cog-outline"
                                        width={14}
                                        height={14}
                                    />
                                </Button>
                                <Button
                                    className="p-1"
                                    shape="rounded-md"
                                    variant="danger"
                                    onPointerDown={(event) => {
                                        event.stopPropagation();
                                        event.preventDefault();
                                        onRequestDelete(block.id);
                                    }}
                                    title="Удалить"
                                >
                                    <Icon
                                        icon="mdi:trash-can-outline"
                                        width={14}
                                        height={14}
                                    />
                                </Button>
                            </div>
                        ) : null}
                    </div>
                    <p className="mt-1 text-xs text-main-400">{subtitle}</p>
                </div>
            </div>

            {children}
        </div>
    );
}
