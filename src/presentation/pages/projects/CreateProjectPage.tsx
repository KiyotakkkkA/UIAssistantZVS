import { useMemo, useState } from "react";
import { observer } from "mobx-react-lite";
import { toolsStore } from "../../../stores/toolsStore";
import {
    AutoFillSelector,
    Button,
    InputBig,
    InputCheckbox,
    InputFile,
    InputSmall,
} from "../../components/atoms";

export const CreateProjectPage = observer(function CreateProjectPage() {
    const [projectName, setProjectName] = useState("");
    const [projectDescription, setProjectDescription] = useState("");
    const [toolsQuery, setToolsQuery] = useState("");

    const filteredPackages = useMemo(
        () => toolsStore.getFilteredPackages(toolsQuery),
        [toolsQuery],
    );

    return (
        <div className="flex h-full flex-col overflow-hidden rounded-2xl bg-main-900/60">
            <div className="flex-1 space-y-6 overflow-y-auto p-1">
                <div>
                    <h2 className="text-lg font-semibold text-main-100">
                        Создание проекта
                    </h2>
                    <p className="mt-2 text-sm text-main-300">
                        Заполните базовые параметры проекта.
                    </p>
                </div>

                <section className="space-y-2">
                    <p className="text-sm font-semibold text-main-100">
                        Название проекта
                    </p>
                    <InputSmall
                        value={projectName}
                        onChange={(event) => setProjectName(event.target.value)}
                        placeholder="Название проекта"
                    />
                </section>

                <section className="space-y-2">
                    <p className="text-sm font-semibold text-main-100">
                        Описание проекта
                    </p>
                    <InputBig
                        value={projectDescription}
                        onChange={setProjectDescription}
                        className="h-28! rounded-xl! border border-main-700/70 bg-main-800/70 px-3 py-2 text-main-100 placeholder:text-main-500"
                        placeholder="Опишите цель и контекст проекта"
                    />
                </section>

                <section className="space-y-4">
                    <p className="text-sm font-semibold text-main-100">
                        Используемые инструменты
                    </p>

                    <InputSmall
                        value={toolsQuery}
                        onChange={(event) => setToolsQuery(event.target.value)}
                        placeholder="Поиск по пакетам и инструментам"
                    />

                    <div className="rounded-xl border border-main-700/70 bg-main-900/50 p-3">
                        <p className="text-sm font-semibold text-main-100">
                            Инструменты для обязательного использования
                        </p>
                        <p className="mt-1 text-xs text-main-400">
                            Выбранные инструменты будут добавлены в промпт как:
                            <br />
                            You must use these tools while completing task:
                            TOOLS - ...
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
                                    <p className="text-base font-semibold text-main-100">
                                        {pkg.title}
                                    </p>
                                    <p className="mt-1 text-xs text-main-400">
                                        {pkg.description}
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    {pkg.tools.map((tool) => {
                                        const toolName =
                                            tool.schema.function.name;
                                        const isEnabled =
                                            toolsStore.isToolEnabled(toolName);

                                        return (
                                            <div
                                                key={`${pkg.id}_${toolName}`}
                                                className="flex items-start justify-between gap-3 rounded-xl border border-main-700/70 bg-main-900/60 p-3"
                                            >
                                                <div>
                                                    <p className="text-sm font-semibold text-main-100">
                                                        {toolName}
                                                    </p>
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
                </section>

                <section className="space-y-2">
                    <InputFile
                        label="Документы"
                        helperText="Добавьте материалы проекта через проводник"
                        accept={["image/*", ".pdf", ".docx"]}
                        multiple
                    />
                </section>
            </div>

            <div className="p-4">
                <Button
                    variant="primary"
                    shape="rounded-lg"
                    className="h-9 px-4"
                    disabled
                >
                    Создать проект
                </Button>
            </div>
        </div>
    );
});
