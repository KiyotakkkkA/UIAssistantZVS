import { Button, InputSmall, Select } from "../../atoms";
import type {
    ScenarioConditionMeta,
    ScenarioConditionOperand,
    ScenarioConditionOperandSource,
    ScenarioConditionOperator,
    ScenarioConditionRule,
} from "../../../../types/Scenario";

type ScenarioConditionSettingsFormProps = {
    value: ScenarioConditionMeta;
    onChange: (next: ScenarioConditionMeta) => void;
};

const SOURCE_OPTIONS: {
    value: ScenarioConditionOperandSource;
    label: string;
}[] = [
    { value: "field", label: "Поле" },
    { value: "value", label: "Значение" },
];

const OPERATOR_OPTIONS: { value: ScenarioConditionOperator; label: string }[] =
    [
        { value: "=", label: "=" },
        { value: "!=", label: "!=" },
        { value: ">", label: ">" },
        { value: "<", label: "<" },
        { value: ">=", label: ">=" },
        { value: "<=", label: "<=" },
        { value: "contains", label: "⊂" },
        { value: "not_contains", label: "⊄" },
    ];

const createOperand = (fieldName?: string): ScenarioConditionOperand => ({
    id: crypto.randomUUID(),
    leftSource: "field",
    leftValue: fieldName || "value",
    operator: "=",
    rightSource: "value",
    rightValue: "",
});

const createRule = (
    index: number,
    fieldName?: string,
): ScenarioConditionRule => ({
    id: crypto.randomUUID(),
    title: `Условие ${index + 1}`,
    operands: [createOperand(fieldName)],
});

const getFallbackFieldName = (meta: ScenarioConditionMeta) =>
    meta.fields[0]?.name || "value";

export function ScenarioConditionSettingsForm({
    value,
    onChange,
}: ScenarioConditionSettingsFormProps) {
    const fieldOptions = value.fields.map((field) => ({
        value: field.name,
        label: field.name,
    }));

    const fieldSelectOptions =
        fieldOptions.length > 0
            ? fieldOptions
            : [{ value: "value", label: "value" }];

    const updateAll = (next: ScenarioConditionMeta) => onChange(next);

    const setFieldName = (fieldId: string, nextName: string) => {
        updateAll({
            ...value,
            fields: value.fields.map((field) =>
                field.id === fieldId ? { ...field, name: nextName } : field,
            ),
        });
    };

    const removeField = (fieldId: string) => {
        if (value.fields.length <= 1) {
            return;
        }

        const removed = value.fields.find((field) => field.id === fieldId);
        const nextFields = value.fields.filter((field) => field.id !== fieldId);
        const fallback = nextFields[0]?.name || "value";

        updateAll({
            fields: nextFields,
            rules: value.rules.map((rule) => ({
                ...rule,
                operands: rule.operands.map((operand) => ({
                    ...operand,
                    leftValue:
                        operand.leftSource === "field" &&
                        removed &&
                        operand.leftValue === removed.name
                            ? fallback
                            : operand.leftValue,
                    rightValue:
                        operand.rightSource === "field" &&
                        removed &&
                        operand.rightValue === removed.name
                            ? fallback
                            : operand.rightValue,
                })),
            })),
        });
    };

    const addField = () => {
        const index = value.fields.length + 1;

        updateAll({
            ...value,
            fields: [
                ...value.fields,
                { id: crypto.randomUUID(), name: `value_${index}` },
            ],
        });
    };

    const setRuleTitle = (ruleId: string, title: string) => {
        updateAll({
            ...value,
            rules: value.rules.map((rule) =>
                rule.id === ruleId ? { ...rule, title } : rule,
            ),
        });
    };

    const addRule = () => {
        updateAll({
            ...value,
            rules: [
                ...value.rules,
                createRule(value.rules.length, getFallbackFieldName(value)),
            ],
        });
    };

    const removeRule = (ruleId: string) => {
        if (value.rules.length <= 1) {
            return;
        }

        updateAll({
            ...value,
            rules: value.rules.filter((rule) => rule.id !== ruleId),
        });
    };

    const updateOperand = (
        ruleId: string,
        operandId: string,
        updater: (prev: ScenarioConditionOperand) => ScenarioConditionOperand,
    ) => {
        updateAll({
            ...value,
            rules: value.rules.map((rule) =>
                rule.id === ruleId
                    ? {
                          ...rule,
                          operands: rule.operands.map((operand) =>
                              operand.id === operandId
                                  ? updater(operand)
                                  : operand,
                          ),
                      }
                    : rule,
            ),
        });
    };

    const addOperand = (ruleId: string) => {
        updateAll({
            ...value,
            rules: value.rules.map((rule) =>
                rule.id === ruleId
                    ? {
                          ...rule,
                          operands: [
                              ...rule.operands,
                              createOperand(getFallbackFieldName(value)),
                          ],
                      }
                    : rule,
            ),
        });
    };

    const removeOperand = (ruleId: string, operandId: string) => {
        updateAll({
            ...value,
            rules: value.rules.map((rule) => {
                if (rule.id !== ruleId) {
                    return rule;
                }

                if (rule.operands.length <= 1) {
                    return rule;
                }

                return {
                    ...rule,
                    operands: rule.operands.filter(
                        (operand) => operand.id !== operandId,
                    ),
                };
            }),
        });
    };

    return (
        <div className="space-y-4">
            <div className="space-y-3 rounded-xl border border-main-700/70 bg-main-900/50 p-4">
                <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-main-200">
                        Поля условия
                    </p>
                    <span className="text-xs text-main-400">
                        {value.fields.length} шт.
                    </span>
                </div>

                <div className="space-y-2">
                    {value.fields.map((field) => (
                        <div
                            key={field.id}
                            className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2"
                        >
                            <InputSmall
                                value={field.name}
                                onChange={(event) => {
                                    setFieldName(field.id, event.target.value);
                                }}
                                placeholder="Название входного поля"
                            />
                            <Button
                                variant="secondary"
                                shape="rounded-lg"
                                className="h-9 px-3"
                                onClick={() => removeField(field.id)}
                            >
                                Удалить
                            </Button>
                        </div>
                    ))}
                </div>

                <Button
                    variant="secondary"
                    shape="rounded-lg"
                    className="h-9 px-4"
                    onClick={addField}
                >
                    Добавить поле
                </Button>
            </div>

            <div className="space-y-3">
                {value.rules.map((rule, ruleIndex) => (
                    <div
                        key={rule.id}
                        className="space-y-3 rounded-xl border border-main-700/70 bg-main-900/50 p-4"
                    >
                        <div className="flex flex-wrap items-center gap-2">
                            <div className="min-w-0 flex-1">
                                <InputSmall
                                    value={rule.title}
                                    onChange={(event) => {
                                        setRuleTitle(
                                            rule.id,
                                            event.target.value,
                                        );
                                    }}
                                    placeholder={`Условие ${ruleIndex + 1}`}
                                />
                            </div>
                            <Button
                                variant="secondary"
                                shape="rounded-lg"
                                className="h-9 px-3"
                                onClick={() => removeRule(rule.id)}
                            >
                                Удалить
                            </Button>
                        </div>

                        <p className="text-xs text-main-400">
                            Операнды внутри условия объединяются AND.
                        </p>

                        <div className="space-y-2">
                            {rule.operands.map((operand) => (
                                <div
                                    key={operand.id}
                                    className="rounded-lg border border-main-700/60 bg-main-800/40 p-2"
                                >
                                    <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-[120px_minmax(0,1fr)_90px_120px_minmax(0,1fr)_auto] xl:items-center">
                                        <div className="min-w-0">
                                            <Select
                                                value={operand.leftSource}
                                                onChange={(next) => {
                                                    const nextSource =
                                                        next === "field"
                                                            ? "field"
                                                            : "value";
                                                    const fallbackField =
                                                        getFallbackFieldName(
                                                            value,
                                                        );

                                                    updateOperand(
                                                        rule.id,
                                                        operand.id,
                                                        (prev) => ({
                                                            ...prev,
                                                            leftSource:
                                                                nextSource,
                                                            leftValue:
                                                                nextSource ===
                                                                "field"
                                                                    ? fieldSelectOptions.some(
                                                                          (
                                                                              option,
                                                                          ) =>
                                                                              option.value ===
                                                                              prev.leftValue,
                                                                      )
                                                                        ? prev.leftValue
                                                                        : fallbackField
                                                                    : prev.leftValue,
                                                        }),
                                                    );
                                                }}
                                                options={SOURCE_OPTIONS}
                                                className="h-9 rounded-lg border border-main-700 bg-main-800 px-3 text-sm text-main-100"
                                                wrapperClassName="w-full min-w-0"
                                            />
                                        </div>

                                        <div className="min-w-0 ml-4">
                                            {operand.leftSource === "field" ? (
                                                <Select
                                                    value={operand.leftValue}
                                                    onChange={(next) => {
                                                        updateOperand(
                                                            rule.id,
                                                            operand.id,
                                                            (prev) => ({
                                                                ...prev,
                                                                leftValue: next,
                                                            }),
                                                        );
                                                    }}
                                                    options={fieldSelectOptions}
                                                    className="h-9 rounded-lg border border-main-700 bg-main-800 px-3 text-sm text-main-100"
                                                    wrapperClassName="w-full min-w-0"
                                                />
                                            ) : (
                                                <InputSmall
                                                    value={operand.leftValue}
                                                    onChange={(event) => {
                                                        updateOperand(
                                                            rule.id,
                                                            operand.id,
                                                            (prev) => ({
                                                                ...prev,
                                                                leftValue:
                                                                    event.target
                                                                        .value,
                                                            }),
                                                        );
                                                    }}
                                                    placeholder="Значение"
                                                />
                                            )}
                                        </div>

                                        <div className="min-w-0">
                                            <Select
                                                value={operand.operator}
                                                onChange={(next) => {
                                                    updateOperand(
                                                        rule.id,
                                                        operand.id,
                                                        (prev) => ({
                                                            ...prev,
                                                            operator:
                                                                (next as ScenarioConditionOperator) ||
                                                                "=",
                                                        }),
                                                    );
                                                }}
                                                options={OPERATOR_OPTIONS}
                                                className="h-9 rounded-lg border border-main-700 bg-main-800 px-3 text-sm text-main-100"
                                                wrapperClassName="min-w-0"
                                            />
                                        </div>

                                        <div className="min-w-0 ml-12">
                                            <Select
                                                value={operand.rightSource}
                                                onChange={(next) => {
                                                    const nextSource =
                                                        next === "field"
                                                            ? "field"
                                                            : "value";
                                                    const fallbackField =
                                                        getFallbackFieldName(
                                                            value,
                                                        );

                                                    updateOperand(
                                                        rule.id,
                                                        operand.id,
                                                        (prev) => ({
                                                            ...prev,
                                                            rightSource:
                                                                nextSource,
                                                            rightValue:
                                                                nextSource ===
                                                                "field"
                                                                    ? fieldSelectOptions.some(
                                                                          (
                                                                              option,
                                                                          ) =>
                                                                              option.value ===
                                                                              prev.rightValue,
                                                                      )
                                                                        ? prev.rightValue
                                                                        : fallbackField
                                                                    : prev.rightValue,
                                                        }),
                                                    );
                                                }}
                                                options={SOURCE_OPTIONS}
                                                className="h-9 rounded-lg border border-main-700 bg-main-800 px-3 text-sm text-main-100"
                                                wrapperClassName="w-full min-w-0"
                                            />
                                        </div>

                                        <div className="min-w-0 ml-16">
                                            {operand.rightSource === "field" ? (
                                                <Select
                                                    value={operand.rightValue}
                                                    onChange={(next) => {
                                                        updateOperand(
                                                            rule.id,
                                                            operand.id,
                                                            (prev) => ({
                                                                ...prev,
                                                                rightValue:
                                                                    next,
                                                            }),
                                                        );
                                                    }}
                                                    options={fieldSelectOptions}
                                                    className="h-9 rounded-lg border border-main-700 bg-main-800 px-3 text-sm text-main-100"
                                                    wrapperClassName="w-full min-w-0"
                                                />
                                            ) : (
                                                <InputSmall
                                                    value={operand.rightValue}
                                                    onChange={(event) => {
                                                        updateOperand(
                                                            rule.id,
                                                            operand.id,
                                                            (prev) => ({
                                                                ...prev,
                                                                rightValue:
                                                                    event.target
                                                                        .value,
                                                            }),
                                                        );
                                                    }}
                                                    placeholder="Значение"
                                                />
                                            )}
                                        </div>

                                        <div className="min-w-0 xl:justify-self-end">
                                            <Button
                                                variant="secondary"
                                                shape="rounded-lg"
                                                className="h-9 px-3"
                                                onClick={() =>
                                                    removeOperand(
                                                        rule.id,
                                                        operand.id,
                                                    )
                                                }
                                            >
                                                Удалить
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <Button
                            variant="secondary"
                            shape="rounded-lg"
                            className="h-9 px-4"
                            onClick={() => addOperand(rule.id)}
                        >
                            Добавить операнд
                        </Button>
                    </div>
                ))}

                <Button
                    variant="secondary"
                    shape="rounded-lg"
                    className="h-9 px-4"
                    onClick={addRule}
                >
                    Добавить условие
                </Button>
            </div>
        </div>
    );
}
