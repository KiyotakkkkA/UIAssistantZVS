import { createOllamaRequest } from "../hooks/agents/adapters/ollamaAdapter";
import { ToolsBuilder } from "../utils/ToolsBuilder";

const postToolRequest = async (
    endpoint: "web_search" | "web_fetch",
    payload: Record<string, unknown>,
) => {
    const request = createOllamaRequest(endpoint);
    const response = await fetch(request.url, {
        ...request.init,
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
            execute: async (args) => {
                const url = typeof args.url === "string" ? args.url : "";

                return postToolRequest("web_fetch", { url });
            },
        })
        .done();

    return builder.build();
};
