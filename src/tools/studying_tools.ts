import Config from "../config/Config";
import { fetchMireaScheduleByDate } from "./studying/studying_schedule_mirea_tool";
import { ToolsBuilder } from "../utils/ToolsBuilder";

export const studyingToolsPackage = () => {
    const builder = new ToolsBuilder();

    builder
        .addPackage({
            id: "studying-tools",
            title: "Studying Tools",
            description: "Инструменты для работы с учебным расписанием.",
        })
        .addTool({
            name: "schedule_mirea_tool",
            description:
                "Загружает и группирует расписание МИРЭА по дням из страницы с iCal-данными.",
            parameters: ToolsBuilder.objectSchema({
                properties: {
                    date_value: ToolsBuilder.stringParam(
                        "Дата в формате YYYY-MM-DD",
                    ),
                },
                required: ["date_value"],
            }),
            execute: async (args) => {
                const dateValue =
                    typeof args.date_value === "string"
                        ? args.date_value.trim()
                        : "";

                if (!/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
                    throw new Error(
                        "Parameter date_value must be in YYYY-MM-DD format",
                    );
                }

                return fetchMireaScheduleByDate(
                    `${Config.MIREA_BASE_URL}/?date=${dateValue}&s=1_778`,
                    dateValue,
                );
            },
        })
        .done();

    return builder.build();
};
