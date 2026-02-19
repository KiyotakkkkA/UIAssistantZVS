import { useMemo } from "react";
import { Icon } from "@iconify/react";
import { observer } from "mobx-react-lite";
import { toolsStore } from "../../../../stores/toolsStore";
import { AutoFillSelector, InputCheckbox, InputSmall } from "../../atoms";

interface RequiredToolsPickFormProps {
    toolsQuery: string;
    onToolsQueryChange: (value: string) => void;
    withSectionFrame?: boolean;
}

export const RequiredToolsPickForm = observer(function RequiredToolsPickForm({
    toolsQuery,
    onToolsQueryChange,
    withSectionFrame = false,
}: RequiredToolsPickFormProps) {
    const filteredPackages = useMemo(
        () => toolsStore.getFilteredPackages(toolsQuery),
        [toolsQuery],
    );

    const Wrapper = withSectionFrame ? "section" : "div";

    return (
        <Wrapper
            className={
                withSectionFrame
                    ? "space-y-4 border-l-3 border-main-600 pl-3"
                    : "space-y-4"
            }
        >
            <p className="text-sm font-semibold text-main-100">
                Используемые инструменты
            </p>

            <InputSmall
                value={toolsQuery}
                onChange={(event) => onToolsQueryChange(event.target.value)}
                placeholder="Поиск по пакетам и инструментам"
            />

            <div className="rounded-xl border border-main-700/70 bg-main-900/50 p-3">
                <p className="text-sm font-semibold text-main-100">
                    Инструменты для обязательного использования
                </p>
                <p className="mt-1 text-xs text-main-400">
                    Выбранные инструменты будут обязательно использованы при
                    ответе во време работы над задачей.
                </p>
                <AutoFillSelector
                    className="mt-3"
                    options={toolsStore.enabledToolOptions}
                    value={toolsStore.requiredPromptTools}
                    onChange={toolsStore.setRequiredPromptTools}
                    placeholder="Выберите инструменты"
                />
            </div>

            {filteredPackages.length === 0 ? (
                <div className="rounded-xl border border-main-700/70 bg-main-900/45 p-4 text-sm text-main-400">
                    По вашему запросу ничего не найдено.
                </div>
            ) : (
                filteredPackages.map((pkg) => (
                    <article
                        key={pkg.id}
                        className="rounded-2xl bg-main-900/45 p-4"
                    >
                        <div className="mb-3">
                            <div className="flex items-center gap-2">
                                <Icon
                                    icon="mdi:tools"
                                    className="text-main-100"
                                />
                                <p className="text-base font-semibold text-main-100">
                                    {pkg.title}
                                </p>
                            </div>
                            <p className="mt-1 text-xs text-main-400">
                                {pkg.description}
                            </p>
                        </div>

                        <div className="space-y-2 border-l-2 pl-4 border-main-600">
                            {pkg.tools.map((tool) => {
                                const toolName = tool.schema.function.name;
                                const isEnabled =
                                    toolsStore.isToolEnabled(toolName);

                                return (
                                    <div
                                        key={`${pkg.id}_${toolName}`}
                                        className="flex items-start justify-between gap-3 rounded-xl border border-main-700/70 bg-main-900/60 p-3"
                                    >
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <Icon
                                                    icon="mdi:toolbox"
                                                    className="text-main-100"
                                                />
                                                <p className="text-sm font-semibold text-main-100">
                                                    {toolName}
                                                </p>
                                            </div>
                                            <p className="mt-1 text-xs text-main-400">
                                                {tool.schema.function
                                                    .description ||
                                                    "Без описания"}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-main-400">
                                                {isEnabled
                                                    ? "Включен"
                                                    : "Выключен"}
                                            </span>
                                            <InputCheckbox
                                                checked={isEnabled}
                                                onChange={(checked) =>
                                                    toolsStore.setToolEnabled(
                                                        toolName,
                                                        checked,
                                                    )
                                                }
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </article>
                ))
            )}
        </Wrapper>
    );
});
