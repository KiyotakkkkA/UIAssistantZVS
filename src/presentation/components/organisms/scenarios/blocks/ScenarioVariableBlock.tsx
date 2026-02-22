import { Icon } from "@iconify/react";
import { memo, useMemo, type MouseEvent, type PointerEvent } from "react";
import type { ScenarioSimpleBlockNode } from "../../../../../types/Scenario";
import { Button } from "../../../atoms";
import {
    START_BLOCK_INPUT_PORT,
    VARIABLE_CONTINUE_OUTPUT_PORT,
    getScenarioVariableTitle,
} from "../../../../../utils/scenarioVariables";

type ScenarioVariableBlockProps = {
    block: ScenarioSimpleBlockNode;
    isConnectSource: boolean;
    onPointerDown: (
        event: PointerEvent<HTMLDivElement>,
        blockId: string,
    ) => void;
    onStartConnection: (blockId: string, fromPortName?: string) => void;
    onCompleteConnection: (blockId: string, toPortName?: string) => void;
    onContextMenu: (event: MouseEvent<HTMLDivElement>, blockId: string) => void;
    onOpenSettings: (blockId: string) => void;
    onRequestDelete: (blockId: string) => void;
};

export const ScenarioVariableBlock = memo(function ScenarioVariableBlock({
    block,
    isConnectSource,
    onPointerDown,
    onStartConnection,
    onCompleteConnection,
    onContextMenu,
    onOpenSettings,
    onRequestDelete,
}: ScenarioVariableBlockProps) {
    const outputPorts = useMemo(() => {
        const selected = block.meta?.variable?.selectedVariables ?? [];

        return [
            ...selected.map((item) => ({
                portName: item,
                label: getScenarioVariableTitle(item),
            })),
            {
                portName: VARIABLE_CONTINUE_OUTPUT_PORT,
                label: "ПРОДОЛЖИТЬ",
            },
        ];
    }, [block.meta?.variable?.selectedVariables]);

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
                <div className="flex w-12 items-center justify-center bg-cyan-800/90 text-main-100">
                    <Icon icon="mdi:variable" width={20} height={20} />
                </div>
                <div className="min-w-0 flex-1 px-3 py-2">
                    <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-semibold text-main-100">
                            {block.title}
                        </p>
                        <div className="flex items-center gap-2">
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
                    <p className="mt-1 text-xs text-main-400">Переменные</p>
                </div>
            </div>

            <div
                className="absolute flex items-center gap-2"
                style={{ left: -8, top: "50%", transform: "translateY(-50%)" }}
            >
                <span className="absolute right-full mr-2 max-w-24 truncate text-[10px] text-main-300">
                    СТАРТ
                </span>
                <button
                    type="button"
                    className="h-4 w-4 rounded-full border border-main-700/70 bg-main-100"
                    onPointerDown={(event) => {
                        event.stopPropagation();
                        event.preventDefault();
                        onCompleteConnection(block.id, START_BLOCK_INPUT_PORT);
                    }}
                    title="Вход от стартового блока"
                    aria-label="Вход от стартового блока"
                />
            </div>

            {outputPorts.map((output, index) => {
                const topPercent =
                    ((index + 1) / (outputPorts.length + 1)) * 100;

                return (
                    <div
                        key={output.portName}
                        className="absolute flex items-center gap-2"
                        style={{
                            right: -8,
                            top: `${topPercent}%`,
                            transform: "translateY(-50%)",
                        }}
                    >
                        <button
                            type="button"
                            className={`h-4 w-4 rounded-full border border-main-700/70 ${isConnectSource ? "bg-main-300" : "bg-main-100"}`}
                            onPointerDown={(event) => {
                                event.stopPropagation();
                                event.preventDefault();
                                onStartConnection(block.id, output.portName);
                            }}
                            title={`Выход: ${output.label}`}
                            aria-label={`Выход: ${output.label}`}
                        />
                        <span
                            className="absolute left-full ml-2 max-w-28 truncate text-[10px] text-main-300"
                            title={output.label}
                        >
                            {output.label}
                        </span>
                    </div>
                );
            })}
        </div>
    );
});
