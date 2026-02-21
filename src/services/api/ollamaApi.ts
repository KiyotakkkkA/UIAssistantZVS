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
