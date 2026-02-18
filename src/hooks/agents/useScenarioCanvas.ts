import { useCallback, useEffect, useMemo, useState } from "react";
import { useScenario } from "./useScenario";
import type {
    ScenarioBlockKind,
    ScenarioBlockExecutionType,
    ScenarioConnection,
    ScenarioManualDatetimeGetMeta,
    ScenarioManualHttpRequestMeta,
    ScenarioScene,
    ScenarioSceneViewport,
    ScenarioSimpleBlockNode,
    ScenarioToolMeta,
} from "../../types/Scenario";

type Point = {
    x: number;
    y: number;
};

export type ScenarioCanvasInsertPayload = {
    kind: "manual-http" | "manual-datetime" | "tool";
    toolName?: string;
    toolSchema?: string;
};

const DEFAULT_VIEWPORT: ScenarioSceneViewport = {
    scale: 1,
    offsetX: 80,
    offsetY: 80,
    showGrid: true,
    canvasWidth: 3200,
    canvasHeight: 2000,
};

const hasInputPort = (kind: ScenarioBlockKind) => kind !== "start";
const hasOutputPort = (kind: ScenarioBlockKind) => kind !== "end";

const createStartEndBlocks = (): ScenarioSimpleBlockNode[] => [
    {
        id: crypto.randomUUID(),
        kind: "start",
        executionType: "system",
        title: "Стартовый",
        x: 420,
        y: 220,
        width: 240,
        height: 96,
    },
    {
        id: crypto.randomUUID(),
        kind: "end",
        executionType: "system",
        title: "Конечный",
        x: 900,
        y: 220,
        width: 240,
        height: 96,
    },
];

const createInsertedBlock = (
    payload: ScenarioCanvasInsertPayload,
    center: Point,
): ScenarioSimpleBlockNode => {
    if (payload.kind === "manual-http") {
        return {
            id: crypto.randomUUID(),
            kind: "manual-http",
            executionType: "manual",
            title: "HTTP запрос",
            x: center.x,
            y: center.y,
            width: 280,
            height: 96,
            meta: {
                manualHttp: {
                    url: "",
                    method: "GET",
                    formatter: "",
                },
            },
        };
    }

    if (payload.kind === "manual-datetime") {
        return {
            id: crypto.randomUUID(),
            kind: "manual-datetime",
            executionType: "manual",
            title: "Дата и время",
            x: center.x,
            y: center.y,
            width: 280,
            height: 96,
            meta: {
                manualDatetime: {
                    mode: "datetime",
                    timezoneMode: "current",
                    timezone: "UTC+0",
                },
            },
        };
    }

    return {
        id: crypto.randomUUID(),
        kind: "tool",
        executionType: "tools",
        title: payload.toolName || "Tool",
        x: center.x,
        y: center.y,
        width: 300,
        height: 96,
        meta: {
            tool: {
                toolName: payload.toolName || "tool",
                toolSchema: payload.toolSchema || "{}",
                input: "",
            },
        },
    };
};

const toPlainObject = (value: unknown): Record<string, unknown> => {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
        return {};
    }

    return JSON.parse(JSON.stringify(value)) as Record<string, unknown>;
};

const normalizeExecutionType = (
    kind: ScenarioSimpleBlockNode["kind"],
    rawExecutionType: unknown,
): ScenarioBlockExecutionType => {
    if (
        rawExecutionType === "manual" ||
        rawExecutionType === "tools" ||
        rawExecutionType === "system"
    ) {
        return rawExecutionType;
    }

    if (kind === "manual-http" || kind === "manual-datetime") {
        return "manual";
    }

    if (kind === "tool") {
        return "tools";
    }

    return "system";
};

const normalizeManualHttpMeta = (
    raw: Record<string, unknown>,
): ScenarioManualHttpRequestMeta => ({
    url: typeof raw.url === "string" ? raw.url : "",
    method: typeof raw.method === "string" ? raw.method : "GET",
    formatter: typeof raw.formatter === "string" ? raw.formatter : "",
    ...(typeof raw.lastResponseCode === "number"
        ? { lastResponseCode: raw.lastResponseCode }
        : {}),
    ...(typeof raw.lastResponseText === "string"
        ? { lastResponseText: raw.lastResponseText }
        : {}),
});

const normalizeManualDatetimeMeta = (
    raw: Record<string, unknown>,
): ScenarioManualDatetimeGetMeta => ({
    mode:
        raw.mode === "date" || raw.mode === "time" || raw.mode === "datetime"
            ? raw.mode
            : "datetime",
    timezoneMode:
        raw.timezoneMode === "manual" || raw.timezoneMode === "current"
            ? raw.timezoneMode
            : "current",
    timezone:
        typeof raw.timezone === "string" && raw.timezone.trim().length > 0
            ? raw.timezone
            : "UTC+0",
});

const normalizeToolMeta = (raw: Record<string, unknown>): ScenarioToolMeta => ({
    toolName: typeof raw.toolName === "string" ? raw.toolName : "tool",
    toolSchema: typeof raw.toolSchema === "string" ? raw.toolSchema : "{}",
    input: typeof raw.input === "string" ? raw.input : "",
});

const normalizeBlock = (
    raw: Partial<ScenarioSimpleBlockNode>,
): ScenarioSimpleBlockNode => ({
    id:
        typeof raw.id === "string" && raw.id.trim().length > 0
            ? raw.id
            : crypto.randomUUID(),
    kind:
        raw.kind === "end" ||
        raw.kind === "manual-http" ||
        raw.kind === "manual-datetime" ||
        raw.kind === "tool"
            ? raw.kind
            : "start",
    executionType: normalizeExecutionType(
        raw.kind ?? "start",
        raw.executionType,
    ),
    title:
        typeof raw.title === "string" && raw.title.trim().length > 0
            ? raw.title
            : raw.kind === "end"
              ? "Конечный"
              : "Стартовый",
    x: Number.isFinite(raw.x) ? Number(raw.x) : 0,
    y: Number.isFinite(raw.y) ? Number(raw.y) : 0,
    width: Number.isFinite(raw.width) ? Number(raw.width) : 240,
    height: Number.isFinite(raw.height) ? Number(raw.height) : 96,
    ...(raw.meta && typeof raw.meta === "object"
        ? {
              meta: {
                  ...(toPlainObject(raw.meta).manualHttp &&
                  typeof toPlainObject(raw.meta).manualHttp === "object"
                      ? {
                            manualHttp: normalizeManualHttpMeta(
                                toPlainObject(
                                    toPlainObject(raw.meta).manualHttp,
                                ),
                            ),
                        }
                      : {}),
                  ...(toPlainObject(raw.meta).manualDatetime &&
                  typeof toPlainObject(raw.meta).manualDatetime === "object"
                      ? {
                            manualDatetime: normalizeManualDatetimeMeta(
                                toPlainObject(
                                    toPlainObject(raw.meta).manualDatetime,
                                ),
                            ),
                        }
                      : {}),
                  ...(toPlainObject(raw.meta).tool &&
                  typeof toPlainObject(raw.meta).tool === "object"
                      ? {
                            tool: normalizeToolMeta(
                                toPlainObject(toPlainObject(raw.meta).tool),
                            ),
                        }
                      : {}),
              },
          }
        : {}),
});

const normalizeConnection = (
    raw: Partial<ScenarioConnection>,
): ScenarioConnection | null => {
    if (
        typeof raw.fromBlockId !== "string" ||
        typeof raw.toBlockId !== "string" ||
        !raw.fromBlockId ||
        !raw.toBlockId
    ) {
        return null;
    }

    return {
        id:
            typeof raw.id === "string" && raw.id.trim().length > 0
                ? raw.id
                : crypto.randomUUID(),
        fromBlockId: raw.fromBlockId,
        toBlockId: raw.toBlockId,
    };
};

const normalizeViewport = (
    raw: Partial<ScenarioSceneViewport> | undefined,
): ScenarioSceneViewport => ({
    scale: Number.isFinite(raw?.scale)
        ? Number(raw?.scale)
        : DEFAULT_VIEWPORT.scale,
    offsetX: Number.isFinite(raw?.offsetX)
        ? Number(raw?.offsetX)
        : DEFAULT_VIEWPORT.offsetX,
    offsetY: Number.isFinite(raw?.offsetY)
        ? Number(raw?.offsetY)
        : DEFAULT_VIEWPORT.offsetY,
    showGrid:
        typeof raw?.showGrid === "boolean"
            ? raw.showGrid
            : DEFAULT_VIEWPORT.showGrid,
    canvasWidth: Number.isFinite(raw?.canvasWidth)
        ? Number(raw?.canvasWidth)
        : DEFAULT_VIEWPORT.canvasWidth,
    canvasHeight: Number.isFinite(raw?.canvasHeight)
        ? Number(raw?.canvasHeight)
        : DEFAULT_VIEWPORT.canvasHeight,
});

const toScene = (
    content: Record<string, unknown> | undefined,
): ScenarioScene | null => {
    if (!content || typeof content !== "object") {
        return null;
    }

    const rawScene = content.scene;

    if (!rawScene || typeof rawScene !== "object") {
        return null;
    }

    const scene = rawScene as Partial<ScenarioScene>;

    if (!Array.isArray(scene.blocks) || !Array.isArray(scene.connections)) {
        return null;
    }

    return {
        version: 1,
        blocks: (scene.blocks as Partial<ScenarioSimpleBlockNode>[]).map(
            (item) => normalizeBlock(item),
        ),
        connections: (scene.connections as Partial<ScenarioConnection>[])
            .map((item) => normalizeConnection(item))
            .filter(
                (connection): connection is ScenarioConnection =>
                    connection !== null,
            ),
        viewport: normalizeViewport(
            scene.viewport as Partial<ScenarioSceneViewport> | undefined,
        ),
    };
};

export const useScenarioCanvas = () => {
    const { activeScenario, updateScenario } = useScenario();
    const [blocks, setBlocks] = useState<ScenarioSimpleBlockNode[]>([]);
    const [connections, setConnections] = useState<ScenarioConnection[]>([]);
    const [viewport, setViewport] =
        useState<ScenarioSceneViewport>(DEFAULT_VIEWPORT);
    const [isSaving, setIsSaving] = useState(false);

    const blocksById = useMemo(
        () => new Map(blocks.map((block) => [block.id, block])),
        [blocks],
    );

    useEffect(() => {
        const scene = toScene(activeScenario?.content);

        if (!scene) {
            setBlocks([]);
            setConnections([]);
            setViewport(DEFAULT_VIEWPORT);
            return;
        }

        setBlocks(scene.blocks);
        setConnections(scene.connections);
        setViewport(scene.viewport);
    }, [activeScenario?.content, activeScenario?.id]);

    const createConnection = useCallback(
        (fromBlockId: string, toBlockId: string) => {
            if (!fromBlockId || !toBlockId || fromBlockId === toBlockId) {
                return null;
            }

            let created: ScenarioConnection | null = null;

            setConnections((prev) => {
                const exists = prev.some(
                    (connection) =>
                        connection.fromBlockId === fromBlockId &&
                        connection.toBlockId === toBlockId,
                );

                if (exists) {
                    return prev;
                }

                created = {
                    id: crypto.randomUUID(),
                    fromBlockId,
                    toBlockId,
                };

                return [...prev, created as ScenarioConnection];
            });

            return created;
        },
        [],
    );

    const completeConnection = useCallback(
        (fromBlockId: string, toBlockId: string) => {
            if (!fromBlockId || !toBlockId || fromBlockId === toBlockId) {
                return false;
            }

            const sourceBlock = blocksById.get(fromBlockId);
            const targetBlock = blocksById.get(toBlockId);

            if (!sourceBlock || !targetBlock) {
                return false;
            }

            if (
                !hasOutputPort(sourceBlock.kind) ||
                !hasInputPort(targetBlock.kind)
            ) {
                return false;
            }

            createConnection(fromBlockId, toBlockId);
            return true;
        },
        [blocksById, createConnection],
    );

    const deleteConnection = useCallback((connectionId: string) => {
        if (!connectionId) {
            return;
        }

        setConnections((prev) =>
            prev.filter((connection) => connection.id !== connectionId),
        );
    }, []);

    const createInitialScene = useCallback(() => {
        setBlocks(createStartEndBlocks());
        setConnections([]);
    }, []);

    const insertBlock = useCallback(
        (payload: ScenarioCanvasInsertPayload, center: Point) => {
            const inserted = createInsertedBlock(payload, center);
            setBlocks((prev) => [...prev, inserted]);
            return inserted.id;
        },
        [],
    );

    const removeBlock = useCallback(
        (blockId: string) => {
            const block = blocksById.get(blockId);

            if (!block || block.kind === "start" || block.kind === "end") {
                return false;
            }

            setBlocks((prev) => prev.filter((item) => item.id !== blockId));
            setConnections((prev) =>
                prev.filter(
                    (connection) =>
                        connection.fromBlockId !== blockId &&
                        connection.toBlockId !== blockId,
                ),
            );

            return true;
        },
        [blocksById],
    );

    const updateManualHttpMeta = useCallback(
        (blockId: string, meta: ScenarioManualHttpRequestMeta) => {
            setBlocks((prev) =>
                prev.map((block) =>
                    block.id === blockId && block.kind === "manual-http"
                        ? {
                              ...block,
                              meta: {
                                  ...block.meta,
                                  manualHttp: meta,
                              },
                          }
                        : block,
                ),
            );
        },
        [],
    );

    const updateManualDatetimeMeta = useCallback(
        (blockId: string, meta: ScenarioManualDatetimeGetMeta) => {
            setBlocks((prev) =>
                prev.map((block) =>
                    block.id === blockId && block.kind === "manual-datetime"
                        ? {
                              ...block,
                              meta: {
                                  ...block.meta,
                                  manualDatetime: meta,
                              },
                          }
                        : block,
                ),
            );
        },
        [],
    );

    const updateToolMeta = useCallback(
        (blockId: string, meta: ScenarioToolMeta) => {
            setBlocks((prev) =>
                prev.map((block) =>
                    block.id === blockId && block.kind === "tool"
                        ? {
                              ...block,
                              meta: {
                                  ...block.meta,
                                  tool: meta,
                              },
                          }
                        : block,
                ),
            );
        },
        [],
    );

    const saveScene = useCallback(
        async (nextViewport?: Partial<ScenarioSceneViewport>) => {
            if (!activeScenario) {
                return null;
            }

            const mergedViewport = {
                ...viewport,
                ...(nextViewport || {}),
            };

            setIsSaving(true);

            try {
                const serializableBlocks = blocks.map((block) =>
                    normalizeBlock(block),
                );
                const serializableConnections = connections
                    .map((connection) => normalizeConnection(connection))
                    .filter(
                        (connection): connection is ScenarioConnection =>
                            connection !== null,
                    );
                const serializableViewport = normalizeViewport(mergedViewport);

                return await updateScenario(activeScenario.id, {
                    name: activeScenario.name,
                    description: activeScenario.description,
                    content: {
                        scene: {
                            version: 1,
                            blocks: serializableBlocks,
                            connections: serializableConnections,
                            viewport: serializableViewport,
                        } satisfies ScenarioScene,
                    },
                });
            } finally {
                setIsSaving(false);
            }
        },
        [activeScenario, blocks, connections, updateScenario, viewport],
    );

    const hasScene = useMemo(() => blocks.length > 0, [blocks.length]);

    return {
        blocks,
        blocksById,
        setBlocks,
        connections,
        setConnections,
        viewport,
        setViewport,
        hasScene,
        isSaving,
        createInitialScene,
        insertBlock,
        removeBlock,
        createConnection,
        completeConnection,
        deleteConnection,
        updateManualHttpMeta,
        updateManualDatetimeMeta,
        updateToolMeta,
        saveScene,
    };
};
