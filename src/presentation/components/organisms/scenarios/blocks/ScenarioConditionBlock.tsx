import { memo, type MouseEvent, type PointerEvent } from "react";
import type {
    ScenarioConditionField,
    ScenarioSimpleBlockNode,
} from "../../../../../types/Scenario";
import { START_BLOCK_INPUT_PORT } from "../../../../../utils/scenario/scenarioVariables";
import { ScenarioBlockFrame } from "./ScenarioBlockFrame";

type ScenarioConditionBlockProps = {
    block: ScenarioSimpleBlockNode;
    isConnectSource: boolean;
    connectedInputNames: Set<string>;
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

const getConditionFields = (
    block: ScenarioSimpleBlockNode,
): ScenarioConditionField[] => {
    const raw = block.meta?.condition?.fields;

    if (!Array.isArray(raw) || raw.length === 0) {
        return [{ id: "condition_default", name: "value" }];
    }

    return raw;
};

export const ScenarioConditionBlock = memo(function ScenarioConditionBlock({
    block,
    isConnectSource,
    connectedInputNames,
    onPointerDown,
    onStartConnection,
    onCompleteConnection,
    onContextMenu,
    onOpenSettings,
    onRequestDelete,
}: ScenarioConditionBlockProps) {
    const fields = getConditionFields(block);

    return (
        <ScenarioBlockFrame
            block={block}
            isConnectSource={isConnectSource}
            icon="mdi:source-branch"
            iconBgClassName="bg-amber-700/90"
            subtitle="Условие"
            onPointerDown={onPointerDown}
            onContextMenu={onContextMenu}
            onOpenSettings={onOpenSettings}
            onRequestDelete={onRequestDelete}
        >
            {fields.map((field, index) => {
                const topPercent =
                    (0.24 + ((index + 1) / (fields.length + 1)) * 0.68) * 100;
                const connected = connectedInputNames.has(field.name);

                return (
                    <div
                        key={field.id}
                        className="absolute flex items-center gap-2"
                        style={{
                            left: -8,
                            top: `${topPercent}%`,
                            transform: "translateY(-50%)",
                        }}
                    >
                        <span
                            className="absolute right-full mr-2 max-w-24 truncate text-[10px] text-main-300"
                            title={field.name}
                        >
                            {field.name}
                        </span>
                        <button
                            type="button"
                            className={`h-4 w-4 rounded-full border ${connected ? "border-main-700/70 bg-main-100" : "border-red-500 bg-red-500/80"}`}
                            onPointerDown={(event) => {
                                event.stopPropagation();
                                event.preventDefault();
                                onCompleteConnection(block.id, field.name);
                            }}
                            title={`Вход: ${field.name}`}
                            aria-label={`Вход: ${field.name}`}
                        />
                    </div>
                );
            })}

            <div
                className="absolute flex items-center gap-2"
                style={{ left: -8, top: "14%", transform: "translateY(-50%)" }}
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

            <div
                className="absolute flex items-center gap-2"
                style={{ right: -8, top: "28%", transform: "translateY(-50%)" }}
            >
                <button
                    type="button"
                    className={`h-4 w-4 rounded-full border border-main-700/70 ${isConnectSource ? "bg-main-300" : "bg-main-100"}`}
                    onPointerDown={(event) => {
                        event.stopPropagation();
                        event.preventDefault();
                        onStartConnection(block.id, "yes");
                    }}
                    title="Да"
                    aria-label="Да"
                />
                <span className="absolute left-full ml-2 max-w-24 truncate text-[10px] text-main-300">
                    Да
                </span>
            </div>

            <div
                className="absolute flex items-center gap-2"
                style={{ right: -8, top: "50%", transform: "translateY(-50%)" }}
            >
                <button
                    type="button"
                    className={`h-4 w-4 rounded-full border border-main-700/70 ${isConnectSource ? "bg-main-300" : "bg-main-100"}`}
                    onPointerDown={(event) => {
                        event.stopPropagation();
                        event.preventDefault();
                        onStartConnection(block.id, "no");
                    }}
                    title="Нет"
                    aria-label="Нет"
                />
                <span className="absolute left-full ml-2 max-w-24 truncate text-[10px] text-main-300">
                    Нет
                </span>
            </div>

            <div
                className="absolute flex items-center gap-2"
                style={{ right: -8, top: "72%", transform: "translateY(-50%)" }}
            >
                <button
                    type="button"
                    className={`h-4 w-4 rounded-full border border-main-700/70 ${isConnectSource ? "bg-main-300" : "bg-main-100"}`}
                    onPointerDown={(event) => {
                        event.stopPropagation();
                        event.preventDefault();
                        onStartConnection(block.id, "always");
                    }}
                    title="В любом случае"
                    aria-label="В любом случае"
                />
                <span className="absolute left-full ml-2 max-w-28 truncate text-[10px] text-main-300">
                    В любом случае
                </span>
            </div>
        </ScenarioBlockFrame>
    );
});
