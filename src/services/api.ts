import { Config } from "../config";
import type { OllamaChatChunk, StreamChatParams } from "../types/Chat";

const getOllamaChatUrl = () => {
    const baseUrl = Config.OLLAMA_BASE_URL.trim().replace(/\/+$/, "");
    return baseUrl.endsWith("/ollama")
        ? `${baseUrl}/chat`
        : `${baseUrl}/api/chat`;
};

class API {
    public async streamChatOllama({
        model,
        token,
        messages,
        signal,
        onChunk,
    }: StreamChatParams) {
        const response = await fetch(getOllamaChatUrl(), {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...(token && {
                    Authorization: `Bearer ${token}`,
                }),
            },
            body: JSON.stringify({
                model,
                messages,
                stream: true,
            }),
            signal,
        });

        if (!response.ok) {
            const body = await response.text();
            throw new Error(
                body || `Ollama request failed with status ${response.status}`,
            );
        }

        if (!response.body) {
            throw new Error("Streaming response body is not available");
        }

        const decoder = new TextDecoder();
        const reader = response.body.getReader();
        let buffer = "";

        let isReading = true;

        while (isReading) {
            const { done, value } = await reader.read();

            if (done) {
                isReading = false;
                continue;
            }

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
                const trimmed = line.trim();

                if (!trimmed) {
                    continue;
                }

                const chunk = JSON.parse(trimmed) as OllamaChatChunk;

                if (chunk.error) {
                    throw new Error(chunk.error);
                }

                onChunk?.(chunk);

                if (chunk.done) {
                    return;
                }
            }
        }

        const rest = buffer.trim();

        if (rest) {
            const chunk = JSON.parse(rest) as OllamaChatChunk;

            if (chunk.error) {
                throw new Error(chunk.error);
            }

            onChunk?.(chunk);
        }
    }
}

export default new API();
