export type ScenarioLaunchPayload = {
    scenarioName: string;
    displayMessage: string;
    scenarioFlow: string;
};

const SCENARIO_LAUNCH_PREFIX = "__SCENARIO_LAUNCH__::";
const REQUIRED_SCENARIO_FIELDS: Array<keyof ScenarioLaunchPayload> = [
    "scenarioName",
    "displayMessage",
    "scenarioFlow",
];

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

        if (!parsed) {
            return null;
        }

        const hasAllRequiredFields = REQUIRED_SCENARIO_FIELDS.every(
            (field) => typeof parsed[field] === "string",
        );

        if (!hasAllRequiredFields) {
            return null;
        }

        const scenarioName = parsed.scenarioName as string;
        const displayMessage = parsed.displayMessage as string;
        const scenarioFlow = parsed.scenarioFlow as string;

        return {
            scenarioName,
            displayMessage,
            scenarioFlow,
        };
    } catch {
        return null;
    }
};
