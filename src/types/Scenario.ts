export type Scenario = {
    id: string;
    name: string;
    description: string;
    content: Record<string, unknown>;
    createdAt: string;
    updatedAt: string;
};

export type ScenarioSimpleBlockKind = "start" | "end";

export type ScenarioSimpleBlockNode = {
    id: string;
    kind: ScenarioSimpleBlockKind;
    title: string;
    x: number;
    y: number;
    width: number;
    height: number;
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
