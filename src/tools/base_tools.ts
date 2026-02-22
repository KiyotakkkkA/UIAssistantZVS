import { postOllamaJson } from "../services/api";
import { ToolsBuilder } from "../utils/ToolsBuilder";

const postToolRequest = async (
    endpoint: "web_search" | "web_fetch",
    payload: Record<string, unknown>,
) => {
    return postOllamaJson(endpoint, payload);
};

export const baseToolsPackage = () => {
    const builder = new ToolsBuilder();

    builder
        .addPackage({
            id: "base-tools",
            title: "Базовые инструменты",
            description:
                "Набор базовых инструментов для взаимодействия модели с внешней средой",
        })
        .addTool({
            name: "command_exec",
            description:
                "Выполняет shell-команду в указанной директории после подтверждения пользователем.",
            parameters: ToolsBuilder.objectSchema({
                properties: {
                    command: ToolsBuilder.stringParam(
                        "Shell-команда для выполнения",
                    ),
                    cwd: ToolsBuilder.stringParam(
                        "Рабочая директория выполнения (опционально)",
                    ),
                },
                required: ["command"],
            }),
            outputScheme: {
                type: "object",
                properties: {
                    stdout: { type: "string" },
                    stderr: { type: "string" },
                    code: { type: "number" },
                },
            },
            execute: async (args) => {
                const command =
                    typeof args.command === "string" ? args.command : "";
                const cwd = typeof args.cwd === "string" ? args.cwd : undefined;

                const api = window.appApi;

                if (!api?.shell.execShellCommand) {
                    throw new Error(
                        "Командное выполнение недоступно в текущей среде",
                    );
                }

                return await api.shell.execShellCommand(command, cwd);
            },
        })
        .addTool({
            name: "web_search",
            description: "Ищет информацию в интернете по текстовому запросу.",
            parameters: ToolsBuilder.objectSchema({
                properties: {
                    request: ToolsBuilder.stringParam("Поисковый запрос"),
                },
                required: ["request"],
            }),
            outputScheme: {
                type: "object",
                properties: {
                    result: { type: "string" },
                },
            },
            execute: async (args) => {
                const request =
                    typeof args.request === "string" ? args.request : "";

                return postToolRequest("web_search", { query: request });
            },
        })
        .addTool({
            name: "web_fetch",
            description: "Загружает содержимое веб-страницы по URL.",
            parameters: ToolsBuilder.objectSchema({
                properties: {
                    url: ToolsBuilder.stringParam("Абсолютный URL страницы"),
                },
                required: ["url"],
            }),
            outputScheme: {
                type: "object",
                properties: {
                    content: { type: "string" },
                },
            },
            execute: async (args) => {
                const url = typeof args.url === "string" ? args.url : "";

                return postToolRequest("web_fetch", { url });
            },
        })
        .done();

    return builder.build();
};
