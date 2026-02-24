import type {
    ScenarioConditionMeta,
    ScenarioConnection,
    ScenarioPromptMeta,
    ScenarioScene,
    ScenarioSceneViewport,
    ScenarioSimpleBlockNode,
    ScenarioToolMeta,
    ScenarioVariableMeta,
} from "../../types/Scenario";
import {
    DEFAULT_VIEWPORT,
    createDefaultVariableMeta,
    isAllowedVariableKey,
    normalizeConditionFields,
    normalizeConditionRules,
    normalizeExecutionType,
    normalizeOutputSchemeString,
    parseToolInputFromSchema,
    resolveNormalizedPortAnchors,
} from "./scenarioCanvasSceneShared";
import { buildBlockPortAnchors } from "./scenarioCanvasScenePorts";

const NORMALIZABLE_BLOCK_KINDS = new Set([
    "end",
    "tool",
    "prompt",
    "condition",
    "variable",
]);

export const toPlainObject = (value: unknown): Record<string, unknown> => {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
        return {};
    }

    return JSON.parse(JSON.stringify(value)) as Record<string, unknown>;
};

export const normalizePromptMeta = (
    raw: Record<string, unknown>,
): ScenarioPromptMeta => ({
    instruction: typeof raw.instruction === "string" ? raw.instruction : "",
});

export const normalizeConditionMeta = (
    raw: Record<string, unknown>,
): ScenarioConditionMeta => {
    const fields = normalizeConditionFields(raw.fields);

    return {
        fields,
        rules: normalizeConditionRules(raw.rules, fields),
    };
};

export const normalizeVariableMeta = (
    raw: Record<string, unknown>,
): ScenarioVariableMeta => {
    const selectedVariables = Array.isArray(raw.selectedVariables)
        ? raw.selectedVariables.filter((item) => isAllowedVariableKey(item))
        : [];

    return {
        selectedVariables:
            selectedVariables.length > 0
                ? Array.from(new Set(selectedVariables))
                : createDefaultVariableMeta().selectedVariables,
    };
};

export const normalizeToolMeta = (
    raw: Record<string, unknown>,
): ScenarioToolMeta => {
    const toolSchema =
        typeof raw.toolSchema === "string" ? raw.toolSchema : "{}";
    const parsedFromSchema = parseToolInputFromSchema(toolSchema);
    const parsedInput = Array.isArray(raw.input)
        ? raw.input
              .filter(
                  (item): item is Record<string, unknown> =>
                      Boolean(item) && typeof item === "object",
              )
              .map((item) => ({
                  param: typeof item.param === "string" ? item.param : "",
                  description:
                      typeof item.description === "string"
                          ? item.description
                          : "",
                  comment: typeof item.comment === "string" ? item.comment : "",
                  ...(typeof item.defaultValue === "string"
                      ? { defaultValue: item.defaultValue }
                      : {}),
              }))
              .filter((item) => item.param.trim().length > 0)
        : [];

    const normalizedOutputScheme = normalizeOutputSchemeString(
        raw.outputScheme,
    );

    return {
        toolName: typeof raw.toolName === "string" ? raw.toolName : "tool",
        toolSchema,
        input: parsedInput.length > 0 ? parsedInput : parsedFromSchema,
        ...(normalizedOutputScheme
            ? { outputScheme: normalizedOutputScheme }
            : {}),
    };
};

export const normalizeBlock = (
    raw: Partial<ScenarioSimpleBlockNode>,
): ScenarioSimpleBlockNode => {
    const kind = NORMALIZABLE_BLOCK_KINDS.has(raw.kind || "")
        ? (raw.kind as "end" | "tool" | "prompt" | "condition" | "variable")
        : "start";

    const rawMeta =
        raw.meta && typeof raw.meta === "object" ? toPlainObject(raw.meta) : {};

    const hasTool = rawMeta.tool && typeof rawMeta.tool === "object";
    const hasPrompt = rawMeta.prompt && typeof rawMeta.prompt === "object";
    const hasCondition =
        rawMeta.condition && typeof rawMeta.condition === "object";
    const hasVariable =
        rawMeta.variable && typeof rawMeta.variable === "object";

    const normalizedMeta = {
        ...(kind === "tool" || hasTool
            ? {
                  tool: normalizeToolMeta(
                      hasTool ? toPlainObject(rawMeta.tool) : {},
                  ),
              }
            : {}),
        ...(kind === "prompt" || hasPrompt
            ? {
                  prompt: normalizePromptMeta(
                      hasPrompt ? toPlainObject(rawMeta.prompt) : {},
                  ),
              }
            : {}),
        ...(kind === "condition" || hasCondition
            ? {
                  condition: normalizeConditionMeta(
                      hasCondition ? toPlainObject(rawMeta.condition) : {},
                  ),
              }
            : {}),
        ...(kind === "variable" || hasVariable
            ? {
                  variable: normalizeVariableMeta(
                      hasVariable ? toPlainObject(rawMeta.variable) : {},
                  ),
              }
            : {}),
    };

    const normalizedBlock: ScenarioSimpleBlockNode = {
        id:
            typeof raw.id === "string" && raw.id.trim().length > 0
                ? raw.id
                : crypto.randomUUID(),
        kind,
        executionType: normalizeExecutionType(kind, raw.executionType),
        title:
            typeof raw.title === "string" && raw.title.trim().length > 0
                ? raw.title
                : kind === "end"
                  ? "Конечный"
                  : "Стартовый",
        x: Number.isFinite(raw.x) ? Number(raw.x) : 0,
        y: Number.isFinite(raw.y) ? Number(raw.y) : 0,
        width: Number.isFinite(raw.width) ? Number(raw.width) : 240,
        height: Number.isFinite(raw.height) ? Number(raw.height) : 96,
        ...(Object.keys(normalizedMeta).length > 0
            ? { meta: normalizedMeta }
            : {}),
    };

    const fallbackAnchors = buildBlockPortAnchors(normalizedBlock);

    return {
        ...normalizedBlock,
        portAnchors: resolveNormalizedPortAnchors(
            raw.portAnchors,
            fallbackAnchors,
        ),
    };
};

export const normalizeConnection = (
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
        ...(typeof raw.fromPortName === "string" &&
        raw.fromPortName.trim().length
            ? { fromPortName: raw.fromPortName }
            : {}),
        ...(typeof raw.toPortName === "string" && raw.toPortName.trim().length
            ? { toPortName: raw.toPortName }
            : {}),
    };
};

export const normalizeViewport = (
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

export const toScene = (
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
