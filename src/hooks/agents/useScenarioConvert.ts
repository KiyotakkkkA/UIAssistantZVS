import { useCallback } from "react";
import type {
    Scenario,
    ScenarioBlockToolsParamsUsage,
    ScenarioConnection,
    ScenarioScene,
    ScenarioSimpleBlockNode,
    ScenarioToolMeta,
    ScenarioVariableKey,
} from "../../types/Scenario";
import { getConnectionSemantic } from "../../utils/scenarioPorts";
import { useScenario } from "./useScenario";

const SCENARIO_FLOW_CACHE_VERSION = "v2_runtime_env_variables";

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

const tryParseJsonSchema = (rawSchema?: string) => {
    if (!rawSchema) {
        return null;
    }

    try {
        const parsed = JSON.parse(rawSchema) as Record<string, unknown>;
        if (!parsed || typeof parsed !== "object") {
            return null;
        }

        return parsed;
    } catch {
        return null;
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

const formatConditionSide = (source: unknown, value: unknown) => {
    const normalizedSource = source === "field" ? "field" : "value";
    const normalizedValue = typeof value === "string" ? value.trim() : "";

    return normalizedSource === "field"
        ? `field(${normalizedValue || "-"})`
        : `value(${normalizedValue || "-"})`;
};

const formatConditionRules = (block: ScenarioSimpleBlockNode) => {
    const rules = block.meta?.condition?.rules ?? [];

    if (rules.length === 0) {
        return "-";
    }

    return rules
        .map((rule, ruleIndex) => {
            const title = rule.title?.trim() || `Условие ${ruleIndex + 1}`;
            const operands = Array.isArray(rule.operands) ? rule.operands : [];
            const expression =
                operands.length > 0
                    ? operands
                          .map((operand) => {
                              const operator =
                                  typeof operand.operator === "string"
                                      ? operand.operator
                                      : "=";

                              return `${formatConditionSide(operand.leftSource, operand.leftValue)} ${operator} ${formatConditionSide(operand.rightSource, operand.rightValue)}`;
                          })
                          .join(" AND ")
                    : "-";

            return `${title}: ${expression}`;
        })
        .join(" | ");
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
        const outputSchema = tryParseJsonSchema(meta.outputScheme);
        const outputParams = Object.keys(
            ((outputSchema?.properties as
                | Record<string, unknown>
                | undefined) ?? {}) as Record<string, unknown>,
        );
        const outputText =
            outputParams.length > 0 ? outputParams.join(", ") : "-";

        return [
            `tool.name=${meta.toolName || block.title}`,
            `tool.required=${required}`,
            `tool.schemaParams=${schemaParamsText}`,
            `tool.outputParams=${outputText}`,
            ...(inputText ? [`tool.input:\n${inputText}`] : []),
        ].join(", ");
    }

    if (block.kind === "prompt") {
        const instruction = block.meta?.prompt?.instruction?.trim() || "-";
        return `prompt.instruction=${instruction}`;
    }

    if (block.kind === "condition") {
        const fields = block.meta?.condition?.fields ?? [];
        const fieldText =
            fields.length > 0
                ? fields.map((field) => field.name).join(", ")
                : "-";
        const rulesText = formatConditionRules(block);

        return [
            `condition.fields=${fieldText}`,
            `condition.rules=${rulesText}`,
            "condition.outputs=yes,no,always",
        ].join(", ");
    }

    if (block.kind === "variable") {
        const selected = block.meta?.variable?.selectedVariables ?? [];

        return `variable.selected=${selected.length > 0 ? selected.join(",") : "-"}`;
    }

    return "-";
};

const collectSelectedScenarioVariables = (
    blocks: ScenarioSimpleBlockNode[],
): ScenarioVariableKey[] => {
    const selected = blocks
        .filter((block) => block.kind === "variable")
        .flatMap((block) => block.meta?.variable?.selectedVariables ?? []);

    return Array.from(new Set(selected));
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
        .map((connection, index) => {
            const sourceBlock = scene.blocks.find(
                (block) => block.id === connection.fromBlockId,
            );
            const targetBlock = scene.blocks.find(
                (block) => block.id === connection.toBlockId,
            );

            const semantic =
                sourceBlock && targetBlock
                    ? getConnectionSemantic(
                          sourceBlock,
                          targetBlock,
                          connection,
                      )
                    : "invalid";
            const semanticText =
                semantic === "data"
                    ? "data"
                    : semantic === "control"
                      ? "control"
                      : "invalid";

            return `  ${index + 1}. ${connection.fromBlockId}${connection.fromPortName ? `:${connection.fromPortName}` : ""} -> ${connection.toBlockId}${connection.toPortName ? `:${connection.toPortName}` : ""} [${semanticText}]`;
        })
        .join("\n");

    const markovTransitionsText = scene.connections
        .map((connection, index) => {
            const sourceBlock = scene.blocks.find(
                (block) => block.id === connection.fromBlockId,
            );
            const targetBlock = scene.blocks.find(
                (block) => block.id === connection.toBlockId,
            );

            if (!sourceBlock || !targetBlock) {
                return null;
            }

            const semantic = getConnectionSemantic(
                sourceBlock,
                targetBlock,
                connection,
            );

            if (semantic !== "control") {
                return null;
            }

            const edgeLabel =
                sourceBlock.kind === "condition" && connection.fromPortName
                    ? connection.fromPortName
                    : "continue";

            return `  ${index + 1}. ${sourceBlock.id} --${edgeLabel}--> ${targetBlock.id}`;
        })
        .filter((item): item is string => Boolean(item))
        .join("\n");

    const endIncoming = scene.connections.filter((connection) => {
        const target = scene.blocks.find(
            (block) => block.id === connection.toBlockId,
        );
        return target?.kind === "end";
    });

    const modelFormatSchema = endIncoming
        .map((connection) =>
            scene.blocks.find((block) => block.id === connection.fromBlockId),
        )
        .find((block) => block?.kind === "tool")?.meta?.tool?.outputScheme;

    const parsedModelFormatSchema = tryParseJsonSchema(modelFormatSchema);
    const modelFormatHint = parsedModelFormatSchema
        ? JSON.stringify(parsedModelFormatSchema)
        : "";

    const selectedVariables = collectSelectedScenarioVariables(scene.blocks);
    const runtimeVariablesText = selectedVariables
        .map((variableKey) => `  - ${variableKey}`)
        .join("\n");

    return [
        "SCENARIO_FLOW:",
        `name: ${scenario.name}`,
        `description: ${scenario.description || "-"}`,
        "rules:",
        "  - Follow edges in LINKS from START blocks toward END blocks.",
        "  - Control links (solid) transfer only execution, no data payload.",
        "  - Data links (dashed) transfer only values from parameter outputs to parameter inputs.",
        "  - For TOOL nodes, respect tool.input comments/defaults and port mapping.",
        "  - For PROMPT nodes, apply prompt.instruction as strict step instruction.",
        "  - For VARIABLE nodes, read values only from SCENARIO_RUNTIME_ENV provided by system runtime context.",
        "  - Never ask user for built-in scenario variables (project_directory/current_date); they are runtime-provided.",
        "  - For CONDITION nodes: first process yes/no branch transitions, then always branch.",
        "  - Map ports strictly by semantic: continue->start and parameter->parameter.",
        "  - If input is not connected and has no default, stop and ask one precise clarification.",
        "  - If graph has branches, choose branch by user intent and explain why.",
        "MARKOV_STATE_MODEL:",
        scene.blocks
            .map(
                (block) =>
                    `  - state=${block.id}; kind=${block.kind}; title=${block.title}`,
            )
            .join("\n") || "  - empty",
        "MARKOV_TRANSITIONS_CONTROL:",
        markovTransitionsText || "  - empty",
        "SCENARIO_VARIABLES_RUNTIME_REQUIRED:",
        runtimeVariablesText || "  - empty",
        ...(modelFormatHint
            ? ["MODEL_FORMAT_HINT_JSON_SCHEMA:", modelFormatHint]
            : []),
        "BLOCKS:",
        blockText || "  - empty",
        "LINKS:",
        linksText || "  - empty",
    ].join("\n");
};

const stableStringify = (value: unknown): string => {
    if (value === null || typeof value !== "object") {
        return JSON.stringify(value);
    }

    if (Array.isArray(value)) {
        return `[${value.map((item) => stableStringify(item)).join(",")}]`;
    }

    const record = value as Record<string, unknown>;
    const keys = Object.keys(record).sort();

    return `{${keys
        .map((key) => `${JSON.stringify(key)}:${stableStringify(record[key])}`)
        .join(",")}}`;
};

const hashString = (input: string): string => {
    let hash = 2166136261;

    for (let index = 0; index < input.length; index += 1) {
        hash ^= input.charCodeAt(index);
        hash = Math.imul(hash, 16777619);
    }

    return (hash >>> 0).toString(16).padStart(8, "0");
};

const buildScenarioSceneHash = (scenario: Scenario): string => {
    const scene = toScene(scenario.content);
    if (!scene) {
        return "scene_missing";
    }

    const canonicalScene = {
        cacheVersion: SCENARIO_FLOW_CACHE_VERSION,
        version: scene.version,
        blocks: [...scene.blocks]
            .sort((left, right) => left.id.localeCompare(right.id))
            .map((block) => ({
                id: block.id,
                kind: block.kind,
                executionType: block.executionType,
                title: block.title,
                x: block.x,
                y: block.y,
                width: block.width,
                height: block.height,
                meta: block.meta,
            })),
        connections: [...scene.connections]
            .sort((left, right) => left.id.localeCompare(right.id))
            .map((connection) => ({
                id: connection.id,
                fromBlockId: connection.fromBlockId,
                fromPortName: connection.fromPortName || "",
                toBlockId: connection.toBlockId,
                toPortName: connection.toPortName || "",
            })),
    };

    return hashString(stableStringify(canonicalScene));
};

export const useScenarioConvert = () => {
    const { updateScenario } = useScenario();

    const scenarioToFlow = useCallback(
        async (scenario: Scenario) => {
            const nextHash = buildScenarioSceneHash(scenario);
            const cachedHash =
                typeof scenario.cachedModelScenarioHash === "string"
                    ? scenario.cachedModelScenarioHash
                    : "";
            const cachedFlow =
                typeof scenario.cachedModelScenario === "string"
                    ? scenario.cachedModelScenario
                    : "";

            if (cachedHash === nextHash && cachedFlow) {
                return cachedFlow;
            }

            const computedFlow = formatScenarioFlow(scenario);

            await updateScenario(scenario.id, {
                name: scenario.name,
                description: scenario.description,
                cachedModelScenarioHash: nextHash,
                cachedModelScenario: computedFlow,
            });

            return computedFlow;
        },
        [updateScenario],
    );

    return {
        scenarioToFlow,
    };
};
