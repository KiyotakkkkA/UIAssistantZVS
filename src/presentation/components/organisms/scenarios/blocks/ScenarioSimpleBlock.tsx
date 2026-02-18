import { Icon } from "@iconify/react";
import type { PointerEvent } from "react";
import type { ScenarioSimpleBlockNode } from "../../../../../types/Scenario";

type ScenarioSimpleBlockProps = {
    block: ScenarioSimpleBlockNode;
    isConnectSource: boolean;
    onPointerDown: (
        event: PointerEvent<HTMLDivElement>,
        blockId: string,
    ) => void;
    onStartConnection: (blockId: string) => void;
    onCompleteConnection: (blockId: string) => void;
};

export function ScenarioSimpleBlock({
    block,
    isConnectSource,
    onPointerDown,
    onStartConnection,
    onCompleteConnection,
}: ScenarioSimpleBlockProps) {
    const isStart = block.kind === "start";

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
        >
            <div className="flex h-full overflow-hidden rounded-xl">
                <div className="flex w-12 items-center justify-center bg-main-800/90 text-main-100">
                    <Icon
                        icon={isStart ? "mdi:play" : "mdi:flag-checkered"}
                        width={20}
                        height={20}
                    />
                </div>
                <div className="min-w-0 flex-1 px-3 py-2">
                    <p className="truncate text-sm font-semibold text-main-100">
                        {block.title}
                    </p>
                    <p className="mt-1 text-xs text-main-400">
                        {isStart ? "Стартовый блок" : "Конечный блок"}
                    </p>
                </div>
            </div>

            {!isStart ? (
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
            ) : null}

            {isStart ? (
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
            ) : null}
        </div>
    );
}
