import { useCallback } from "react";
import type { Scenario } from "../../types/Scenario";
import {
    buildScenarioSceneHash,
    formatScenarioFlow,
} from "../../utils/scenario/scenarioFlow";
import { useScenario } from "./useScenario";

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
