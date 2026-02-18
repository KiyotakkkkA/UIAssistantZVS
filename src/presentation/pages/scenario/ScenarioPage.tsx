import { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { useNavigate, useParams } from "react-router-dom";
import { useToasts } from "../../../hooks";
import { useScenario } from "../../../hooks/agents";
import { Loader, TreeView } from "../../components/atoms";
import { ScenarioCanvas } from "../../components/organisms/scenarios";
import { toolsStore } from "../../../stores/toolsStore";

export const ScenarioPage = observer(function ScenarioPage() {
    const { scenarioId = "" } = useParams();
    const navigate = useNavigate();
    const toasts = useToasts();
    const { activeScenario, switchScenario } = useScenario();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!scenarioId) {
            setIsLoading(false);
            return;
        }

        let isCancelled = false;

        void (async () => {
            const scenario = await switchScenario(scenarioId);

            if (isCancelled) {
                return;
            }

            if (!scenario) {
                toasts.warning({
                    title: "Сценарий не найден",
                    description: "Открыт список диалогов по умолчанию.",
                });
                navigate("/dialogs", { replace: true });
                return;
            }

            setIsLoading(false);
        })();

        return () => {
            isCancelled = true;
        };
    }, [navigate, scenarioId, switchScenario, toasts]);

    if (isLoading) {
        return (
            <section className="animate-page-fade-in flex min-w-0 flex-1 flex-col items-center justify-center gap-3 rounded-3xl bg-main-900/70 backdrop-blur-md">
                <Loader className="h-6 w-6" />
                <p className="text-sm text-main-300">Загрузка сценария...</p>
            </section>
        );
    }

    return (
        <section className="animate-page-fade-in flex min-w-0 flex-1 flex-col gap-3 rounded-3xl bg-main-900/70 p-4 backdrop-blur-md">
            <div className="rounded-2xl bg-main-900/60 p-4">
                <h1 className="text-lg font-semibold text-main-100">
                    {activeScenario?.name || "Сценарий"}
                </h1>
                <p className="mt-2 text-sm text-main-300">
                    {activeScenario?.description?.trim() ||
                        "Описание сценария пока не задано."}
                </p>
            </div>
            <div className="relative flex min-h-0 flex-1 gap-4">
                <aside className="w-80">
                    <TreeView className="h-full overflow-y-auto">
                        {toolsStore.packages.map((pkg) => (
                            <TreeView.Catalog
                                key={pkg.id}
                                title={pkg.title}
                                defaultOpen
                            >
                                {pkg.tools.map((tool) => (
                                    <TreeView.Element
                                        key={tool.schema.function.name}
                                        label={tool.schema.function.name}
                                        description={
                                            tool.schema.function.description
                                        }
                                    />
                                ))}
                            </TreeView.Catalog>
                        ))}
                    </TreeView>
                </aside>
                <ScenarioCanvas />
            </div>
        </section>
    );
});
