import { InputCheckbox } from "../../atoms";
import type {
    ScenarioVariableKey,
    ScenarioVariableMeta,
} from "../../../../types/Scenario";
import { SCENARIO_VARIABLE_DEFINITIONS } from "../../../../utils/scenarioVariables";

type ScenarioVariableSettingsFormProps = {
    value: ScenarioVariableMeta;
    onChange: (next: ScenarioVariableMeta) => void;
};

export function ScenarioVariableSettingsForm({
    value,
    onChange,
}: ScenarioVariableSettingsFormProps) {
    const selectedSet = new Set(value.selectedVariables);

    const toggleVariable = (variableKey: ScenarioVariableKey) => {
        const nextSelected = selectedSet.has(variableKey)
            ? value.selectedVariables.filter((item) => item !== variableKey)
            : [...value.selectedVariables, variableKey];

        onChange({
            selectedVariables: nextSelected,
        });
    };

    return (
        <div className="space-y-3">
            <p className="text-sm text-main-300">
                Выберите переменные, которые должны вычисляться перед запуском
                сценария.
            </p>

            <div className="space-y-2">
                {SCENARIO_VARIABLE_DEFINITIONS.map((variable) => (
                    <div
                        key={variable.key}
                        className="flex items-start justify-between gap-3 rounded-xl border border-main-700/70 bg-main-900/50 p-3"
                    >
                        <div className="min-w-0">
                            <p className="text-sm font-medium text-main-100">
                                {variable.title}
                            </p>
                            <p className="mt-1 text-xs text-main-400">
                                {variable.description}
                            </p>
                        </div>

                        <InputCheckbox
                            checked={selectedSet.has(variable.key)}
                            onChange={() => toggleVariable(variable.key)}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}
