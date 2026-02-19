import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import {
    Button,
    Dropdown,
    InputBig,
    InputCheckbox,
    InputSmall,
    Modal,
    Select,
} from "../../atoms";
import { useToasts } from "../../../../hooks";
import { useScenarioCanvas } from "../../../../hooks/agents";
import type { ScenarioCanvasInsertPayload } from "../../../../hooks/agents";
import type {
    ScenarioBlockToolsParamsUsage,
    ScenarioConnection,
    ScenarioManualDatetimeGetMeta,
    ScenarioManualHttpRequestMeta,
    ScenarioSceneViewport,
    ScenarioSimpleBlockNode,
    ScenarioToolMeta,
} from "../../../../types/Scenario";
import { ShikiCodeBlock } from "../../molecules/render/ShikiCodeBlock";
import { ScenarioCanvasToolbar } from "./support/ScenarioCanvasToolbar";
import { ScenarioConnectionsLayer } from "./support/ScenarioConnectionsLayer";
import { ScenarioSimpleBlock } from "./blocks/ScenarioSimpleBlock";
import { ScenarioToolBlock } from "./blocks/ScenarioToolBlock";

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

type BlockMenuState = {
    blockId: string;
    x: number;
    y: number;
    token: number;
};

export type ScenarioCanvasInsertRequest = {
    token: number;
} & ScenarioCanvasInsertPayload;

type ScenarioCanvasProps = {
    insertRequest?: ScenarioCanvasInsertRequest | null;
    onInsertHandled?: () => void;
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

const prettyResponse = (raw: string) => {
    try {
        return JSON.stringify(JSON.parse(raw), null, 2);
    } catch {
        return raw;
    }
};

type ScenarioToolSchemaProperty = {
    description?: string;
    default?: unknown;
};

type ScenarioToolSchemaField = {
    param: string;
    description: string;
    schemaDefaultValue?: string;
};

const stringifySchemaValue = (value: unknown): string => {
    if (typeof value === "string") {
        return value;
    }

    try {
        return JSON.stringify(value);
    } catch {
        return String(value);
    }
};

const parseToolSchemaFields = (schema: string): ScenarioToolSchemaField[] => {
    try {
        const parsed = JSON.parse(schema) as {
            properties?: Record<string, ScenarioToolSchemaProperty>;
        };

        if (!parsed.properties || typeof parsed.properties !== "object") {
            return [];
        }

        return Object.entries(parsed.properties).map(([param, property]) => {
            const hasDefault =
                property &&
                typeof property === "object" &&
                "default" in property;

            return {
                param,
                description:
                    typeof property?.description === "string"
                        ? property.description
                        : "",
                ...(hasDefault
                    ? {
                          schemaDefaultValue: stringifySchemaValue(
                              property.default,
                          ),
                      }
                    : {}),
            };
        });
    } catch {
        return [];
    }
};

export function ScenarioCanvas({
    insertRequest,
    onInsertHandled,
}: ScenarioCanvasProps) {
    const viewportRef = useRef<HTMLDivElement | null>(null);
    const rafRef = useRef<number | null>(null);
    const panStartRef = useRef<Point | null>(null);
    const panOriginRef = useRef<Point | null>(null);
    const dragStateRef = useRef<DragState | null>(null);
    const pendingBlockPositionsRef = useRef<Record<string, Point> | null>(null);
    const dropdownTriggerRef = useRef<HTMLButtonElement | null>(null);
    const blockMenuTriggerRef = useRef<HTMLButtonElement | null>(null);

    const toasts = useToasts();
    const {
        blocks,
        blocksById,
        setBlocks,
        connections,
        viewport,
        setViewport,
        hasScene,
        isSaving,
        createInitialScene,
        insertBlock,
        removeBlock,
        completeConnection,
        deleteConnection,
        updateManualHttpMeta,
        updateManualDatetimeMeta,
        updateToolMeta,
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
    const [blockMenu, setBlockMenu] = useState<BlockMenuState | null>(null);

    const [showGrid, setShowGrid] = useState(viewport.showGrid ?? true);
    const [scale, setScale] = useState(viewport.scale ?? DEFAULT_SCALE);
    const [offset, setOffset] = useState<Point>({
        x: viewport.offsetX ?? DEFAULT_OFFSET.x,
        y: viewport.offsetY ?? DEFAULT_OFFSET.y,
    });

    const [settingsBlockId, setSettingsBlockId] = useState<string | null>(null);
    const [deleteBlockId, setDeleteBlockId] = useState<string | null>(null);

    const [httpUrl, setHttpUrl] = useState("");
    const [httpMethod, setHttpMethod] = useState("GET");
    const [httpFormatter, setHttpFormatter] = useState("");
    const [httpResponse, setHttpResponse] = useState("");
    const [isHttpChecking, setIsHttpChecking] = useState(false);

    const [datetimeMode, setDatetimeMode] = useState("datetime");
    const [datetimeTimezoneMode, setDatetimeTimezoneMode] = useState("current");
    const [datetimeTimezone, setDatetimeTimezone] = useState("UTC+0");

    const [toolInput, setToolInput] = useState<ScenarioBlockToolsParamsUsage[]>(
        [],
    );

    useEffect(() => {
        setShowGrid(viewport.showGrid ?? true);
        setScale(viewport.scale ?? DEFAULT_SCALE);
        setOffset({
            x: viewport.offsetX ?? DEFAULT_OFFSET.x,
            y: viewport.offsetY ?? DEFAULT_OFFSET.y,
        });
    }, [viewport.offsetX, viewport.offsetY, viewport.scale, viewport.showGrid]);

    const activeSettingsBlock = settingsBlockId
        ? (blocksById.get(settingsBlockId) ?? null)
        : null;

    const isHttpModalOpen = activeSettingsBlock?.kind === "manual-http";
    const isDatetimeModalOpen = activeSettingsBlock?.kind === "manual-datetime";
    const isToolModalOpen = activeSettingsBlock?.kind === "tool";

    const toolSchemaFields = useMemo(() => {
        if (!isToolModalOpen || !activeSettingsBlock) {
            return [];
        }

        return parseToolSchemaFields(
            activeSettingsBlock.meta?.tool?.toolSchema || "{}",
        );
    }, [activeSettingsBlock, isToolModalOpen]);

    const toolSchemaDefaultsByParam = useMemo(
        () =>
            new Map(
                toolSchemaFields.map((field) => [
                    field.param,
                    field.schemaDefaultValue,
                ]),
            ),
        [toolSchemaFields],
    );

    useEffect(() => {
        if (!activeSettingsBlock) {
            return;
        }

        if (activeSettingsBlock.kind === "manual-http") {
            const meta = (activeSettingsBlock.meta?.manualHttp as
                | ScenarioManualHttpRequestMeta
                | undefined) ?? {
                url: "",
                method: "GET",
                formatter: "",
            };
            setHttpUrl(meta.url);
            setHttpMethod(meta.method || "GET");
            setHttpFormatter(meta.formatter || "");
            setHttpResponse(meta.lastResponseText || "");
            return;
        }

        if (activeSettingsBlock.kind === "manual-datetime") {
            const meta = (activeSettingsBlock.meta?.manualDatetime as
                | ScenarioManualDatetimeGetMeta
                | undefined) ?? {
                mode: "datetime",
                timezoneMode: "current",
                timezone: "UTC+0",
            };
            setDatetimeMode(meta.mode);
            setDatetimeTimezoneMode(meta.timezoneMode);
            setDatetimeTimezone(meta.timezone);
            return;
        }

        if (activeSettingsBlock.kind === "tool") {
            const meta = (activeSettingsBlock.meta?.tool as
                | ScenarioToolMeta
                | undefined) ?? {
                toolName: activeSettingsBlock.title,
                toolSchema: "{}",
                input: [],
            };

            const normalizedInput = Array.isArray(meta.input) ? meta.input : [];
            const schemaFields = parseToolSchemaFields(meta.toolSchema || "{}");

            if (schemaFields.length > 0) {
                const byParam = new Map(
                    normalizedInput.map((item) => [item.param, item]),
                );

                setToolInput(
                    schemaFields.map((field) => {
                        const existing = byParam.get(field.param);
                        const defaultValue =
                            existing?.defaultValue ?? field.schemaDefaultValue;

                        return {
                            param: field.param,
                            description: field.description,
                            comment: existing?.comment || "",
                            ...(defaultValue !== undefined
                                ? { defaultValue }
                                : {}),
                        };
                    }),
                );
                return;
            }

            setToolInput(normalizedInput);
        }
    }, [activeSettingsBlock]);

    useEffect(() => {
        if (!insertRequest || !viewportRef.current) {
            return;
        }

        const rect = viewportRef.current.getBoundingClientRect();
        const centerX = (rect.width / 2 - offset.x) / scale - 140;
        const centerY = (rect.height / 2 - offset.y) / scale - 48;

        insertBlock(insertRequest, {
            x: centerX,
            y: centerY,
        });
        onInsertHandled?.();
    }, [
        insertBlock,
        insertRequest,
        offset.x,
        offset.y,
        onInsertHandled,
        scale,
    ]);

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
        [offset.x, offset.y, scale, setViewport, showGrid],
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
        setBlockMenu(null);
        setIsPanning(true);
        panStartRef.current = { x: event.clientX, y: event.clientY };
        panOriginRef.current = offset;
    };

    const openBlockContextMenu = (
        event: React.MouseEvent<HTMLDivElement>,
        blockId: string,
    ) => {
        event.preventDefault();
        event.stopPropagation();

        const block = blocksById.get(blockId);
        const rect = viewportRef.current?.getBoundingClientRect();

        if (!block || !rect) {
            return;
        }

        if (block.kind === "start" || block.kind === "end") {
            return;
        }

        setConnectionMenu(null);
        setBlockMenu({
            blockId,
            x: event.clientX - rect.left,
            y: event.clientY - rect.top,
            token: Date.now(),
        });
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

    const handleCreateInitialScene = () => {
        createInitialScene();
        setConnectionMenu(null);
        setPendingConnectionFrom(null);
    };

    const resetView = () => {
        setScale(DEFAULT_SCALE);
        setOffset(DEFAULT_OFFSET);
    };

    const handleStartConnection = (blockId: string) => {
        const block = blocksById.get(blockId);

        if (!block || block.kind === "end") {
            return;
        }

        setConnectionMenu(null);
        setPendingConnectionFrom((prev) => (prev === blockId ? null : blockId));
    };

    const handleCompleteConnection = (blockId: string) => {
        if (!pendingConnectionFrom) {
            return;
        }

        completeConnection(pendingConnectionFrom, blockId);
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

    const requestDeleteBlock = (blockId: string) => {
        const block = blocksById.get(blockId);

        if (!block || block.kind === "start" || block.kind === "end") {
            return;
        }

        setBlockMenu(null);
        setDeleteBlockId(blockId);
    };

    const confirmDeleteBlock = () => {
        if (!deleteBlockId) {
            return;
        }

        removeBlock(deleteBlockId);

        if (settingsBlockId === deleteBlockId) {
            setSettingsBlockId(null);
        }

        if (pendingConnectionFrom === deleteBlockId) {
            setPendingConnectionFrom(null);
        }

        setDeleteBlockId(null);
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
                    title: "Сцена сохранена",
                    description:
                        "Позиции блоков, соединения и мета блоков сохранены.",
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
        if (!blockMenu?.token) {
            return;
        }

        const timer = window.setTimeout(() => {
            blockMenuTriggerRef.current?.click();
        }, 0);

        return () => {
            window.clearTimeout(timer);
        };
    }, [blockMenu?.token]);

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

    const saveHttpSettings = () => {
        if (
            !activeSettingsBlock ||
            activeSettingsBlock.kind !== "manual-http"
        ) {
            return;
        }

        updateManualHttpMeta(activeSettingsBlock.id, {
            url: httpUrl,
            method: httpMethod,
            formatter: httpFormatter,
            lastResponseText: httpResponse,
        });
        setSettingsBlockId(null);
    };

    const saveDatetimeSettings = () => {
        if (
            !activeSettingsBlock ||
            activeSettingsBlock.kind !== "manual-datetime"
        ) {
            return;
        }

        updateManualDatetimeMeta(activeSettingsBlock.id, {
            mode: datetimeMode as "date" | "time" | "datetime",
            timezoneMode: datetimeTimezoneMode as "current" | "manual",
            timezone: datetimeTimezone,
        });
        setSettingsBlockId(null);
    };

    const saveToolSettings = () => {
        if (!activeSettingsBlock || activeSettingsBlock.kind !== "tool") {
            return;
        }

        updateToolMeta(activeSettingsBlock.id, {
            toolName:
                activeSettingsBlock.meta?.tool?.toolName ||
                activeSettingsBlock.title,
            toolSchema: activeSettingsBlock.meta?.tool?.toolSchema || "{}",
            input: toolInput,
        });
        setSettingsBlockId(null);
    };

    const updateToolInput = useCallback(
        (
            param: string,
            updater: (
                prev: ScenarioBlockToolsParamsUsage,
            ) => ScenarioBlockToolsParamsUsage,
        ) => {
            setToolInput((prev) =>
                prev.map((item) =>
                    item.param === param ? updater(item) : item,
                ),
            );
        },
        [],
    );

    const checkHttpRequest = async () => {
        const url = httpUrl.trim();

        if (!url) {
            toasts.warning({
                title: "Укажите URL",
                description: "Поле URL не может быть пустым.",
            });
            return;
        }

        const api = window.appApi;

        if (!api?.network?.proxyHttpRequest) {
            toasts.danger({
                title: "Прокси недоступен",
                description: "Не найден backend-обработчик HTTP прокси.",
            });
            return;
        }

        setIsHttpChecking(true);

        try {
            const result = await api.network.proxyHttpRequest({
                url,
                method: httpMethod,
                formatter: httpFormatter,
            });

            const text = result.bodyText || result.statusText;
            const formatted = prettyResponse(text);

            setHttpResponse(formatted);
            toasts.info({
                title: `HTTP ${result.status}`,
                description: result.ok
                    ? "Запрос выполнен успешно."
                    : "Запрос завершился с ошибкой.",
            });
        } catch (error) {
            toasts.danger({
                title: "Ошибка запроса",
                description:
                    error instanceof Error
                        ? error.message
                        : "Не удалось выполнить запрос.",
            });
        } finally {
            setIsHttpChecking(false);
        }
    };

    return (
        <>
            <div className="relative flex min-h-0 flex-1 overflow-hidden rounded-2xl border border-main-700/70 bg-main-900/50">
                <ScenarioCanvasToolbar
                    hasScene={hasScene}
                    showGrid={showGrid}
                    zoomPercent={zoomPercent}
                    isSaving={isSaving}
                    onGenerate={handleCreateInitialScene}
                    onToggleGrid={() => setShowGrid((prev) => !prev)}
                    onResetView={resetView}
                    onSave={() => {
                        void handleSaveScene();
                    }}
                />

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
                        <ScenarioConnectionsLayer
                            canvasWidth={CANVAS_WIDTH}
                            canvasHeight={CANVAS_HEIGHT}
                            connections={connections}
                            blocksById={blocksById}
                            temporaryConnectionPath={temporaryConnectionPath}
                            buildConnectionPath={buildConnectionPath}
                            getOutPoint={getOutPoint}
                            getInPoint={getInPoint}
                            onConnectionMouseDown={handleConnectionClick}
                        />

                        {blocks.map((block) => {
                            if (block.kind === "tool") {
                                return (
                                    <ScenarioToolBlock
                                        key={block.id}
                                        block={block}
                                        isConnectSource={
                                            pendingConnectionFrom === block.id
                                        }
                                        onPointerDown={beginDragBlock}
                                        onStartConnection={
                                            handleStartConnection
                                        }
                                        onCompleteConnection={
                                            handleCompleteConnection
                                        }
                                        onOpenSettings={setSettingsBlockId}
                                        onRequestDelete={requestDeleteBlock}
                                        onContextMenu={openBlockContextMenu}
                                    />
                                );
                            }

                            return (
                                <ScenarioSimpleBlock
                                    key={block.id}
                                    block={block}
                                    isConnectSource={
                                        pendingConnectionFrom === block.id
                                    }
                                    onPointerDown={beginDragBlock}
                                    onStartConnection={handleStartConnection}
                                    onCompleteConnection={
                                        handleCompleteConnection
                                    }
                                />
                            );
                        })}
                    </div>

                    {connectionMenu ? (
                        <div
                            className="absolute z-30"
                            style={{
                                left: connectionMenu.x,
                                top: connectionMenu.y,
                            }}
                            onMouseDown={(event) => event.stopPropagation()}
                            onClick={(event) => event.stopPropagation()}
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
                                            if (
                                                typeof triggerRef === "function"
                                            ) {
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

                                            dropdownTriggerRef.current =
                                                element;
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

                    {blockMenu ? (
                        <div
                            className="absolute z-30"
                            style={{
                                left: blockMenu.x,
                                top: blockMenu.y,
                            }}
                            onMouseDown={(event) => event.stopPropagation()}
                            onClick={(event) => event.stopPropagation()}
                        >
                            <Dropdown
                                key={blockMenu.token}
                                options={[
                                    {
                                        value: "settings",
                                        label: "Настройки",
                                        icon: (
                                            <Icon
                                                icon="mdi:cog-outline"
                                                width={16}
                                                height={16}
                                            />
                                        ),
                                        onClick: () => {
                                            setSettingsBlockId(
                                                blockMenu.blockId,
                                            );
                                            setBlockMenu(null);
                                        },
                                    },
                                    {
                                        value: "delete",
                                        label: "Удалить",
                                        icon: (
                                            <Icon
                                                icon="mdi:trash-can-outline"
                                                width={16}
                                                height={16}
                                            />
                                        ),
                                        onClick: () => {
                                            requestDeleteBlock(
                                                blockMenu.blockId,
                                            );
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
                                            if (
                                                typeof triggerRef === "function"
                                            ) {
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

                                            blockMenuTriggerRef.current =
                                                element;
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

            <Modal
                open={Boolean(deleteBlockId)}
                onClose={() => setDeleteBlockId(null)}
                title="Удалить блок"
                className="max-w-md"
                footer={
                    <div className="flex gap-2">
                        <Button
                            variant="secondary"
                            shape="rounded-lg"
                            className="h-9 px-4"
                            onClick={() => setDeleteBlockId(null)}
                        >
                            Отмена
                        </Button>
                        <Button
                            variant="primary"
                            shape="rounded-lg"
                            className="h-9 px-4"
                            onClick={confirmDeleteBlock}
                        >
                            Удалить
                        </Button>
                    </div>
                }
            >
                <p className="text-sm text-main-300">
                    Блок будет удалён вместе со всеми входящими и исходящими
                    соединениями.
                </p>
            </Modal>

            <Modal
                open={Boolean(isHttpModalOpen && activeSettingsBlock)}
                onClose={() => setSettingsBlockId(null)}
                title="ScenarioManualHttpRequest"
                className="max-w-2xl"
                footer={
                    <Button
                        variant="primary"
                        shape="rounded-lg"
                        className="h-9 px-4"
                        onClick={saveHttpSettings}
                    >
                        Сохранить
                    </Button>
                }
            >
                <div className="space-y-3">
                    <div className="space-y-1">
                        <p className="text-sm text-main-300">URL</p>
                        <InputSmall
                            value={httpUrl}
                            onChange={(event) => setHttpUrl(event.target.value)}
                            placeholder="https://example.com/api"
                        />
                    </div>

                    <div className="space-y-1">
                        <p className="text-sm text-main-300">Метод</p>
                        <Select
                            value={httpMethod}
                            onChange={setHttpMethod}
                            options={[
                                { value: "GET", label: "GET" },
                                { value: "POST", label: "POST" },
                                { value: "PUT", label: "PUT" },
                                { value: "DELETE", label: "DELETE" },
                                { value: "PATCH", label: "PATCH" },
                            ]}
                            className="h-9 border border-main-700/70 bg-main-800"
                        />
                    </div>

                    <div className="space-y-1">
                        <p className="text-sm text-main-300">Форматтер (JS)</p>
                        <InputSmall
                            value={httpFormatter}
                            onChange={(event) =>
                                setHttpFormatter(event.target.value)
                            }
                            placeholder="response.items?.[0]?.title"
                        />
                    </div>

                    <div>
                        <Button
                            variant="secondary"
                            shape="rounded-lg"
                            className="h-9 px-4"
                            onClick={() => {
                                void checkHttpRequest();
                            }}
                            disabled={isHttpChecking}
                        >
                            {isHttpChecking ? "Проверка..." : "Проверить"}
                        </Button>
                    </div>

                    {httpResponse ? (
                        <div className="space-y-1">
                            <p className="text-sm text-main-300">Ответ</p>
                            <ShikiCodeBlock
                                code={httpResponse}
                                language="json"
                            />
                        </div>
                    ) : null}
                </div>
            </Modal>

            <Modal
                open={Boolean(isDatetimeModalOpen && activeSettingsBlock)}
                onClose={() => setSettingsBlockId(null)}
                title="ScenarioManualDatetimeGet"
                className="max-w-xl"
                footer={
                    <Button
                        variant="primary"
                        shape="rounded-lg"
                        className="h-9 px-4"
                        onClick={saveDatetimeSettings}
                    >
                        Сохранить
                    </Button>
                }
            >
                <div className="space-y-3">
                    <div className="space-y-1">
                        <p className="text-sm text-main-300">Тип получения</p>
                        <Select
                            value={datetimeMode}
                            onChange={setDatetimeMode}
                            options={[
                                { value: "date", label: "Дата" },
                                { value: "time", label: "Время" },
                                { value: "datetime", label: "Дата и время" },
                            ]}
                            className="h-9 border border-main-700/70 bg-main-800"
                        />
                    </div>

                    <div className="space-y-1">
                        <p className="text-sm text-main-300">Часовой пояс</p>
                        <Select
                            value={datetimeTimezoneMode}
                            onChange={setDatetimeTimezoneMode}
                            options={[
                                { value: "current", label: "Текущий" },
                                {
                                    value: "manual",
                                    label: "Ручная установка",
                                },
                            ]}
                            className="h-9 border border-main-700/70 bg-main-800"
                        />
                    </div>

                    {datetimeTimezoneMode === "manual" ? (
                        <div className="space-y-1">
                            <p className="text-sm text-main-300">
                                Пояс (UTC+N / UTC-N)
                            </p>
                            <InputSmall
                                value={datetimeTimezone}
                                onChange={(event) =>
                                    setDatetimeTimezone(event.target.value)
                                }
                                placeholder="UTC+3"
                            />
                        </div>
                    ) : null}
                </div>
            </Modal>

            <Modal
                open={Boolean(isToolModalOpen && activeSettingsBlock)}
                onClose={() => setSettingsBlockId(null)}
                title="Настройка блока"
                className="max-w-3xl"
                footer={
                    <Button
                        variant="primary"
                        shape="rounded-lg"
                        className="h-9 px-4"
                        onClick={saveToolSettings}
                    >
                        Сохранить
                    </Button>
                }
            >
                <div className="space-y-3">
                    <div className="space-y-1">
                        <p className="text-sm text-main-300">
                            Схема параметров
                        </p>
                        <ShikiCodeBlock
                            code={
                                activeSettingsBlock?.meta?.tool?.toolSchema ||
                                "{}"
                            }
                            language="json"
                        />
                    </div>

                    <div className="space-y-1">
                        <p className="text-sm text-main-300">Ввод</p>

                        {toolInput.length === 0 ? (
                            <p className="rounded-xl border border-main-700/70 bg-main-900/50 px-3 py-2 text-xs text-main-400">
                                В schema не найдено properties для настройки.
                            </p>
                        ) : (
                            <div className="space-y-2">
                                {toolInput.map((item) => {
                                    const hasDefault =
                                        item.defaultValue !== undefined;
                                    const schemaDefaultValue =
                                        toolSchemaDefaultsByParam.get(
                                            item.param,
                                        );

                                    return (
                                        <div
                                            key={item.param}
                                            className="space-y-2 rounded-xl border border-main-700/70 bg-main-900/50 p-3"
                                        >
                                            <div>
                                                <p className="text-sm font-semibold text-main-100">
                                                    {item.param}
                                                </p>
                                                {item.description ? (
                                                    <p className="text-xs text-main-400">
                                                        {item.description}
                                                    </p>
                                                ) : null}
                                            </div>

                                            <div className="space-y-1">
                                                <p className="text-xs text-main-300">
                                                    Комментарий
                                                </p>
                                                <InputBig
                                                    value={item.comment}
                                                    onChange={(value) => {
                                                        updateToolInput(
                                                            item.param,
                                                            (prev) => ({
                                                                ...prev,
                                                                comment: value,
                                                            }),
                                                        );
                                                    }}
                                                    placeholder="Комментарий к параметру"
                                                    className="h-20 rounded-lg border border-main-700 bg-main-800 px-3 py-2 text-sm text-main-100"
                                                />
                                            </div>

                                            <div className="space-y-1">
                                                <div className="flex items-center justify-between gap-2">
                                                    <p className="text-xs text-main-300">
                                                        Значение по умолчанию
                                                    </p>
                                                    <InputCheckbox
                                                        checked={hasDefault}
                                                        onChange={(checked) => {
                                                            if (!checked) {
                                                                updateToolInput(
                                                                    item.param,
                                                                    (prev) => ({
                                                                        param: prev.param,
                                                                        description:
                                                                            prev.description,
                                                                        comment:
                                                                            prev.comment,
                                                                    }),
                                                                );
                                                                return;
                                                            }

                                                            updateToolInput(
                                                                item.param,
                                                                (prev) => ({
                                                                    ...prev,
                                                                    defaultValue:
                                                                        prev.defaultValue ??
                                                                        schemaDefaultValue ??
                                                                        "",
                                                                }),
                                                            );
                                                        }}
                                                    />
                                                </div>

                                                {hasDefault ? (
                                                    <InputSmall
                                                        value={
                                                            item.defaultValue ||
                                                            ""
                                                        }
                                                        onChange={(event) => {
                                                            const value =
                                                                event.target
                                                                    .value;
                                                            updateToolInput(
                                                                item.param,
                                                                (prev) => ({
                                                                    ...prev,
                                                                    defaultValue:
                                                                        value,
                                                                }),
                                                            );
                                                        }}
                                                        placeholder="Введите значение"
                                                    />
                                                ) : null}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </Modal>
        </>
    );
}
