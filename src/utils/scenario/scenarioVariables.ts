import type { WorkspaceTab } from "../../types/App";
import type { ScenarioVariableKey } from "../../types/Scenario";

type ScenarioVariableDefinition = {
    key: ScenarioVariableKey;
    title: string;
    description: string;
};

export const START_BLOCK_INPUT_PORT = "__start__";
export const VARIABLE_CONTINUE_OUTPUT_PORT = "__continue__";

export const SCENARIO_VARIABLE_DEFINITIONS: ScenarioVariableDefinition[] = [
    {
        key: "project_directory",
        title: "Директория проекта",
        description:
            "Путь к активному проекту. Доступно только во вкладке Проекты.",
    },
    {
        key: "current_date",
        title: "Текущая дата",
        description: "Текущая дата и время на устройстве пользователя.",
    },
];

const SCENARIO_VARIABLE_TITLES = new Map<ScenarioVariableKey, string>(
    SCENARIO_VARIABLE_DEFINITIONS.map((item) => [item.key, item.title]),
);

export const getScenarioVariableTitle = (key: ScenarioVariableKey): string => {
    return SCENARIO_VARIABLE_TITLES.get(key) || key;
};

type ResolveScenarioVariablesArgs = {
    selectedVariables: ScenarioVariableKey[];
    activeProjectDirectoryPath: string | null;
    lastActiveTab: WorkspaceTab;
    now?: Date;
};

export type ScenarioVariableResolution = {
    values: Partial<Record<ScenarioVariableKey, string>>;
    warnings: string[];
};

export const resolveScenarioVariables = ({
    selectedVariables,
    activeProjectDirectoryPath,
    lastActiveTab,
    now = new Date(),
}: ResolveScenarioVariablesArgs): ScenarioVariableResolution => {
    const values: Partial<Record<ScenarioVariableKey, string>> = {};
    const warnings: string[] = [];

    const resolveByKey: Record<
        ScenarioVariableKey,
        (args: {
            activeProjectDirectoryPath: string | null;
            lastActiveTab: WorkspaceTab;
            now: Date;
            values: Partial<Record<ScenarioVariableKey, string>>;
            warnings: string[];
        }) => void
    > = {
        current_date: ({ now: nowValue, values: targetValues }) => {
            targetValues.current_date = nowValue.toLocaleString("ru-RU", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            });
        },
        project_directory: ({
            lastActiveTab: activeTab,
            activeProjectDirectoryPath: directoryPath,
            values: targetValues,
            warnings: targetWarnings,
        }) => {
            if (activeTab !== "projects" || !directoryPath?.trim()) {
                targetWarnings.push(
                    "Переменная project_directory недоступна: откройте вкладку Проекты и выберите активный проект.",
                );
                return;
            }

            targetValues.project_directory = directoryPath;
        },
    };

    selectedVariables.forEach((variableKey) => {
        const resolver = resolveByKey[variableKey];
        resolver({
            activeProjectDirectoryPath,
            lastActiveTab,
            now,
            values,
            warnings,
        });
    });

    return {
        values,
        warnings,
    };
};
