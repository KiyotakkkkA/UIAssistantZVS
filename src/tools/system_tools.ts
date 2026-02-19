import { ToolsBuilder } from "../utils/ToolsBuilder";

type PlanStep = {
    id: number;
    description: string;
    completed: boolean;
};

type Plan = {
    id: string;
    title: string;
    steps: PlanStep[];
    createdAt: string;
};

const planStore = new Map<string, Plan>();

function formatPlanResponse(plan: Plan) {
    const completed = plan.steps.filter((s) => s.completed);
    const pending = plan.steps.filter((s) => !s.completed);
    return {
        plan_id: plan.id,
        title: plan.title,
        progress: `${completed.length}/${plan.steps.length}`,
        completed_steps: completed.map((s) => ({
            id: s.id,
            description: s.description,
        })),
        pending_steps: pending.map((s) => ({
            id: s.id,
            description: s.description,
        })),
        next_step: pending[0] ?? null,
        is_complete: pending.length === 0,
    };
}

export const systemToolsPackage = () => {
    const builder = new ToolsBuilder();

    builder
        .addPackage({
            id: "system-tools",
            title: "Системные инструменты",
            description:
                "Вспомогательные инструменты для сопровождения процесса решения задачи.",
        })
        .addTool({
            name: "qa_tool",
            description:
                "Используется для формализации уточняющего вопроса к пользователю, когда входных данных недостаточно.",
            parameters: ToolsBuilder.objectSchema({
                properties: {
                    question: ToolsBuilder.stringParam(
                        "Точный вопрос пользователю",
                    ),
                    reason: ToolsBuilder.stringParam(
                        "Короткое объяснение, зачем нужен ответ",
                    ),
                    selectAnswers: {
                        type: "array",
                        description:
                            "Опциональный список готовых вариантов ответа для быстрого выбора пользователем",
                        items: {
                            type: "string",
                        },
                    },
                    userAnswer: ToolsBuilder.stringParam(
                        "Подсказка, какой развёрнутый ответ ожидается от пользователя",
                    ),
                },
                required: ["question"],
            }),
            execute: async (args) => {
                const question =
                    typeof args.question === "string" ? args.question : "";
                const reason =
                    typeof args.reason === "string" ? args.reason : "";
                const selectAnswers = Array.isArray(args.selectAnswers)
                    ? args.selectAnswers.filter(
                          (item): item is string => typeof item === "string",
                      )
                    : [];
                const userAnswer =
                    typeof args.userAnswer === "string" ? args.userAnswer : "";

                return {
                    status: "awaiting_user_response",
                    question,
                    reason,
                    selectAnswers,
                    userAnswer,
                    instruction:
                        "Задай пользователю этот вопрос и дождись ответа в чате перед продолжением.",
                };
            },
        })
        .addTool({
            name: "planning_tool",
            description:
                "Инструмент управления планом выполнения задачи. " +
                "Используй action='create' в самом начале работы над любой многошаговой задачей — до первого шага. " +
                "После завершения каждого пункта вызывай action='complete_step'. " +
                "Используй action='get_status' чтобы сверить текущий прогресс. " +
                "ВАЖНО: всегда следуй плану строго по порядку и не пропускай шаги.",
            parameters: ToolsBuilder.objectSchema({
                properties: {
                    action: ToolsBuilder.stringParam(
                        "Действие: 'create' — создать план, 'complete_step' — отметить шаг выполненным, 'get_status' — получить текущий статус плана",
                        ["create", "complete_step", "get_status"],
                    ),
                    title: ToolsBuilder.stringParam(
                        "Название плана (только для action='create')",
                    ),
                    steps: {
                        type: "array",
                        description:
                            "Список шагов плана в виде строк (только для action='create'). Шаги нумеруются автоматически начиная с 1.",
                        items: { type: "string" },
                    },
                    plan_id: ToolsBuilder.stringParam(
                        "ID плана, полученный при создании (для action='complete_step' и 'get_status')",
                    ),
                    step_id: ToolsBuilder.numberParam(
                        "Номер шага для отметки выполнения (для action='complete_step')",
                    ),
                },
                required: ["action"],
            }),
            execute: (args) => {
                const action =
                    typeof args.action === "string" ? args.action : "";

                // --- CREATE ---
                if (action === "create") {
                    const title =
                        typeof args.title === "string" && args.title.trim()
                            ? args.title.trim()
                            : "Без названия";

                    const rawSteps = Array.isArray(args.steps)
                        ? args.steps.filter(
                              (s): s is string => typeof s === "string",
                          )
                        : [];

                    if (rawSteps.length === 0) {
                        return {
                            error: "Необходимо передать хотя бы один шаг в поле 'steps'.",
                        };
                    }

                    const id = `plan_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
                    const plan: Plan = {
                        id,
                        title,
                        steps: rawSteps.map((desc, i) => ({
                            id: i + 1,
                            description: desc,
                            completed: false,
                        })),
                        createdAt: new Date().toISOString(),
                    };

                    planStore.set(id, plan);

                    return {
                        ...formatPlanResponse(plan),
                        instruction:
                            "План создан. Выполняй шаги строго по порядку. После каждого шага вызывай complete_step с соответствующим step_id.",
                    };
                }

                // --- COMPLETE STEP ---
                if (action === "complete_step") {
                    const planId =
                        typeof args.plan_id === "string" ? args.plan_id : "";
                    const stepId =
                        typeof args.step_id === "number" ? args.step_id : null;

                    const plan = planStore.get(planId);
                    if (!plan) {
                        return {
                            error: `План с id '${planId}' не найден. Сначала создай план через action='create'.`,
                        };
                    }

                    if (stepId === null) {
                        return {
                            error: "Необходимо указать step_id — номер выполненного шага.",
                        };
                    }

                    const step = plan.steps.find((s) => s.id === stepId);
                    if (!step) {
                        return {
                            error: `Шаг с id=${stepId} не найден в плане '${plan.title}'.`,
                        };
                    }

                    if (step.completed) {
                        return {
                            warning: `Шаг ${stepId} уже был отмечен как выполненный.`,
                            ...formatPlanResponse(plan),
                        };
                    }

                    step.completed = true;
                    const response = formatPlanResponse(plan);

                    return {
                        ...response,
                        instruction: response.is_complete
                            ? "Все шаги выполнены. План завершён."
                            : `Шаг ${stepId} отмечен выполненным. Следующий шаг: #${response.next_step?.id} — ${response.next_step?.description}`,
                    };
                }

                // --- GET STATUS ---
                if (action === "get_status") {
                    const planId =
                        typeof args.plan_id === "string" ? args.plan_id : "";
                    const plan = planStore.get(planId);

                    if (!plan) {
                        return {
                            error: `План с id '${planId}' не найден.`,
                        };
                    }

                    return formatPlanResponse(plan);
                }

                return {
                    error: `Неизвестное действие '${action}'. Используй: 'create', 'complete_step', 'get_status'.`,
                };
            },
        })
        .done();

    return builder.build();
};
