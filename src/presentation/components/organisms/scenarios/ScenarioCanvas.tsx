import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import { Button, Dropdown } from "../../atoms";
import { useToasts } from "../../../../hooks";
import { useScenarioCanvas } from "../../../../hooks/agents";
import type {
    ScenarioConnection,
    ScenarioSceneViewport,
    ScenarioSimpleBlockNode,
} from "../../../../types/Scenario";
import { ScenarioSimpleBlock } from "./ScenarioSimpleBlock";

type Point = {
    x: number;
    y: number;
};

type DragState = {
    blockId: string;
    startClient: Point;
    origin: Point;
};

type ConnectionMenuState = {
    connectionId: string;
    x: number;
    y: number;
    token: number;
};

const CANVAS_WIDTH = 3200;
const CANVAS_HEIGHT = 2000;
const MIN_SCALE = 0.25;
const MAX_SCALE = 3;
const DEFAULT_SCALE = 1;
const DEFAULT_OFFSET = { x: 80, y: 80 };

const clamp = (value: number, min: number, max: number) =>
    Math.max(min, Math.min(max, value));

const getOutPoint = (block: ScenarioSimpleBlockNode): Point => ({
    x: block.x + block.width + 10,
    y: block.y + block.height / 2,
});

const getInPoint = (block: ScenarioSimpleBlockNode): Point => ({
    x: block.x - 10,
    y: block.y + block.height / 2,
});

const buildConnectionPath = (from: Point, to: Point) => {
    const distance = Math.abs(to.x - from.x);
    const bend = Math.max(70, Math.min(220, distance * 0.5));

    return `M ${from.x} ${from.y} C ${from.x + bend} ${from.y}, ${to.x - bend} ${to.y}, ${to.x} ${to.y}`;
};

const toScenePoint = (
    clientX: number,
    clientY: number,
    viewportRect: DOMRect,
    offset: Point,
    scale: number,
): Point => {
    return {
        x: (clientX - viewportRect.left - offset.x) / scale,
        y: (clientY - viewportRect.top - offset.y) / scale,
    };
};

const createInitialBlocks = (): ScenarioSimpleBlockNode[] => [
    {
        id: crypto.randomUUID(),
        kind: "start",
        title: "Стартовый",
        x: 420,
        y: 220,
        width: 240,
        height: 96,
    },
    {
        id: crypto.randomUUID(),
        kind: "end",
        title: "Конечный",
        x: 900,
        y: 220,
        width: 240,
        height: 96,
    },
];

export function ScenarioCanvas() {
    const viewportRef = useRef<HTMLDivElement | null>(null);
    const rafRef = useRef<number | null>(null);
    const panStartRef = useRef<Point | null>(null);
    const panOriginRef = useRef<Point | null>(null);
    const dragStateRef = useRef<DragState | null>(null);
    const pendingBlockPositionsRef = useRef<Record<string, Point> | null>(null);
    const dropdownTriggerRef = useRef<HTMLButtonElement | null>(null);

    const toasts = useToasts();
    const {
        blocks,
        setBlocks,
        connections,
        viewport,
        setViewport,
        hasScene,
        isSaving,
        createConnection,
        deleteConnection,
        saveScene,
    } = useScenarioCanvas();

    const [isPanning, setIsPanning] = useState(false);
    const [pendingConnectionFrom, setPendingConnectionFrom] = useState<
        string | null
    >(null);
    const [pointerScenePoint, setPointerScenePoint] = useState<Point | null>(
        null,
    );
    const [connectionMenu, setConnectionMenu] =
        useState<ConnectionMenuState | null>(null);

    const [showGrid, setShowGrid] = useState(viewport.showGrid ?? true);
    const [scale, setScale] = useState(viewport.scale ?? DEFAULT_SCALE);
    const [offset, setOffset] = useState<Point>({
        x: viewport.offsetX ?? DEFAULT_OFFSET.x,
        y: viewport.offsetY ?? DEFAULT_OFFSET.y,
    });

    useEffect(() => {
        setShowGrid(viewport.showGrid ?? true);
        setScale(viewport.scale ?? DEFAULT_SCALE);
        setOffset({
            x: viewport.offsetX ?? DEFAULT_OFFSET.x,
            y: viewport.offsetY ?? DEFAULT_OFFSET.y,
        });
    }, [viewport.offsetX, viewport.offsetY, viewport.scale, viewport.showGrid]);

    const blocksById = useMemo(
        () => new Map(blocks.map((block) => [block.id, block])),
        [blocks],
    );

    const zoomPercent = Math.round(scale * 100);

    const gridStyle = useMemo(() => {
        if (!showGrid) {
            return {};
        }

        return {
            backgroundImage:
                "linear-gradient(to right, rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.08) 1px, transparent 1px)",
            backgroundSize: `${32 * scale}px ${32 * scale}px`,
            backgroundPosition: `${offset.x}px ${offset.y}px`,
        };
    }, [showGrid, scale, offset.x, offset.y]);

    const applyViewport = useCallback(
        (partial: Partial<ScenarioSceneViewport>) => {
            setViewport((prev) => ({
                ...prev,
                canvasWidth: CANVAS_WIDTH,
                canvasHeight: CANVAS_HEIGHT,
                scale,
                offsetX: offset.x,
                offsetY: offset.y,
                showGrid,
                ...partial,
            }));
        },
        [setViewport, scale, offset.x, offset.y, showGrid],
    );

    const scheduleBlocksCommit = () => {
        if (rafRef.current !== null) {
            return;
        }

        rafRef.current = requestAnimationFrame(() => {
            rafRef.current = null;

            const pending = pendingBlockPositionsRef.current;

            if (!pending) {
                return;
            }

            setBlocks((prev) =>
                prev.map((block) => {
                    const next = pending[block.id];

                    if (!next) {
                        return block;
                    }

                    return {
                        ...block,
                        x: next.x,
                        y: next.y,
                    };
                }),
            );
        });
    };

    const beginPan = (event: React.MouseEvent<HTMLDivElement>) => {
        if (event.button !== 0 || dragStateRef.current) {
            return;
        }

        setConnectionMenu(null);
        setIsPanning(true);
        panStartRef.current = { x: event.clientX, y: event.clientY };
        panOriginRef.current = offset;
    };

    const beginDragBlock = (
        event: React.PointerEvent<HTMLDivElement>,
        blockId: string,
    ) => {
        event.stopPropagation();

        const block = blocksById.get(blockId);

        if (!block) {
            return;
        }

        dragStateRef.current = {
            blockId,
            startClient: { x: event.clientX, y: event.clientY },
            origin: { x: block.x, y: block.y },
        };

        setConnectionMenu(null);
    };

    const onMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
        const viewportRect = viewportRef.current?.getBoundingClientRect();

        if (viewportRect) {
            const scenePoint = toScenePoint(
                event.clientX,
                event.clientY,
                viewportRect,
                offset,
                scale,
            );
            setPointerScenePoint(scenePoint);
        }

        if (dragStateRef.current && viewportRect) {
            const dragState = dragStateRef.current;
            const deltaX = (event.clientX - dragState.startClient.x) / scale;
            const deltaY = (event.clientY - dragState.startClient.y) / scale;

            pendingBlockPositionsRef.current = {
                ...(pendingBlockPositionsRef.current || {}),
                [dragState.blockId]: {
                    x: dragState.origin.x + deltaX,
                    y: dragState.origin.y + deltaY,
                },
            };

            scheduleBlocksCommit();
            return;
        }

        if (!isPanning || !panStartRef.current || !panOriginRef.current) {
            return;
        }

        const deltaX = event.clientX - panStartRef.current.x;
        const deltaY = event.clientY - panStartRef.current.y;

        setOffset({
            x: panOriginRef.current.x + deltaX,
            y: panOriginRef.current.y + deltaY,
        });
    };

    const endPointerInteractions = () => {
        if (dragStateRef.current) {
            dragStateRef.current = null;
            pendingBlockPositionsRef.current = null;
        }

        if (isPanning) {
            setIsPanning(false);
            panStartRef.current = null;
            panOriginRef.current = null;
        }
    };

    const onWheel = (event: React.WheelEvent<HTMLDivElement>) => {
        event.preventDefault();

        const viewportEl = viewportRef.current;

        if (!viewportEl) {
            return;
        }

        const rect = viewportEl.getBoundingClientRect();
        const pointerX = event.clientX - rect.left;
        const pointerY = event.clientY - rect.top;
        const zoomIntensity = event.deltaY > 0 ? -0.1 : 0.1;

        setScale((prevScale) => {
            const nextScale = clamp(
                prevScale + zoomIntensity,
                MIN_SCALE,
                MAX_SCALE,
            );

            if (nextScale === prevScale) {
                return prevScale;
            }

            setOffset((prevOffset) => ({
                x:
                    pointerX -
                    ((pointerX - prevOffset.x) / prevScale) * nextScale,
                y:
                    pointerY -
                    ((pointerY - prevOffset.y) / prevScale) * nextScale,
            }));

            return nextScale;
        });
    };

    const createInitialScene = () => {
        const initialBlocks = createInitialBlocks();
        setBlocks(initialBlocks);
        setConnectionMenu(null);
        setPendingConnectionFrom(null);
    };

    const resetView = () => {
        setScale(DEFAULT_SCALE);
        setOffset(DEFAULT_OFFSET);
    };

    const handleStartConnection = (blockId: string) => {
        const block = blocksById.get(blockId);

        if (!block || block.kind !== "start") {
            return;
        }

        setConnectionMenu(null);

        setPendingConnectionFrom((prev) => (prev === blockId ? null : blockId));
    };

    const handleCompleteConnection = (blockId: string) => {
        if (!pendingConnectionFrom) {
            return;
        }

        const sourceBlock = blocksById.get(pendingConnectionFrom);
        const targetBlock = blocksById.get(blockId);

        if (!sourceBlock || !targetBlock) {
            return;
        }

        if (sourceBlock.kind !== "start" || targetBlock.kind !== "end") {
            return;
        }

        createConnection(pendingConnectionFrom, blockId);
        setPendingConnectionFrom(null);
    };

    const handleConnectionClick = (
        event: React.MouseEvent<SVGPathElement>,
        connection: ScenarioConnection,
    ) => {
        event.stopPropagation();

        const rect = viewportRef.current?.getBoundingClientRect();

        if (!rect) {
            return;
        }

        setConnectionMenu({
            connectionId: connection.id,
            x: event.clientX - rect.left,
            y: event.clientY - rect.top,
            token: Date.now(),
        });
    };

    const handleSaveScene = useCallback(async () => {
        try {
            const saved = await saveScene({
                scale,
                offsetX: offset.x,
                offsetY: offset.y,
                showGrid,
                canvasWidth: CANVAS_WIDTH,
                canvasHeight: CANVAS_HEIGHT,
            });

            if (saved) {
                toasts.success({
                    title: "Сцена сохранена!",
                    description: "Изменения применены успешно.",
                });
                return;
            }

            toasts.warning({
                title: "Не удалось сохранить",
                description: "Сценарий не активен или был удалён.",
            });
        } catch (error) {
            toasts.danger({
                title: "Ошибка сохранения",
                description:
                    error instanceof Error
                        ? error.message
                        : "Не удалось сохранить сцену.",
            });
        }
    }, [offset.x, offset.y, saveScene, scale, showGrid, toasts]);

    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if (
                (event.ctrlKey || event.metaKey) &&
                event.key.toLowerCase() === "s"
            ) {
                event.preventDefault();
                void handleSaveScene();
            }
        };

        window.addEventListener("keydown", onKeyDown);

        return () => {
            window.removeEventListener("keydown", onKeyDown);
        };
    }, [handleSaveScene]);

    useEffect(() => {
        applyViewport({
            scale,
            offsetX: offset.x,
            offsetY: offset.y,
            showGrid,
            canvasWidth: CANVAS_WIDTH,
            canvasHeight: CANVAS_HEIGHT,
        });
    }, [applyViewport, offset.x, offset.y, scale, showGrid]);

    useEffect(() => {
        if (!connectionMenu?.token) {
            return;
        }

        const timer = window.setTimeout(() => {
            dropdownTriggerRef.current?.click();
        }, 0);

        return () => {
            window.clearTimeout(timer);
        };
    }, [connectionMenu?.token]);

    useEffect(() => {
        return () => {
            if (rafRef.current !== null) {
                cancelAnimationFrame(rafRef.current);
            }
        };
    }, []);

    const temporaryConnectionPath = useMemo(() => {
        if (!pendingConnectionFrom || !pointerScenePoint) {
            return null;
        }

        const sourceBlock = blocksById.get(pendingConnectionFrom);

        if (!sourceBlock) {
            return null;
        }

        return buildConnectionPath(getOutPoint(sourceBlock), pointerScenePoint);
    }, [blocksById, pendingConnectionFrom, pointerScenePoint]);

    return (
        <div className="relative flex min-h-0 flex-1 overflow-hidden rounded-2xl border border-main-700/70 bg-main-900/50">
            <div className="absolute right-3 top-3 z-20 flex items-center gap-1 rounded-xl border border-main-700/70 bg-main-900/85 p-1.5 backdrop-blur-md">
                {!hasScene ? (
                    <Button
                        variant=""
                        className="h-8 rounded-lg border border-main-700/70 bg-main-900/40 px-3 text-xs text-main-100 hover:bg-main-700/70"
                        onClick={createInitialScene}
                    >
                        Сгенерировать
                    </Button>
                ) : null}

                <Button
                    variant=""
                    className={`h-8 w-8 rounded-lg border border-main-700/70 text-main-200 hover:bg-main-700/70 ${showGrid ? "bg-main-700/50" : "bg-main-900/40"}`}
                    onClick={() => setShowGrid((prev) => !prev)}
                    title={showGrid ? "Выключить сетку" : "Включить сетку"}
                    aria-label={showGrid ? "Выключить сетку" : "Включить сетку"}
                >
                    <Icon icon="mdi:grid" width={16} height={16} />
                </Button>

                <Button
                    variant=""
                    className="h-8 w-8 rounded-lg border border-main-700/70 bg-main-900/40 text-main-400"
                    disabled
                    title="Магнит (пока недоступен)"
                    aria-label="Магнит (пока недоступен)"
                >
                    <Icon icon="mdi:magnet" width={16} height={16} />
                </Button>

                <Button
                    variant=""
                    className="h-8 w-8 rounded-lg border border-main-700/70 bg-main-900/40 text-main-200 hover:bg-main-700/70"
                    onClick={resetView}
                    title="Сбросить масштаб"
                    aria-label="Сбросить масштаб"
                >
                    <Icon
                        icon="mdi:fit-to-screen-outline"
                        width={16}
                        height={16}
                    />
                </Button>

                <div className="min-w-12 rounded-lg border border-main-700/70 bg-main-900/40 px-2 py-1 text-center text-xs font-medium text-main-200">
                    {zoomPercent}%
                </div>

                <Button
                    variant="primary"
                    className="h-8 px-3 text-xs"
                    onClick={() => {
                        void handleSaveScene();
                    }}
                    disabled={isSaving}
                >
                    Сохранить
                </Button>
            </div>

            <div
                ref={viewportRef}
                className={`relative h-full w-full overflow-hidden ${isPanning ? "cursor-grabbing" : "cursor-grab"}`}
                onMouseDown={(event) => {
                    setConnectionMenu(null);
                    beginPan(event);
                }}
                onMouseMove={onMouseMove}
                onMouseUp={endPointerInteractions}
                onMouseLeave={endPointerInteractions}
                onWheel={onWheel}
                style={gridStyle}
            >
                <div
                    className="absolute left-0 top-0"
                    style={{
                        width: CANVAS_WIDTH,
                        height: CANVAS_HEIGHT,
                        transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
                        transformOrigin: "top left",
                    }}
                >
                    <svg
                        className="absolute left-0 top-0 h-full w-full overflow-visible"
                        width={CANVAS_WIDTH}
                        height={CANVAS_HEIGHT}
                    >
                        <defs>
                            <marker
                                id="scenario-arrow"
                                markerWidth="10"
                                markerHeight="8"
                                refX="9"
                                refY="4"
                                orient="auto"
                            >
                                <path
                                    d="M0,0 L10,4 L0,8 Z"
                                    fill="rgba(160, 171, 206, 0.95)"
                                />
                            </marker>
                        </defs>

                        {connections.map((connection) => {
                            const sourceBlock = blocksById.get(
                                connection.fromBlockId,
                            );
                            const targetBlock = blocksById.get(
                                connection.toBlockId,
                            );

                            if (!sourceBlock || !targetBlock) {
                                return null;
                            }

                            const pathD = buildConnectionPath(
                                getOutPoint(sourceBlock),
                                getInPoint(targetBlock),
                            );

                            return (
                                <g key={connection.id}>
                                    <path
                                        d={pathD}
                                        fill="none"
                                        stroke="rgba(160, 171, 206, 0.95)"
                                        strokeWidth={2}
                                        markerEnd="url(#scenario-arrow)"
                                    />
                                    <path
                                        d={pathD}
                                        fill="none"
                                        stroke="transparent"
                                        strokeWidth={14}
                                        onMouseDown={(event) =>
                                            handleConnectionClick(
                                                event,
                                                connection,
                                            )
                                        }
                                    />
                                </g>
                            );
                        })}

                        {temporaryConnectionPath ? (
                            <path
                                d={temporaryConnectionPath}
                                fill="none"
                                stroke="rgba(160, 171, 206, 0.75)"
                                strokeDasharray="6 4"
                                strokeWidth={2}
                            />
                        ) : null}
                    </svg>

                    {blocks.map((block) => (
                        <ScenarioSimpleBlock
                            key={block.id}
                            block={block}
                            isConnectSource={pendingConnectionFrom === block.id}
                            onPointerDown={beginDragBlock}
                            onStartConnection={handleStartConnection}
                            onCompleteConnection={handleCompleteConnection}
                        />
                    ))}
                </div>

                {connectionMenu ? (
                    <div
                        className="absolute z-30"
                        style={{
                            left: connectionMenu.x,
                            top: connectionMenu.y,
                        }}
                    >
                        <Dropdown
                            key={connectionMenu.token}
                            options={[
                                {
                                    value: "delete",
                                    label: "Удалить соединение",
                                    icon: (
                                        <Icon
                                            icon="mdi:trash-can-outline"
                                            width={16}
                                            height={16}
                                        />
                                    ),
                                    onClick: () => {
                                        deleteConnection(
                                            connectionMenu.connectionId,
                                        );
                                        setConnectionMenu(null);
                                    },
                                },
                            ]}
                            menuPlacement="bottom"
                            closeOnSelect
                            matchTriggerWidth={false}
                            renderTrigger={({
                                toggleOpen,
                                triggerRef,
                                ariaProps,
                            }) => (
                                <Button
                                    variant=""
                                    className="h-7 w-7 rounded-lg border border-main-700/70 bg-main-900/95 text-main-200 hover:bg-main-700/80"
                                    ref={(element) => {
                                        if (typeof triggerRef === "function") {
                                            triggerRef(element);
                                        } else if (
                                            triggerRef &&
                                            "current" in triggerRef
                                        ) {
                                            (
                                                triggerRef as {
                                                    current: HTMLButtonElement | null;
                                                }
                                            ).current = element;
                                        }

                                        dropdownTriggerRef.current = element;
                                    }}
                                    onClick={toggleOpen}
                                    {...ariaProps}
                                >
                                    <Icon
                                        icon="mdi:dots-vertical"
                                        width={16}
                                        height={16}
                                    />
                                </Button>
                            )}
                        />
                    </div>
                ) : null}
            </div>
        </div>
    );
}
