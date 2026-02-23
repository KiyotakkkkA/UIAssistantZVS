import { Icon } from "@iconify/react";
import { memo, type MouseEvent, type PointerEvent } from "react";
import type { ScenarioSimpleBlockNode } from "../../../../../types/Scenario";
import { Button } from "../../../atoms";
import {
    START_BLOCK_INPUT_PORT,
    VARIABLE_CONTINUE_OUTPUT_PORT,
} from "../../../../../utils/scenarioVariables";
import {
    getToolParamInputPorts,
    getToolParamOutputPorts,
} from "../../../../../utils/scenarioPorts";

type ScenarioToolBlockProps = {
    block: ScenarioSimpleBlockNode;
    isConnectSource: boolean;
    connectedInputNames: Set<string>;
    onPointerDown: (
        event: PointerEvent<HTMLDivElement>,
        blockId: string,
    ) => void;
    onStartConnection: (blockId: string, fromPortName?: string) => void;
    onCompleteConnection: (blockId: string, toPortName?: string) => void;
    onOpenSettings: (blockId: string) => void;
    onRequestDelete: (blockId: string) => void;
    onContextMenu: (event: MouseEvent<HTMLDivElement>, blockId: string) => void;
};

export const ScenarioToolBlock = memo(function ScenarioToolBlock({
    block,
    isConnectSource,
    connectedInputNames,
    onPointerDown,
    onStartConnection,
    onCompleteConnection,
    onOpenSettings,
    onRequestDelete,
    onContextMenu,
}: ScenarioToolBlockProps) {
    const paramInputs = getToolParamInputPorts(block);
    const inputPorts = [START_BLOCK_INPUT_PORT, ...paramInputs];
    const paramOutputs = getToolParamOutputPorts(block);
    const outputPorts = [...paramOutputs, VARIABLE_CONTINUE_OUTPUT_PORT];

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
                <div className="flex w-12 items-center justify-center bg-blue-800/90 text-main-100">
                    <Icon icon="mdi:robot-outline" width={20} height={20} />
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
                    <p className="mt-1 text-xs text-main-400">ИИ инструмент</p>
                </div>
            </div>

            {inputPorts.map((inputPort, index) => {
                const topPercent =
                    ((index + 1) / (inputPorts.length + 1)) * 100;
                const isStartPort = inputPort === START_BLOCK_INPUT_PORT;
                const toolInput = block.meta?.tool?.input?.find(
                    (item) => item.param === inputPort,
                );
                const hasDefaultValue =
                    toolInput?.defaultValue !== undefined &&
                    toolInput?.defaultValue !== null;
                const isConnected = connectedInputNames.has(inputPort);
                const shouldMarkMissing =
                    !isStartPort && !isConnected && !hasDefaultValue;
                const label = isStartPort ? "СТАРТ" : inputPort;

                return (
                    <div
                        key={inputPort}
                        className="absolute flex items-center gap-2"
                        style={{
                            left: -8,
                            top: `${topPercent}%`,
                            transform: "translateY(-50%)",
                        }}
                    >
                        <div className="relative flex items-center">
                            <span
                                className="absolute max-w-24 truncate text-[10px] text-main-300 right-full mr-2"
                                title={label}
                            >
                                {label}
                            </span>
                            <button
                                type="button"
                                className={`h-4 w-4 rounded-full border ${
                                    isStartPort
                                        ? "border-main-700/70 bg-green-300"
                                        : shouldMarkMissing
                                          ? "border-red-500 bg-red-500/80"
                                          : "border-main-700/70 bg-main-100"
                                }`}
                                onPointerDown={(event) => {
                                    event.stopPropagation();
                                    event.preventDefault();
                                    onCompleteConnection(block.id, inputPort);
                                }}
                                title={`Вход: ${label}`}
                                aria-label={`Вход: ${label}`}
                            />
                        </div>
                    </div>
                );
            })}

            {outputPorts.map((outputPort, index) => {
                const topPercent =
                    ((index + 1) / (outputPorts.length + 1)) * 100;
                const isContinuePort =
                    outputPort === VARIABLE_CONTINUE_OUTPUT_PORT;
                const outputLabel = isContinuePort ? "ПРОДОЛЖИТЬ" : outputPort;

                return (
                    <div
                        key={outputPort}
                        className="absolute flex items-center gap-2"
                        style={{
                            right: -8,
                            top: `${topPercent}%`,
                            transform: "translateY(-50%)",
                        }}
                    >
                        <button
                            type="button"
                            className={`h-4 w-4 rounded-full border border-main-700/70 ${
                                isContinuePort
                                    ? "bg-green-300"
                                    : isConnectSource
                                      ? "bg-main-300"
                                      : "bg-main-100"
                            }`}
                            onPointerDown={(event) => {
                                event.stopPropagation();
                                event.preventDefault();
                                onStartConnection(block.id, outputPort);
                            }}
                            title={`Выход: ${outputLabel}`}
                            aria-label={`Выход: ${outputLabel}`}
                        />
                        <span
                            className="absolute max-w-28 truncate text-[10px] text-main-300 left-full ml-2"
                            title={outputLabel}
                        >
                            {outputLabel}
                        </span>
                    </div>
                );
            })}
        </div>
    );
});
