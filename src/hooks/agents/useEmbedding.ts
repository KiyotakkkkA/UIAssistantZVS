import { useCallback, useMemo } from "react";
import { useChatParams } from "../useChatParams";
import { useToasts } from "../useToasts";
import type { EmbeddingDriver } from "../../types/App";
import type { ChatProviderAdapter } from "../../types/AIRequests";
import { createOllamaAdapter } from "./adapters/ollamaAdapter";

export const useEmbedding = () => {
    const { userProfile } = useChatParams();
    const toasts = useToasts();
    const { embeddingDriver, ollamaEmbeddingModel, ollamaModel } = userProfile;

    const providers = useMemo<
        Partial<Record<Exclude<EmbeddingDriver, "">, ChatProviderAdapter>>
    >(
        () => ({
            ollama: createOllamaAdapter({ model: ollamaModel }),
        }),
        [ollamaModel],
    );

    const embed = useCallback(
        async (input: string | string[], modelOverride?: string) => {
            if (!embeddingDriver) {
                const description =
                    "Включите провайдер эмбеддингов в настройках интеграций.";
                toasts.danger({
                    title: "Провайдер эмбеддингов не выбран",
                    description,
                });
                throw new Error(description);
            }

            const adapter =
                providers[embeddingDriver as Exclude<EmbeddingDriver, "">];

            if (!adapter) {
                const description =
                    "Для выбранного провайдера эмбеддингов ещё не подключён адаптер.";
                toasts.danger({
                    title: "Провайдер эмбеддингов не поддерживается",
                    description,
                });
                throw new Error(description);
            }

            const normalizedModel =
                modelOverride?.trim() ||
                ollamaEmbeddingModel.trim() ||
                ollamaModel.trim();

            return adapter.embed({
                input,
                model: normalizedModel,
            });
        },
        [embeddingDriver, ollamaEmbeddingModel, ollamaModel, providers, toasts],
    );

    return {
        canEmbed: embeddingDriver !== "",
        embed,
    };
};
