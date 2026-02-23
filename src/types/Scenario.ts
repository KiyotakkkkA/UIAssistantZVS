export type Scenario = {
    id: string;
    name: string;
    description: string;
    content: Record<string, unknown>;
    cachedModelScenarioHash?: string;
    cachedModelScenario?: string;
    createdAt: string;
    updatedAt: string;
};

export type ScenarioBlockKind =
    | "start"
    | "end"
    | "tool"
    | "prompt"
    | "condition"
    | "variable";

export type ScenarioBlockExecutionType = "system" | "manual" | "tools";

export type ScenarioBlockToolsParamsUsage = {
    param: string;
    description: string;
    comment: string;
    defaultValue?: string;
};

export type ScenarioToolMeta = {
    toolName: string;
    toolSchema: string;
    input: ScenarioBlockToolsParamsUsage[];
    outputScheme?: string;
};

export type ScenarioPromptMeta = {
    instruction: string;
};

export type ScenarioConditionField = {
    id: string;
    name: string;
};

export type ScenarioConditionOperandSource = "field" | "value";

export type ScenarioConditionOperator =
    | "="
    | "!="
    | ">"
    | "<"
    | ">="
    | "<="
    | "contains"
    | "not_contains";

export type ScenarioConditionOperand = {
    id: string;
    leftSource: ScenarioConditionOperandSource;
    leftValue: string;
    operator: ScenarioConditionOperator;
    rightSource: ScenarioConditionOperandSource;
    rightValue: string;
};

export type ScenarioConditionRule = {
    id: string;
    title: string;
    operands: ScenarioConditionOperand[];
};

export type ScenarioConditionMeta = {
    fields: ScenarioConditionField[];
    rules: ScenarioConditionRule[];
};

export type ScenarioVariableKey = "project_directory" | "current_date";

export type ScenarioVariableMeta = {
    selectedVariables: ScenarioVariableKey[];
};

export type ScenarioBlockMeta = {
    tool?: ScenarioToolMeta;
    prompt?: ScenarioPromptMeta;
    condition?: ScenarioConditionMeta;
    variable?: ScenarioVariableMeta;
};

export type ScenarioPortPoint = {
    x: number;
    y: number;
};

export type ScenarioBlockPortAnchors = {
    inputs: Record<string, ScenarioPortPoint>;
    outputs: Record<string, ScenarioPortPoint>;
};

export type ScenarioSimpleBlockNode = {
    id: string;
    kind: ScenarioBlockKind;
    executionType: ScenarioBlockExecutionType;
    title: string;
    x: number;
    y: number;
    width: number;
    height: number;
    portAnchors?: ScenarioBlockPortAnchors;
    meta?: ScenarioBlockMeta;
};

export type ScenarioConnection = {
    id: string;
    fromBlockId: string;
    toBlockId: string;
    fromPortName?: string;
    toPortName?: string;
};

export type ScenarioSceneViewport = {
    scale: number;
    offsetX: number;
    offsetY: number;
    showGrid: boolean;
    canvasWidth: number;
    canvasHeight: number;
};

export type ScenarioScene = {
    version: 1;
    blocks: ScenarioSimpleBlockNode[];
    connections: ScenarioConnection[];
    viewport: ScenarioSceneViewport;
};

export type ScenarioListItem = {
    id: string;
    title: string;
    preview: string;
    time: string;
    updatedAt: string;
};

export type CreateScenarioPayload = {
    name: string;
    description: string;
    content?: Record<string, unknown>;
};

export type UpdateScenarioPayload = {
    name: string;
    description: string;
    content?: Record<string, unknown>;
    cachedModelScenarioHash?: string;
    cachedModelScenario?: string;
};

export type DeleteScenarioResult = {
    scenarios: ScenarioListItem[];
    deletedScenarioId: string;
};
