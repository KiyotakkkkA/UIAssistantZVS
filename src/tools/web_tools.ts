import { Config } from "../config";
import { ToolsBuilder } from "../utils/ToolsBuilder";

const postToolRequest = async (
    endpoint: "web_search" | "web_fetch",
    payload: Record<string, unknown>,
    ollamaToken: string,
) => {
    if (!ollamaToken.trim()) {
        throw new Error("Для вызова web tools требуется ollamaToken");
    }

    const ollamaBaseUrl = `${Config.OLLAMA_BASE_URL}`;

    const response = await fetch(`${ollamaBaseUrl}/${endpoint}`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${ollamaToken}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });

    const raw = await response.text();

    if (!response.ok) {
        throw new Error(
            raw || `Ollama tool request failed: ${response.status}`,
        );
    }

    return raw ? (JSON.parse(raw) as unknown) : {};
};

export const webToolsPackage = () => {
    const builder = new ToolsBuilder();

    builder
        .addPackage({
            id: "web",
            title: "Web Tools",
            description:
                "Поиск в интернете и получение содержимого страниц через Ollama API.",
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
            execute: async (args, context) => {
                const request =
                    typeof args.request === "string" ? args.request : "";

                return postToolRequest(
                    "web_search",
                    { query: request },
                    context.ollamaToken,
                );
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
            execute: async (args, context) => {
                const url = typeof args.url === "string" ? args.url : "";

                return postToolRequest(
                    "web_fetch",
                    { url },
                    context.ollamaToken,
                );
            },
        })
        .done();

    return builder.build();
};
