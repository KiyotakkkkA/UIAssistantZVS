import { useCallback } from "react";
import type {
    Scenario,
    ScenarioBlockToolsParamsUsage,
    ScenarioConnection,
    ScenarioScene,
    ScenarioSimpleBlockNode,
    ScenarioToolMeta,
} from "../../types/Scenario";

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
        blocks: scene.blocks as ScenarioSimpleBlockNode[],
        connections: scene.connections as ScenarioConnection[],
        viewport: scene.viewport || {
            scale: 1,
            offsetX: 80,
            offsetY: 80,
            showGrid: true,
            canvasWidth: 3200,
            canvasHeight: 2000,
        },
    };
};

const tryParseToolSchema = (rawSchema: string) => {
    try {
        const parsed = JSON.parse(rawSchema) as {
            required?: unknown;
            properties?: Record<string, { description?: string }>;
        };

        return {
            required: Array.isArray(parsed.required)
                ? parsed.required.filter(
                      (item): item is string => typeof item === "string",
                  )
                : [],
            properties:
                parsed.properties && typeof parsed.properties === "object"
                    ? parsed.properties
                    : {},
        };
    } catch {
        return {
            required: [] as string[],
            properties: {} as Record<string, { description?: string }>,
        };
    }
};

const formatToolInputs = (input: ScenarioBlockToolsParamsUsage[]) => {
    if (!Array.isArray(input) || input.length === 0) {
        return "";
    }

    return input
        .map((item) => {
            const comment = item.comment?.trim() || "";
            const hasDefault = item.defaultValue !== undefined;
            const defaultValue = hasDefault
                ? `; default=${item.defaultValue}`
                : "";

            return `      - ${item.param}: ${comment || "без комментария"}${defaultValue}`;
        })
        .join("\n");
};

const formatBlockMeta = (block: ScenarioSimpleBlockNode): string => {
    if (block.kind === "tool") {
        const meta = (block.meta?.tool || {
            toolName: block.title,
            toolSchema: "{}",
            input: [],
        }) as ScenarioToolMeta;

        const schema = tryParseToolSchema(meta.toolSchema);
        const required =
            schema.required.length > 0 ? schema.required.join(", ") : "-";
        const schemaParams = Object.keys(schema.properties);
        const schemaParamsText =
            schemaParams.length > 0 ? schemaParams.join(", ") : "-";
        const inputText = formatToolInputs(meta.input);

        return [
            `tool.name=${meta.toolName || block.title}`,
            `tool.required=${required}`,
            `tool.schemaParams=${schemaParamsText}`,
            ...(inputText ? [`tool.input:\n${inputText}`] : []),
        ].join(", ");
    }

    return "-";
};

const buildTraversalOrder = (
    blocks: ScenarioSimpleBlockNode[],
    connections: ScenarioConnection[],
) => {
    const byId = new Map(blocks.map((block) => [block.id, block]));
    const outgoing = new Map<string, string[]>();

    connections.forEach((connection) => {
        const list = outgoing.get(connection.fromBlockId) || [];
        list.push(connection.toBlockId);
        outgoing.set(connection.fromBlockId, list);
    });

    outgoing.forEach((value) => {
        value.sort((left, right) => {
            const leftBlock = byId.get(left);
            const rightBlock = byId.get(right);

            if (!leftBlock || !rightBlock) {
                return 0;
            }

            if (leftBlock.y !== rightBlock.y) {
                return leftBlock.y - rightBlock.y;
            }

            return leftBlock.x - rightBlock.x;
        });
    });

    const starts = blocks
        .filter((block) => block.kind === "start")
        .sort((left, right) => left.x - right.x);

    const visited = new Set<string>();
    const ordered: ScenarioSimpleBlockNode[] = [];

    const visit = (blockId: string) => {
        if (visited.has(blockId)) {
            return;
        }

        const block = byId.get(blockId);

        if (!block) {
            return;
        }

        visited.add(blockId);
        ordered.push(block);

        const nextIds = outgoing.get(blockId) || [];
        nextIds.forEach((nextId) => visit(nextId));
    };

    starts.forEach((start) => visit(start.id));

    blocks
        .filter((block) => !visited.has(block.id))
        .sort((left, right) => {
            if (left.y !== right.y) {
                return left.y - right.y;
            }

            return left.x - right.x;
        })
        .forEach((block) => visit(block.id));

    return ordered;
};

const formatScenarioFlow = (scenario: Scenario) => {
    const scene = toScene(scenario.content);

    if (!scene) {
        return [
            "SCENARIO_FLOW:",
            `name: ${scenario.name}`,
            `description: ${scenario.description || "-"}`,
            "state: scene_not_found",
        ].join("\n");
    }

    const orderedBlocks = buildTraversalOrder(scene.blocks, scene.connections);
    const blockText = orderedBlocks
        .map((block, index) => {
            const metaText = formatBlockMeta(block);

            return [
                `  ${index + 1}. [${block.id}] ${block.title}`,
                `     kind=${block.kind}; execution=${block.executionType}`,
                `     meta=${metaText}`,
            ].join("\n");
        })
        .join("\n");

    const linksText = scene.connections
        .map(
            (connection, index) =>
                `  ${index + 1}. ${connection.fromBlockId} -> ${connection.toBlockId}`,
        )
        .join("\n");

    return [
        "SCENARIO_FLOW:",
        `name: ${scenario.name}`,
        `description: ${scenario.description || "-"}`,
        "rules:",
        "  - Follow edges in LINKS from START blocks toward END blocks.",
        "  - For TOOL nodes, respect tool.input comments and defaults.",
        "  - If graph has branches, choose branch by user intent and explain why.",
        "BLOCKS:",
        blockText || "  - empty",
        "LINKS:",
        linksText || "  - empty",
    ].join("\n");
};

export const useScenarioConvert = () => {
    const scenarioToFlow = useCallback((scenario: Scenario) => {
        return formatScenarioFlow(scenario);
    }, []);

    return {
        scenarioToFlow,
    };
};
