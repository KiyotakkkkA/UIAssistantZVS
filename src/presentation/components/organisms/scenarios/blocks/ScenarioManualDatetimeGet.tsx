import { Icon } from "@iconify/react";
import type { MouseEvent, PointerEvent } from "react";
import type { ScenarioSimpleBlockNode } from "../../../../../types/Scenario";
import { Button } from "../../../atoms";

type ScenarioManualDatetimeGetProps = {
    block: ScenarioSimpleBlockNode;
    isConnectSource: boolean;
    onPointerDown: (
        event: PointerEvent<HTMLDivElement>,
        blockId: string,
    ) => void;
    onStartConnection: (blockId: string) => void;
    onCompleteConnection: (blockId: string) => void;
    onOpenSettings: (blockId: string) => void;
    onRequestDelete: (blockId: string) => void;
    onContextMenu: (event: MouseEvent<HTMLDivElement>, blockId: string) => void;
};

export function ScenarioManualDatetimeGet({
    block,
    isConnectSource,
    onPointerDown,
    onStartConnection,
    onCompleteConnection,
    onOpenSettings,
    onRequestDelete,
    onContextMenu,
}: ScenarioManualDatetimeGetProps) {
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
            onContextMenu={(event) => onContextMenu(event, block.id)}
        >
            <div className="flex h-full overflow-hidden rounded-xl">
                <div className="flex w-12 items-center justify-center bg-main-800/90 text-main-100">
                    <Icon icon="mdi:clock-outline" width={20} height={20} />
                </div>
                <div className="min-w-0 flex-1 px-3 py-2">
                    <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-semibold text-main-100">
                            {block.title}
                        </p>
                        <div className="flex gap-2 items-center">
                            <Button
                                type="button"
                                className="rounded-md p-1 text-main-300 hover:bg-main-700/70"
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
                                type="button"
                                className="rounded-md p-1 text-main-300 hover:bg-main-700/70"
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
                    </div>
                    <p className="mt-1 text-xs text-main-400">
                        Получение даты/времени
                    </p>
                </div>
            </div>

            <button
                type="button"
                className="absolute -left-2 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border border-main-700/70 bg-main-100"
                onPointerDown={(event) => {
                    event.stopPropagation();
                    event.preventDefault();
                    onCompleteConnection(block.id);
                }}
                title="Вход"
                aria-label="Вход"
            />

            <button
                type="button"
                className={`absolute -right-2 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border border-main-700/70 ${isConnectSource ? "bg-main-300" : "bg-main-100"}`}
                onPointerDown={(event) => {
                    event.stopPropagation();
                    event.preventDefault();
                    onStartConnection(block.id);
                }}
                title="Выход"
                aria-label="Выход"
            />
        </div>
    );
}
