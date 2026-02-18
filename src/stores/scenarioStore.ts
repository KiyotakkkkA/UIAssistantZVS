import { makeAutoObservable, runInAction } from "mobx";
import type {
    CreateScenarioPayload,
    Scenario,
    ScenarioListItem,
    UpdateScenarioPayload,
} from "../types/Scenario";

class ScenarioStore {
    isReady = false;
    scenarios: ScenarioListItem[] = [];
    activeScenario: Scenario | null = null;

    private isInitializing = false;

    constructor() {
        makeAutoObservable(this, {}, { autoBind: true });
    }

    async initialize(): Promise<void> {
        if (this.isReady || this.isInitializing) {
            return;
        }

        this.isInitializing = true;

        try {
            const api = window.appApi;

            if (!api) {
                runInAction(() => {
                    this.isReady = true;
                });
                return;
            }

            const [scenarios, bootData] = await Promise.all([
                api.scenarios.getScenariosList(),
                api.boot.getBootData(),
            ]);

            const activeScenarioId = bootData.userProfile.activeScenarioId;
            const activeScenario = activeScenarioId
                ? await api.scenarios.getScenarioById(activeScenarioId)
                : null;

            runInAction(() => {
                this.scenarios = scenarios;
                this.activeScenario = activeScenario;
                this.isReady = true;
            });
        } finally {
            runInAction(() => {
                this.isInitializing = false;
            });
        }
    }

    async createScenario(
        payload: CreateScenarioPayload,
    ): Promise<Scenario | null> {
        const api = window.appApi;

        if (!api) {
            return null;
        }

        const scenario = await api.scenarios.createScenario(payload);

        runInAction(() => {
            this.activeScenario = scenario;
            this.upsertScenarioListItem(scenario);
        });

        return scenario;
    }

    async switchScenario(scenarioId: string): Promise<Scenario | null> {
        return await this.loadScenario(scenarioId);
    }

    async loadScenario(scenarioId: string): Promise<Scenario | null> {
        const api = window.appApi;

        if (!api) {
            return null;
        }

        const scenario = await api.scenarios.getScenarioById(scenarioId);

        if (!scenario) {
            return null;
        }

        runInAction(() => {
            this.activeScenario = scenario;
            this.upsertScenarioListItem(scenario);
        });

        return scenario;
    }

    async updateScenario(
        scenarioId: string,
        payload: UpdateScenarioPayload,
    ): Promise<Scenario | null> {
        const api = window.appApi;

        if (!api) {
            return null;
        }

        const scenario = await api.scenarios.updateScenario(
            scenarioId,
            payload,
        );

        if (!scenario) {
            return null;
        }

        runInAction(() => {
            if (this.activeScenario?.id === scenario.id) {
                this.activeScenario = scenario;
            }
            this.upsertScenarioListItem(scenario);
        });

        return scenario;
    }

    async deleteScenario(scenarioId: string): Promise<boolean> {
        const api = window.appApi;

        if (!api) {
            return false;
        }

        const result = await api.scenarios.deleteScenario(scenarioId);

        runInAction(() => {
            this.scenarios = result.scenarios;

            if (this.activeScenario?.id === scenarioId) {
                this.activeScenario = null;
            }
        });

        return true;
    }

    clearActiveScenario(): void {
        this.activeScenario = null;
    }

    private upsertScenarioListItem(scenario: Scenario): void {
        const item: ScenarioListItem = {
            id: scenario.id,
            title: scenario.name,
            preview: scenario.description.trim() || "Сценарий без описания",
            time: new Date(scenario.updatedAt).toLocaleTimeString("ru-RU", {
                hour: "2-digit",
                minute: "2-digit",
            }),
            updatedAt: scenario.updatedAt,
        };

        const next = [
            item,
            ...this.scenarios.filter((existing) => existing.id !== scenario.id),
        ];

        next.sort((left, right) =>
            right.updatedAt.localeCompare(left.updatedAt),
        );

        this.scenarios = next;
    }
}

export const scenarioStore = new ScenarioStore();
