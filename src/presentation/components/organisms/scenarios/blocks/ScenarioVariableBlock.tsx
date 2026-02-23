import { memo, useMemo, type MouseEvent, type PointerEvent } from "react";
import type { ScenarioSimpleBlockNode } from "../../../../../types/Scenario";
import {
    START_BLOCK_INPUT_PORT,
    VARIABLE_CONTINUE_OUTPUT_PORT,
    getScenarioVariableTitle,
} from "../../../../../utils/scenarioVariables";
import { ScenarioBlockFrame } from "./ScenarioBlockFrame";

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
        <ScenarioBlockFrame
            block={block}
            isConnectSource={isConnectSource}
            icon="mdi:variable"
            iconBgClassName="bg-cyan-800/90"
            subtitle="Переменные"
            onPointerDown={onPointerDown}
            onContextMenu={onContextMenu}
            onOpenSettings={onOpenSettings}
            onRequestDelete={onRequestDelete}
        >
            <div
                className="absolute flex items-center gap-2"
                style={{ left: -8, top: "50%", transform: "translateY(-50%)" }}
            >
                <span className="absolute right-full mr-2 max-w-24 truncate text-[10px] text-main-300">
                    СТАРТ
                </span>
                <button
                    type="button"
                    className="h-4 w-4 rounded-full border border-main-700/70 bg-green-300"
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
                const isContinuePort =
                    output.portName === VARIABLE_CONTINUE_OUTPUT_PORT;

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
        </ScenarioBlockFrame>
    );
});
