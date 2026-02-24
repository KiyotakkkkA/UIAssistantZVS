import type {
    ScenarioBlockExecutionType,
    ScenarioBlockPortAnchors,
    ScenarioBlockToolsParamsUsage,
    ScenarioConditionField,
    ScenarioConditionOperand,
    ScenarioConditionOperator,
    ScenarioConditionRule,
    ScenarioSceneViewport,
    ScenarioSimpleBlockNode,
    ScenarioVariableKey,
    ScenarioVariableMeta,
} from "../../types/Scenario";

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

export const DEFAULT_PORT_KEY = "__default__";

const VARIABLE_KEYS: ScenarioVariableKey[] = [
    "project_directory",
    "current_date",
];

export const createDefaultVariableMeta = (): ScenarioVariableMeta => ({
    selectedVariables: ["current_date"],
});

export const calcBlockHeight = (
    inputPortsCount: number,
    outputPortsCount: number,
    minHeight = 96,
) => {
    const rows = Math.max(inputPortsCount, outputPortsCount, 1);
    return Math.max(minHeight, 56 + rows * 26);
};

export const toPortKey = (portName?: string) =>
    portName && portName.trim().length > 0 ? portName : DEFAULT_PORT_KEY;

export const buildEvenlyDistributedAnchors = (
    portNames: string[],
    x: number,
    height: number,
) => {
    const count = Math.max(portNames.length, 1);

    return portNames.reduce<Record<string, { x: number; y: number }>>(
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

export const normalizeOutputSchemeString = (
    raw: unknown,
): string | undefined => {
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

export const parseToolInputFromSchema = (
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

export const parseToolOutputNamesFromSchema = (
    rawSchema?: unknown,
): string[] => {
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

export const createDefaultConditionFields = (): ScenarioConditionField[] => [
    {
        id: crypto.randomUUID(),
        name: "value",
    },
];

export const CONDITION_OPERATORS: ScenarioConditionOperator[] = [
    "=",
    "!=",
    ">",
    "<",
    ">=",
    "<=",
    "contains",
    "not_contains",
];

export const createDefaultConditionOperand = (): ScenarioConditionOperand => ({
    id: crypto.randomUUID(),
    leftSource: "field",
    leftValue: "value",
    operator: "=",
    rightSource: "value",
    rightValue: "",
});

export const createDefaultConditionRules = (): ScenarioConditionRule[] => [
    {
        id: crypto.randomUUID(),
        title: "Условие 1",
        operands: [createDefaultConditionOperand()],
    },
];

export const normalizeConditionFields = (
    raw: unknown,
): ScenarioConditionField[] => {
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

export const normalizeConditionOperandSource = (
    value: unknown,
): "field" | "value" =>
    value === "field" || value === "value" ? value : "value";

export const normalizeConditionOperator = (
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

export const normalizeConditionOperands = (
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

export const normalizeConditionRules = (
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

export const normalizeExecutionType = (
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

export const resolveNormalizedPortAnchors = (
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
            return {} as Record<string, { x: number; y: number }>;
        }

        return Object.entries(record).reduce<
            Record<string, { x: number; y: number }>
        >((acc, [key, value]) => {
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
        }, {});
    };

    const inputs = normalizeMap(source.inputs);
    const outputs = normalizeMap(source.outputs);

    return {
        inputs: Object.keys(inputs).length > 0 ? inputs : fallback.inputs,
        outputs: Object.keys(outputs).length > 0 ? outputs : fallback.outputs,
    };
};

export const isAllowedVariableKey = (
    value: unknown,
): value is ScenarioVariableKey =>
    typeof value === "string" &&
    VARIABLE_KEYS.includes(value as ScenarioVariableKey);
