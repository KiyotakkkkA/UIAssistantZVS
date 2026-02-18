import { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { useNavigate, useParams } from "react-router-dom";
import { useToasts } from "../../../hooks";
import { useScenario } from "../../../hooks/agents";
import { Loader } from "../../components/atoms";

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
                <div className="mt-6 rounded-xl border border-dashed border-main-700/70 bg-main-900/40 p-4 text-sm text-main-400">
                    Мок-страница сценария. Дерево контента и редактор добавим на
                    следующем этапе.
                </div>
            </div>
        </section>
    );
});
