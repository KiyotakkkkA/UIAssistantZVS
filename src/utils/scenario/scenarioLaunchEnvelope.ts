export type ScenarioLaunchPayload = {
    scenarioName: string;
    displayMessage: string;
    scenarioFlow: string;
};

const SCENARIO_LAUNCH_PREFIX = "__SCENARIO_LAUNCH__::";

export const encodeScenarioLaunchPayload = (
    payload: ScenarioLaunchPayload,
): string => {
    return `${SCENARIO_LAUNCH_PREFIX}${JSON.stringify(payload)}`;
};

export const parseScenarioLaunchPayload = (
    raw: string,
): ScenarioLaunchPayload | null => {
    if (!raw.startsWith(SCENARIO_LAUNCH_PREFIX)) {
        return null;
    }

    const json = raw.slice(SCENARIO_LAUNCH_PREFIX.length);

    try {
        const parsed = JSON.parse(json) as Partial<ScenarioLaunchPayload>;

        if (
            !parsed ||
            typeof parsed.scenarioName !== "string" ||
            typeof parsed.displayMessage !== "string" ||
            typeof parsed.scenarioFlow !== "string"
        ) {
            return null;
        }

        return {
            scenarioName: parsed.scenarioName,
            displayMessage: parsed.displayMessage,
            scenarioFlow: parsed.scenarioFlow,
        };
    } catch {
        return null;
    }
};
