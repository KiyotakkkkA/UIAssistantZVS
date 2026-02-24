import { memo, type MouseEvent, type PointerEvent } from "react";
import type { ScenarioSimpleBlockNode } from "../../../../../types/Scenario";
import {
    START_BLOCK_INPUT_PORT,
    VARIABLE_CONTINUE_OUTPUT_PORT,
} from "../../../../../utils/scenario/scenarioVariables";
import {
    getToolParamInputPorts,
    getToolParamOutputPorts,
} from "../../../../../utils/scenario/scenarioPorts";
import { ScenarioBlockFrame } from "./ScenarioBlockFrame";

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
        <ScenarioBlockFrame
            block={block}
            isConnectSource={isConnectSource}
            icon="mdi:robot-outline"
            iconBgClassName="bg-blue-800/90"
            subtitle="ИИ инструмент"
            onPointerDown={onPointerDown}
            onContextMenu={onContextMenu}
            onOpenSettings={onOpenSettings}
            onRequestDelete={onRequestDelete}
        >
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
        </ScenarioBlockFrame>
    );
});
