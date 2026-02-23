import { memo, type MouseEvent, type PointerEvent } from "react";
import type { ScenarioSimpleBlockNode } from "../../../../../types/Scenario";
import {
    START_BLOCK_INPUT_PORT,
    VARIABLE_CONTINUE_OUTPUT_PORT,
} from "../../../../../utils/scenarioVariables";
import { ScenarioBlockFrame } from "./ScenarioBlockFrame";

type ScenarioPromptBlockProps = {
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

export const ScenarioPromptBlock = memo(function ScenarioPromptBlock({
    block,
    isConnectSource,
    onPointerDown,
    onStartConnection,
    onCompleteConnection,
    onContextMenu,
    onOpenSettings,
    onRequestDelete,
}: ScenarioPromptBlockProps) {
    return (
        <ScenarioBlockFrame
            block={block}
            isConnectSource={isConnectSource}
            icon="mdi:text-box-edit-outline"
            iconBgClassName="bg-indigo-800/90"
            subtitle="Инструкция"
            onPointerDown={onPointerDown}
            onContextMenu={onContextMenu}
            onOpenSettings={onOpenSettings}
            onRequestDelete={onRequestDelete}
        >
            <div
                className="absolute flex items-center gap-2"
                style={{ left: -8, top: "50%", transform: "translateY(-50%)" }}
            >
                <span className="absolute max-w-24 truncate text-[10px] text-main-300 right-full mr-2">
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

            <div
                className="absolute flex items-center gap-2"
                style={{ right: -8, top: "50%", transform: "translateY(-50%)" }}
            >
                <button
                    type="button"
                    className="h-4 w-4 rounded-full border border-main-700/70 bg-green-300"
                    onPointerDown={(event) => {
                        event.stopPropagation();
                        event.preventDefault();
                        onStartConnection(
                            block.id,
                            VARIABLE_CONTINUE_OUTPUT_PORT,
                        );
                    }}
                    title="Выход: продолжить"
                    aria-label="Выход: продолжить"
                />
                <span className="absolute left-full ml-2 max-w-24 truncate text-[10px] text-main-300">
                    ПРОДОЛЖИТЬ
                </span>
            </div>
        </ScenarioBlockFrame>
    );
});
