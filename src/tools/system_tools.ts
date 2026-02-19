import { ToolsBuilder } from "../utils/ToolsBuilder";

export const systemToolsPackage = () => {
    const builder = new ToolsBuilder();

    builder
        .addPackage({
            id: "system-tools",
            title: "System Tools",
            description: "Системные инструменты",
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
        .done();

    return builder.build();
};
