import { useCallback, useEffect, useMemo, useState } from "react";
import { useScenario } from "./useScenario";
import type {
    ScenarioConnection,
    ScenarioScene,
    ScenarioSceneViewport,
    ScenarioSimpleBlockNode,
} from "../../types/Scenario";

const DEFAULT_VIEWPORT: ScenarioSceneViewport = {
    scale: 1,
    offsetX: 80,
    offsetY: 80,
    showGrid: true,
    canvasWidth: 3200,
    canvasHeight: 2000,
};

const normalizeBlock = (
    raw: Partial<ScenarioSimpleBlockNode>,
): ScenarioSimpleBlockNode => ({
    id:
        typeof raw.id === "string" && raw.id.trim().length > 0
            ? raw.id
            : crypto.randomUUID(),
    kind: raw.kind === "end" ? "end" : "start",
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

    const deleteConnection = useCallback((connectionId: string) => {
        if (!connectionId) {
            return;
        }

        setConnections((prev) =>
            prev.filter((connection) => connection.id !== connectionId),
        );
    }, []);

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
        setBlocks,
        connections,
        setConnections,
        viewport,
        setViewport,
        hasScene,
        isSaving,
        createConnection,
        deleteConnection,
        saveScene,
    };
};
