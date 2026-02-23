import { Config } from "../../config";
import { userProfileStore } from "../../stores/userProfileStore";
import type { ProxyHttpRequestPayload } from "../../types/ElectronApi";

export type OllamaCatalogModelDetails = {
    parent_model: string;
    format: string;
    family: string;
    families: string[] | null;
    parameter_size: string;
    quantization_level: string;
};

export type OllamaCatalogModel = {
    name: string;
    model: string;
    modified_at: string;
    size: number;
    digest: string;
    details: OllamaCatalogModelDetails;
};

export type OllamaCatalogResponse = {
    models: OllamaCatalogModel[];
};

type StreamRequestOptions<TChunk> = {
    signal?: AbortSignal;
    onChunk: (chunk: TChunk) => void;
};

const proxyHttpRequest = async ({
    url,
    method,
    headers,
    bodyText,
}: ProxyHttpRequestPayload): Promise<string> => {
    const api = window.appApi;

    if (api?.network?.proxyHttpRequest) {
        const result = await api.network.proxyHttpRequest({
            url,
            method,
            headers,
            bodyText,
        });

        if (!result.ok) {
            throw new Error(result.bodyText || result.statusText);
        }

        return result.bodyText;
    }

    const response = await fetch(url, {
        method,
        headers,
        ...(bodyText && method !== "GET" && method !== "HEAD"
            ? { body: bodyText }
            : {}),
    });

    const raw = await response.text();
    if (!response.ok) {
        throw new Error(raw || `Request failed with status ${response.status}`);
    }

    return raw;
};

export const createOllamaRequest = (endpoint: string) => {
    const ollamaToken = userProfileStore.userProfile.ollamaToken.trim();
    const normalizedEndpoint = endpoint.replace(/^\/+/, "");

    return {
        url: `${Config.OLLAMA_BASE_URL}/${normalizedEndpoint}`,
        init: {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...(ollamaToken && {
                    Authorization: `Bearer ${ollamaToken}`,
                }),
            },
        } satisfies RequestInit,
    };
};

export const postOllamaJson = async <TResponse = unknown>(
    endpoint: string,
    payload: Record<string, unknown>,
): Promise<TResponse> => {
    const request = createOllamaRequest(endpoint);

    const raw = await proxyHttpRequest({
        url: request.url,
        method: "POST",
        headers: request.init.headers as Record<string, string>,
        bodyText: JSON.stringify(payload),
    });

    return raw ? (JSON.parse(raw) as TResponse) : ({} as TResponse);
};

const parseStreamJsonLine = <TChunk>(line: string): TChunk | null => {
    const trimmed = line.trim();
    if (!trimmed) {
        return null;
    }

    const rawPayload = trimmed.startsWith("data:")
        ? trimmed.slice(5).trim()
        : trimmed;

    if (!rawPayload || rawPayload === "[DONE]") {
        return null;
    }

    return JSON.parse(rawPayload) as TChunk;
};

const emitChunksFromRaw = <TChunk>(
    raw: string,
    onChunk: (chunk: TChunk) => void,
) => {
    const lines = raw.split(/\r?\n/);

    for (const line of lines) {
        const parsed = parseStreamJsonLine<TChunk>(line);
        if (parsed) {
            onChunk(parsed);
        }
    }
};

export const postOllamaStream = async <TChunk = unknown>(
    endpoint: string,
    payload: Record<string, unknown>,
    options: StreamRequestOptions<TChunk>,
): Promise<void> => {
    const { signal, onChunk } = options;
    const request = createOllamaRequest(endpoint);
    const headers = request.init.headers as Record<string, string>;
    const bodyText = JSON.stringify(payload);

    if (signal?.aborted) {
        throw new DOMException("Request was aborted", "AbortError");
    }

    const api = window.appApi;
    if (api?.network?.proxyHttpRequest) {
        const raw = await proxyHttpRequest({
            url: request.url,
            method: "POST",
            headers,
            bodyText,
        });

        if (signal?.aborted) {
            throw new DOMException("Request was aborted", "AbortError");
        }

        emitChunksFromRaw(raw, onChunk);
        return;
    }

    const response = await fetch(request.url, {
        method: "POST",
        headers,
        body: bodyText,
        signal,
    });

    if (!response.ok) {
        const rawError = await response.text();
        throw new Error(
            rawError || `Request failed with status ${response.status}`,
        );
    }

    if (!response.body) {
        const raw = await response.text();
        emitChunksFromRaw(raw, onChunk);
        return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    let done = false;
    while (!done) {
        const readResult = await reader.read();
        done = readResult.done;
        const value = readResult.value;
        if (value) {
            buffer += decoder.decode(value, { stream: !done });
            const lines = buffer.split(/\r?\n/);
            buffer = lines.pop() ?? "";

            for (const line of lines) {
                const parsed = parseStreamJsonLine<TChunk>(line);
                if (parsed) {
                    onChunk(parsed);
                }
            }
        }
    }

    const tail = `${buffer}${decoder.decode()}`;
    const parsedTail = parseStreamJsonLine<TChunk>(tail);
    if (parsedTail) {
        onChunk(parsedTail);
    }
};

export const getOllamaModelsCatalog = async (): Promise<
    OllamaCatalogModel[]
> => {
    const raw = await proxyHttpRequest({
        url: "https://ollama.com/api/tags",
        method: "GET",
    });

    if (!raw) {
        return [];
    }

    const parsed = JSON.parse(raw) as OllamaCatalogResponse;
    if (!Array.isArray(parsed.models)) {
        return [];
    }

    return parsed.models;
};
