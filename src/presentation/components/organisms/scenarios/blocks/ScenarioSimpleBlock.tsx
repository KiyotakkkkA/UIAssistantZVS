import { memo, type PointerEvent } from "react";
import type { ScenarioSimpleBlockNode } from "../../../../../types/Scenario";
import { VARIABLE_CONTINUE_OUTPUT_PORT } from "../../../../../utils/scenario/scenarioVariables";
import { ScenarioBlockFrame } from "./ScenarioBlockFrame";

type ScenarioSimpleBlockProps = {
    block: ScenarioSimpleBlockNode;
    isConnectSource: boolean;
    onPointerDown: (
        event: PointerEvent<HTMLDivElement>,
        blockId: string,
    ) => void;
    onStartConnection: (blockId: string, fromPortName?: string) => void;
    onCompleteConnection: (blockId: string) => void;
};

export const ScenarioSimpleBlock = memo(function ScenarioSimpleBlock({
    block,
    isConnectSource,
    onPointerDown,
    onStartConnection,
    onCompleteConnection,
}: ScenarioSimpleBlockProps) {
    const isStart = block.kind === "start";

    return (
        <ScenarioBlockFrame
            block={block}
            isConnectSource={isConnectSource}
            icon={isStart ? "mdi:play" : "mdi:flag-checkered"}
            iconBgClassName="bg-blue-800/90"
            subtitle={isStart ? "Стартовый блок" : "Конечный блок"}
            onPointerDown={onPointerDown}
        >
            {!isStart ? (
                <button
                    type="button"
                    className="absolute -left-2 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border border-main-700/70 bg-green-300"
                    onPointerDown={(event) => {
                        event.stopPropagation();
                        event.preventDefault();
                        onCompleteConnection(block.id);
                    }}
                    title="Вход"
                    aria-label="Вход"
                />
            ) : null}

            {isStart ? (
                <button
                    type="button"
                    className="absolute -right-2 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border border-main-700/70 bg-green-300"
                    onPointerDown={(event) => {
                        event.stopPropagation();
                        event.preventDefault();
                        onStartConnection(
                            block.id,
                            VARIABLE_CONTINUE_OUTPUT_PORT,
                        );
                    }}
                    title="Выход"
                    aria-label="Выход"
                />
            ) : null}
        </ScenarioBlockFrame>
    );
});
