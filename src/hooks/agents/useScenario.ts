import { useCallback, useEffect } from "react";
import { scenarioStore } from "../../stores/scenarioStore";
import type {
    CreateScenarioPayload,
    UpdateScenarioPayload,
} from "../../types/Scenario";

export const useScenario = () => {
    useEffect(() => {
        scenarioStore.initialize();
    }, []);

    const createScenario = useCallback(
        async (payload: CreateScenarioPayload) => {
            return await scenarioStore.createScenario(payload);
        },
        [],
    );

    const switchScenario = useCallback(async (scenarioId: string) => {
        if (!scenarioId) {
            return null;
        }

        return await scenarioStore.switchScenario(scenarioId);
    }, []);

    const updateScenario = useCallback(
        async (scenarioId: string, payload: UpdateScenarioPayload) => {
            if (!scenarioId) {
                return null;
            }

            return await scenarioStore.updateScenario(scenarioId, payload);
        },
        [],
    );

    const deleteScenario = useCallback(async (scenarioId: string) => {
        if (!scenarioId) {
            return false;
        }

        return await scenarioStore.deleteScenario(scenarioId);
    }, []);

    return {
        isReady: scenarioStore.isReady,
        scenarios: scenarioStore.scenarios,
        activeScenario: scenarioStore.activeScenario,
        activeScenarioId: scenarioStore.activeScenario?.id ?? "",
        createScenario,
        switchScenario,
        updateScenario,
        deleteScenario,
        clearActiveScenario: scenarioStore.clearActiveScenario,
    };
};
