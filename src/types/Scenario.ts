export type Scenario = {
    id: string;
    name: string;
    description: string;
    content: Record<string, unknown>;
    createdAt: string;
    updatedAt: string;
};

export type ScenarioBlockKind =
    | "start"
    | "end"
    | "manual-http"
    | "manual-datetime"
    | "tool";

export type ScenarioBlockExecutionType = "system" | "manual" | "tools";

export type ScenarioManualHttpRequestMeta = {
    url: string;
    method: string;
    formatter: string;
    lastResponseCode?: number;
    lastResponseText?: string;
};

export type ScenarioManualDatetimeGetMeta = {
    mode: "date" | "time" | "datetime";
    timezoneMode: "current" | "manual";
    timezone: string;
};

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
};

export type ScenarioBlockMeta = {
    manualHttp?: ScenarioManualHttpRequestMeta;
    manualDatetime?: ScenarioManualDatetimeGetMeta;
    tool?: ScenarioToolMeta;
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
    meta?: ScenarioBlockMeta;
};

export type ScenarioConnection = {
    id: string;
    fromBlockId: string;
    toBlockId: string;
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
};

export type DeleteScenarioResult = {
    scenarios: ScenarioListItem[];
    deletedScenarioId: string;
};
