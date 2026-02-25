import { Ollama, type ChatRequest } from "ollama";
import { Config } from "../../../src/config";
import type {
    OllamaChatChunk,
    OllamaRole,
    OllamaToolDefinition,
    OllamaMessage,
    OllamaResponseFormat,
} from "../../../src/types/Chat";

type StreamOllamaChatPayload = {
    model: string;
    messages: OllamaMessage[];
    tools?: OllamaToolDefinition[];
    format?: OllamaResponseFormat;
    think?: boolean;
};

type GetEmbedPayload = {
    model: string;
    input: string | string[];
};

export class OllamaService {
    private cachedHost = "";
    private cachedToken = "";
    private cachedClient: Ollama | null = null;

    private getClient(token: string): Ollama {
        const host = Config.OLLAMA_BASE_URL.trim();
        const normalizedToken = token.trim();

        if (
            this.cachedClient &&
            this.cachedHost === host &&
            this.cachedToken === normalizedToken
        ) {
            return this.cachedClient;
        }

        this.cachedHost = host;
        this.cachedToken = normalizedToken;
        this.cachedClient = new Ollama({
            host,
            ...(normalizedToken
                ? {
                      headers: {
                          Authorization: `Bearer ${normalizedToken}`,
                      },
                  }
                : {}),
        });

        return this.cachedClient;
    }

    async streamChat(
        payload: StreamOllamaChatPayload,
        token: string,
    ): Promise<OllamaChatChunk[]> {
        const client = this.getClient(token);
        const stream = await client.chat({
            model: payload.model,
            messages: payload.messages as ChatRequest["messages"],
            ...(payload.tools ? { tools: payload.tools } : {}),
            ...(payload.format ? { format: payload.format } : {}),
            ...(payload.think !== undefined ? { think: payload.think } : {}),
            stream: true,
        });

        const chunks: OllamaChatChunk[] = [];

        for await (const part of stream) {
            chunks.push({
                model: part.model,
                created_at:
                    part.created_at instanceof Date
                        ? part.created_at.toISOString()
                        : String(part.created_at),
                message: {
                    role: part.message.role as OllamaRole,
                    content: part.message.content,
                    thinking: part.message.thinking,
                    tool_calls: part.message.tool_calls,
                },
                done: part.done,
            });
        }

        return chunks;
    }

    async getEmbed(payload: GetEmbedPayload, token: string) {
        const client = this.getClient(token);
        const response = await client.embed({
            model: payload.model,
            input: payload.input,
        });

        const embeddingsSource = Array.isArray(response.embeddings)
            ? response.embeddings
            : [];
        const embeddings = embeddingsSource.map((vector) =>
            Array.isArray(vector) ? vector.map((value) => Number(value)) : [],
        );

        return {
            model: response.model,
            embeddings,
            ...(typeof response.total_duration === "number"
                ? { total_duration: response.total_duration }
                : {}),
            ...(typeof response.load_duration === "number"
                ? { load_duration: response.load_duration }
                : {}),
            ...(typeof response.prompt_eval_count === "number"
                ? { prompt_eval_count: response.prompt_eval_count }
                : {}),
        };
    }
}
