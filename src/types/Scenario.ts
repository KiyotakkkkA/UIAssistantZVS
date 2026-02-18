export type Scenario = {
    id: string;
    name: string;
    description: string;
    content: Record<string, unknown>;
    createdAt: string;
    updatedAt: string;
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
};

export type DeleteScenarioResult = {
    scenarios: ScenarioListItem[];
    deletedScenarioId: string;
};
