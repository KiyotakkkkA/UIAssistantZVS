import type {
    ScenarioBlockExecutionType,
    ScenarioBlockKind,
    ScenarioBlockPortAnchors,
    ScenarioBlockToolsParamsUsage,
    ScenarioConditionField,
    ScenarioConditionMeta,
    ScenarioConditionOperand,
    ScenarioConditionOperator,
    ScenarioConditionRule,
    ScenarioConnection,
    ScenarioPromptMeta,
    ScenarioScene,
    ScenarioSceneViewport,
    ScenarioSimpleBlockNode,
    ScenarioToolMeta,
    ScenarioPortPoint,
    ScenarioVariableKey,
    ScenarioVariableMeta,
} from "../types/Scenario";
import {
    START_BLOCK_INPUT_PORT,
    VARIABLE_CONTINUE_OUTPUT_PORT,
} from "./scenarioVariables";

export type Point = {
    x: number;
    y: number;
};

export type ScenarioCanvasInsertPayload = {
    kind: "tool" | "prompt" | "condition" | "variable";
    toolName?: string;
    toolSchema?: string;
    outputScheme?: string | Record<string, unknown>;
};

export const DEFAULT_VIEWPORT: ScenarioSceneViewport = {
    scale: 1,
    offsetX: 80,
    offsetY: 80,
    showGrid: true,
    canvasWidth: 3200,
    canvasHeight: 2000,
};

const DEFAULT_PORT_KEY = "__default__";

export const hasInputPort = (kind: ScenarioBlockKind) => kind !== "start";
export const hasOutputPort = (kind: ScenarioBlockKind) => kind !== "end";

const VARIABLE_KEYS: ScenarioVariableKey[] = [
    "project_directory",
    "current_date",
];

const createDefaultVariableMeta = (): ScenarioVariableMeta => ({
    selectedVariables: ["current_date"],
});

const calcBlockHeight = (
    inputPortsCount: number,
    outputPortsCount: number,
    minHeight = 96,
) => {
    const rows = Math.max(inputPortsCount, outputPortsCount, 1);
    return Math.max(minHeight, 56 + rows * 26);
};

const toPortKey = (portName?: string) =>
    portName && portName.trim().length > 0 ? portName : DEFAULT_PORT_KEY;

const buildEvenlyDistributedAnchors = (
    portNames: string[],
    x: number,
    height: number,
): Record<string, ScenarioPortPoint> => {
    const count = Math.max(portNames.length, 1);

    return portNames.reduce<Record<string, ScenarioPortPoint>>(
        (acc, portName, index) => {
            acc[toPortKey(portName)] = {
                x,
                y: ((index + 1) * height) / (count + 1),
            };
            return acc;
        },
        {},
    );
};

const normalizeOutputSchemeString = (raw: unknown): string | undefined => {
    if (typeof raw === "string" && raw.trim().length > 0) {
        return raw;
    }

    if (raw && typeof raw === "object" && !Array.isArray(raw)) {
        try {
            return JSON.stringify(raw, null, 2);
        } catch {
            return undefined;
        }
    }

    return undefined;
};

const parseToolInputFromSchema = (
    toolSchema: string,
): ScenarioBlockToolsParamsUsage[] => {
    try {
        const parsed = JSON.parse(toolSchema) as {
            properties?: Record<
                string,
                {
                    description?: unknown;
                    default?: unknown;
                }
            >;
            required?: unknown;
        };

        const required = Array.isArray(parsed.required)
            ? new Set(
                  parsed.required.filter(
                      (item): item is string => typeof item === "string",
                  ),
              )
            : null;

        if (!parsed.properties || typeof parsed.properties !== "object") {
            return [];
        }

        return Object.entries(parsed.properties)
            .filter(([param]) => !required || required.has(param))
            .map(([param, property]) => {
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
                    comment: "",
                    ...(hasDefault
                        ? {
                              defaultValue:
                                  typeof property.default === "string"
                                      ? property.default
                                      : JSON.stringify(property.default),
                          }
                        : {}),
                };
            });
    } catch {
        return [];
    }
};

const parseToolOutputNamesFromSchema = (rawSchema?: unknown): string[] => {
    const normalizedRawSchema = normalizeOutputSchemeString(rawSchema);

    if (!normalizedRawSchema) {
        return [];
    }

    try {
        const parsed = JSON.parse(normalizedRawSchema) as {
            properties?: Record<string, unknown>;
        };

        return Object.keys(parsed.properties ?? {});
    } catch {
        return [];
    }
};

const getBlockInputPortNames = (block: ScenarioSimpleBlockNode): string[] => {
    if (block.kind === "end") {
        return [DEFAULT_PORT_KEY];
    }

    if (block.kind === "start") {
        return [];
    }

    if (block.kind === "prompt" || block.kind === "variable") {
        return [START_BLOCK_INPUT_PORT];
    }

    if (block.kind === "condition") {
        const fields = block.meta?.condition?.fields ?? [];
        return [
            START_BLOCK_INPUT_PORT,
            ...fields
                .map((field) => field.name)
                .filter((name) => Boolean(name)),
        ];
    }

    const toolInputs = (block.meta?.tool?.input ?? [])
        .map((item) => item.param)
        .filter((name) => Boolean(name));

    return [START_BLOCK_INPUT_PORT, ...toolInputs];
};

const getBlockOutputPortNames = (block: ScenarioSimpleBlockNode): string[] => {
    if (block.kind === "end") {
        return [];
    }

    if (block.kind === "condition") {
        return ["yes", "no", "always"];
    }

    if (block.kind === "tool") {
        return [
            ...parseToolOutputNamesFromSchema(block.meta?.tool?.outputScheme),
            VARIABLE_CONTINUE_OUTPUT_PORT,
        ];
    }

    if (block.kind === "variable") {
        return [
            ...(block.meta?.variable?.selectedVariables ?? []),
            VARIABLE_CONTINUE_OUTPUT_PORT,
        ];
    }

    if (block.kind === "start" || block.kind === "prompt") {
        return [VARIABLE_CONTINUE_OUTPUT_PORT];
    }

    return [];
};

export const buildBlockPortAnchors = (
    block: Pick<ScenarioSimpleBlockNode, "kind" | "width" | "height" | "meta">,
): ScenarioBlockPortAnchors => {
    const inputAnchors: Record<string, ScenarioPortPoint> = {};
    const outputAnchors: Record<string, ScenarioPortPoint> = {};

    if (block.kind === "start") {
        outputAnchors[VARIABLE_CONTINUE_OUTPUT_PORT] = {
            x: block.width + 10,
            y: block.height / 2,
        };

        return {
            inputs: inputAnchors,
            outputs: outputAnchors,
        };
    }

    if (block.kind === "end") {
        inputAnchors[DEFAULT_PORT_KEY] = {
            x: -10,
            y: block.height / 2,
        };

        return {
            inputs: inputAnchors,
            outputs: outputAnchors,
        };
    }

    if (block.kind === "prompt" || block.kind === "variable") {
        inputAnchors[START_BLOCK_INPUT_PORT] = {
            x: -10,
            y: block.height / 2,
        };
    } else if (block.kind === "condition") {
        inputAnchors[START_BLOCK_INPUT_PORT] = {
            x: -10,
            y: block.height * 0.14,
        };

        const fields = block.meta?.condition?.fields ?? [];
        fields.forEach((field, index) => {
            inputAnchors[toPortKey(field.name)] = {
                x: -10,
                y:
                    block.height *
                    (0.24 + ((index + 1) / (fields.length + 1)) * 0.68),
            };
        });
    } else {
        const inputPorts = getBlockInputPortNames(
            block as ScenarioSimpleBlockNode,
        );
        Object.assign(
            inputAnchors,
            buildEvenlyDistributedAnchors(inputPorts, -10, block.height),
        );
    }

    if (block.kind === "condition") {
        outputAnchors.yes = { x: block.width + 10, y: block.height * 0.28 };
        outputAnchors.no = { x: block.width + 10, y: block.height * 0.5 };
        outputAnchors.always = { x: block.width + 10, y: block.height * 0.72 };
    } else {
        const outputPorts = getBlockOutputPortNames(
            block as ScenarioSimpleBlockNode,
        );
        Object.assign(
            outputAnchors,
            buildEvenlyDistributedAnchors(
                outputPorts,
                block.width + 10,
                block.height,
            ),
        );
    }

    return {
        inputs: inputAnchors,
        outputs: outputAnchors,
    };
};

const resolveNormalizedPortAnchors = (
    raw: unknown,
    fallback: ScenarioBlockPortAnchors,
): ScenarioBlockPortAnchors => {
    if (!raw || typeof raw !== "object") {
        return fallback;
    }

    const source = raw as {
        inputs?: Record<string, { x?: unknown; y?: unknown }>;
        outputs?: Record<string, { x?: unknown; y?: unknown }>;
    };

    const normalizeMap = (
        record: Record<string, { x?: unknown; y?: unknown }> | undefined,
    ) => {
        if (!record || typeof record !== "object") {
            return {} as Record<string, ScenarioPortPoint>;
        }

        return Object.entries(record).reduce<Record<string, ScenarioPortPoint>>(
            (acc, [key, value]) => {
                if (!key) {
                    return acc;
                }

                if (!Number.isFinite(value?.x) || !Number.isFinite(value?.y)) {
                    return acc;
                }

                acc[toPortKey(key)] = {
                    x: Number(value.x),
                    y: Number(value.y),
                };
                return acc;
            },
            {},
        );
    };

    const inputs = normalizeMap(source.inputs);
    const outputs = normalizeMap(source.outputs);

    return {
        inputs: Object.keys(inputs).length > 0 ? inputs : fallback.inputs,
        outputs: Object.keys(outputs).length > 0 ? outputs : fallback.outputs,
    };
};

const createDefaultConditionFields = (): ScenarioConditionField[] => [
    {
        id: crypto.randomUUID(),
        name: "value",
    },
];

const CONDITION_OPERATORS: ScenarioConditionOperator[] = [
    "=",
    "!=",
    ">",
    "<",
    ">=",
    "<=",
    "contains",
    "not_contains",
];

const createDefaultConditionOperand = (): ScenarioConditionOperand => ({
    id: crypto.randomUUID(),
    leftSource: "field",
    leftValue: "value",
    operator: "=",
    rightSource: "value",
    rightValue: "",
});

const createDefaultConditionRules = (): ScenarioConditionRule[] => [
    {
        id: crypto.randomUUID(),
        title: "Условие 1",
        operands: [createDefaultConditionOperand()],
    },
];

const normalizeConditionFields = (raw: unknown): ScenarioConditionField[] => {
    if (!Array.isArray(raw)) {
        return createDefaultConditionFields();
    }

    const fields = raw
        .filter(
            (item): item is Record<string, unknown> =>
                Boolean(item) && typeof item === "object",
        )
        .map((item) => {
            const name = typeof item.name === "string" ? item.name.trim() : "";

            return {
                id:
                    typeof item.id === "string" && item.id.trim().length > 0
                        ? item.id
                        : crypto.randomUUID(),
                name: name || "value",
            };
        });

    return fields.length > 0 ? fields : createDefaultConditionFields();
};

const normalizeConditionOperandSource = (value: unknown): "field" | "value" =>
    value === "field" || value === "value" ? value : "value";

const normalizeConditionOperator = (
    value: unknown,
): ScenarioConditionOperator => {
    if (
        typeof value === "string" &&
        CONDITION_OPERATORS.includes(value as ScenarioConditionOperator)
    ) {
        return value as ScenarioConditionOperator;
    }

    return "=";
};

const normalizeConditionOperands = (
    raw: unknown,
    fields: ScenarioConditionField[],
): ScenarioConditionOperand[] => {
    if (!Array.isArray(raw)) {
        return [
            {
                ...createDefaultConditionOperand(),
                leftValue: fields[0]?.name || "value",
            },
        ];
    }

    const allowedFieldNames = new Set(fields.map((field) => field.name));

    const operands = raw
        .filter(
            (item): item is Record<string, unknown> =>
                Boolean(item) && typeof item === "object",
        )
        .map((item) => {
            const leftSource = normalizeConditionOperandSource(item.leftSource);
            const rightSource = normalizeConditionOperandSource(
                item.rightSource,
            );
            const leftRaw =
                typeof item.leftValue === "string" ? item.leftValue.trim() : "";
            const rightRaw =
                typeof item.rightValue === "string"
                    ? item.rightValue.trim()
                    : "";

            const firstFieldName = fields[0]?.name || "value";
            const leftValue =
                leftSource === "field"
                    ? allowedFieldNames.has(leftRaw)
                        ? leftRaw
                        : firstFieldName
                    : leftRaw;
            const rightValue =
                rightSource === "field"
                    ? allowedFieldNames.has(rightRaw)
                        ? rightRaw
                        : firstFieldName
                    : rightRaw;

            return {
                id:
                    typeof item.id === "string" && item.id.trim().length > 0
                        ? item.id
                        : crypto.randomUUID(),
                leftSource,
                leftValue,
                operator: normalizeConditionOperator(item.operator),
                rightSource,
                rightValue,
            };
        });

    if (operands.length > 0) {
        return operands;
    }

    return [
        {
            ...createDefaultConditionOperand(),
            leftValue: fields[0]?.name || "value",
        },
    ];
};

const normalizeConditionRules = (
    raw: unknown,
    fields: ScenarioConditionField[],
): ScenarioConditionRule[] => {
    if (!Array.isArray(raw)) {
        return [
            {
                ...createDefaultConditionRules()[0],
                operands: normalizeConditionOperands(undefined, fields),
            },
        ];
    }

    const rules = raw
        .filter(
            (item): item is Record<string, unknown> =>
                Boolean(item) && typeof item === "object",
        )
        .map((item, index) => {
            const title =
                typeof item.title === "string" && item.title.trim().length > 0
                    ? item.title.trim()
                    : `Условие ${index + 1}`;

            return {
                id:
                    typeof item.id === "string" && item.id.trim().length > 0
                        ? item.id
                        : crypto.randomUUID(),
                title,
                operands: normalizeConditionOperands(item.operands, fields),
            };
        });

    if (rules.length > 0) {
        return rules;
    }

    return [
        {
            ...createDefaultConditionRules()[0],
            operands: normalizeConditionOperands(undefined, fields),
        },
    ];
};

export const createStartEndBlocks = (): ScenarioSimpleBlockNode[] => [
    (() => {
        const block: ScenarioSimpleBlockNode = {
            id: crypto.randomUUID(),
            kind: "start",
            executionType: "system",
            title: "Стартовый",
            x: 420,
            y: 220,
            width: 240,
            height: 96,
        };

        return {
            ...block,
            portAnchors: buildBlockPortAnchors(block),
        };
    })(),
    (() => {
        const block: ScenarioSimpleBlockNode = {
            id: crypto.randomUUID(),
            kind: "end",
            executionType: "system",
            title: "Конечный",
            x: 900,
            y: 220,
            width: 240,
            height: 96,
        };

        return {
            ...block,
            portAnchors: buildBlockPortAnchors(block),
        };
    })(),
];

export const createInsertedBlock = (
    payload: ScenarioCanvasInsertPayload,
    center: Point,
): ScenarioSimpleBlockNode => {
    if (payload.kind === "prompt") {
        const inputPorts = 1;
        const outputPorts = 1;

        const block: ScenarioSimpleBlockNode = {
            id: crypto.randomUUID(),
            kind: "prompt",
            executionType: "manual",
            title: "Инструкция",
            x: center.x,
            y: center.y,
            width: 320,
            height: calcBlockHeight(inputPorts, outputPorts, 96),
            meta: {
                prompt: {
                    instruction: "",
                },
            },
        };

        return {
            ...block,
            portAnchors: buildBlockPortAnchors(block),
        };
    }

    if (payload.kind === "condition") {
        const defaultFields = createDefaultConditionFields();
        const inputPorts = defaultFields.length + 1;
        const outputPorts = 3;

        const block: ScenarioSimpleBlockNode = {
            id: crypto.randomUUID(),
            kind: "condition",
            executionType: "manual",
            title: "Условие",
            x: center.x,
            y: center.y,
            width: 320,
            height: calcBlockHeight(inputPorts, outputPorts, 120),
            meta: {
                condition: {
                    fields: defaultFields,
                    rules: createDefaultConditionRules(),
                },
            },
        };

        return {
            ...block,
            portAnchors: buildBlockPortAnchors(block),
        };
    }

    if (payload.kind === "variable") {
        const defaultMeta = createDefaultVariableMeta();
        const inputPorts = 1;
        const outputPorts = defaultMeta.selectedVariables.length + 1;

        const block: ScenarioSimpleBlockNode = {
            id: crypto.randomUUID(),
            kind: "variable",
            executionType: "manual",
            title: "Переменная",
            x: center.x,
            y: center.y,
            width: 320,
            height: calcBlockHeight(inputPorts, outputPorts, 96),
            meta: {
                variable: defaultMeta,
            },
        };

        return {
            ...block,
            portAnchors: buildBlockPortAnchors(block),
        };
    }

    const parsedInputs = parseToolInputFromSchema(payload.toolSchema || "{}");
    const parsedOutputs = parseToolOutputNamesFromSchema(payload.outputScheme);
    const normalizedOutputScheme = normalizeOutputSchemeString(
        payload.outputScheme,
    );
    const inputPorts = parsedInputs.length + 1;
    const outputPorts = parsedOutputs.length + 1;

    const block: ScenarioSimpleBlockNode = {
        id: crypto.randomUUID(),
        kind: "tool",
        executionType: "tools",
        title: payload.toolName || "Tool",
        x: center.x,
        y: center.y,
        width: 300,
        height: calcBlockHeight(inputPorts, outputPorts, 120),
        meta: {
            tool: {
                toolName: payload.toolName || "tool",
                toolSchema: payload.toolSchema || "{}",
                input: parsedInputs,
                ...(normalizedOutputScheme
                    ? {
                          outputScheme: normalizedOutputScheme,
                      }
                    : {}),
            },
        },
    };

    return {
        ...block,
        portAnchors: buildBlockPortAnchors(block),
    };
};

export const toPlainObject = (value: unknown): Record<string, unknown> => {
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

    if (kind === "prompt" || kind === "condition" || kind === "variable") {
        return "manual";
    }

    if (kind === "tool") {
        return "tools";
    }

    return "system";
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
        ? raw.selectedVariables.filter(
              (item): item is ScenarioVariableKey =>
                  typeof item === "string" &&
                  VARIABLE_KEYS.includes(item as ScenarioVariableKey),
          )
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
    const kind =
        raw.kind === "end" ||
        raw.kind === "tool" ||
        raw.kind === "prompt" ||
        raw.kind === "condition" ||
        raw.kind === "variable"
            ? raw.kind
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
