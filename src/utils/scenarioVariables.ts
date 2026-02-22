import type { WorkspaceTab } from "../types/App";
import type { ScenarioVariableKey } from "../types/Scenario";

type ScenarioVariableDefinition = {
    key: ScenarioVariableKey;
    title: string;
    description: string;
};

export const START_BLOCK_INPUT_PORT = "__start__";
export const VARIABLE_CONTINUE_OUTPUT_PORT = "continue";

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

export const getScenarioVariableTitle = (key: ScenarioVariableKey): string => {
    const found = SCENARIO_VARIABLE_DEFINITIONS.find(
        (item) => item.key === key,
    );
    return found?.title || key;
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

    selectedVariables.forEach((variableKey) => {
        if (variableKey === "current_date") {
            values.current_date = now.toLocaleString("ru-RU", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            });
            return;
        }

        if (variableKey === "project_directory") {
            if (
                lastActiveTab !== "projects" ||
                !activeProjectDirectoryPath?.trim()
            ) {
                warnings.push(
                    "Переменная project_directory недоступна: откройте вкладку Проекты и выберите активный проект.",
                );
                return;
            }

            values.project_directory = activeProjectDirectoryPath;
        }
    });

    return {
        values,
        warnings,
    };
};
