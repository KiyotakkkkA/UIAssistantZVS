import { useMutation } from "@tanstack/react-query";
import { useMemo, useRef, useState } from "react";
import { useChatParams } from "../useChatParams";
import { useToasts } from "../useToasts";
import type { ChatDriver } from "../../types/App";
import type { ChatMessage } from "../../types/Chat";
import { createOllamaAdapter } from "./adapters/ollamaAdapter";
import type { ChatProviderAdapter } from "../../types/AIRequests";

const getTimeStamp = () =>
    new Date().toLocaleTimeString("ru-RU", {
        hour: "2-digit",
        minute: "2-digit",
    });

export function useChat() {
    const { chatDriver, ollamaModel, ollamaToken } = useChatParams();
    const toasts = useToasts();

    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isAwaitingFirstChunk, setIsAwaitingFirstChunk] = useState(false);
    const [isStreaming, setIsStreaming] = useState(false);
    const messagesRef = useRef<ChatMessage[]>(messages);
    const abortControllerRef = useRef<AbortController | null>(null);
    const cancellationRequestedRef = useRef(false);

    const providers = useMemo<
        Partial<Record<Exclude<ChatDriver, "">, ChatProviderAdapter>>
    >(
        () => ({
            ollama: createOllamaAdapter({
                model: ollamaModel,
                token: ollamaToken,
            }),
        }),
        [ollamaModel, ollamaToken],
    );

    const commitMessages = (nextMessages: ChatMessage[]) => {
        messagesRef.current = nextMessages;
        setMessages(nextMessages);
    };

    const updateMessages = (
        updater: (prev: ChatMessage[]) => ChatMessage[],
    ) => {
        setMessages((prev) => {
            const next = updater(prev);
            messagesRef.current = next;
            return next;
        });
    };

    const sendMessageMutation = useMutation({
        mutationFn: async (rawContent: string) => {
            const content = rawContent.trim();

            if (!content) {
                return;
            }

            if (!chatDriver) {
                toasts.danger({
                    title: "Провайдер не выбран",
                    description:
                        "Выберите провайдер в настройках чата перед отправкой сообщения.",
                });
                return;
            }

            const adapter = providers[chatDriver as Exclude<ChatDriver, "">];
            if (!adapter) {
                toasts.danger({
                    title: "Провайдер не поддерживается",
                    description:
                        "Для выбранного провайдера ещё не подключён адаптер.",
                });
                return;
            }

            const userMessage: ChatMessage = {
                author: "user",
                content,
                timestamp: getTimeStamp(),
            };

            const assistantTimestamp = getTimeStamp();
            const assistantMessage: ChatMessage = {
                author: "assistant",
                content: "",
                timestamp: assistantTimestamp,
            };

            const requestBaseHistory = [...messagesRef.current];
            const historyForRequest = [...requestBaseHistory, userMessage];
            const nextMessages = [...historyForRequest, assistantMessage];
            commitMessages(nextMessages);
            setIsStreaming(true);
            setIsAwaitingFirstChunk(true);
            cancellationRequestedRef.current = false;
            const abortController = new AbortController();
            abortControllerRef.current = abortController;

            let hasFirstChunk = false;

            try {
                await adapter.send({
                    history: historyForRequest,
                    signal: abortController.signal,
                    onChunk: (chunkText, done) => {
                        if (!chunkText) {
                            if (done) {
                                setIsAwaitingFirstChunk(false);
                            }
                            return;
                        }

                        if (!hasFirstChunk) {
                            hasFirstChunk = true;
                            setIsAwaitingFirstChunk(false);
                        }

                        updateMessages((prev) => {
                            const lastAssistantIndex = [...prev]
                                .reverse()
                                .findIndex(
                                    (message) =>
                                        message.author === "assistant" &&
                                        message.timestamp ===
                                            assistantTimestamp,
                                );

                            if (lastAssistantIndex === -1) {
                                return prev;
                            }

                            const actualIndex =
                                prev.length - 1 - lastAssistantIndex;
                            const updated = [...prev];
                            updated[actualIndex] = {
                                ...updated[actualIndex],
                                content: `${updated[actualIndex].content}${chunkText}`,
                            };

                            return updated;
                        });
                    },
                });
            } catch (error) {
                if (
                    cancellationRequestedRef.current &&
                    error instanceof Error &&
                    error.name === "AbortError"
                ) {
                    commitMessages(requestBaseHistory);
                    return;
                }

                const errorMessage =
                    error instanceof Error
                        ? error.message
                        : "Не удалось получить ответ модели";

                updateMessages((prev) => {
                    const lastAssistantIndex = [...prev]
                        .reverse()
                        .findIndex(
                            (message) =>
                                message.author === "assistant" &&
                                message.timestamp === assistantTimestamp,
                        );

                    if (lastAssistantIndex === -1) {
                        return prev;
                    }

                    const actualIndex = prev.length - 1 - lastAssistantIndex;
                    const updated = [...prev];
                    updated[actualIndex] = {
                        ...updated[actualIndex],
                        content: `Ошибка: ${errorMessage}`,
                    };

                    return updated;
                });
            } finally {
                abortControllerRef.current = null;
                cancellationRequestedRef.current = false;
                setIsAwaitingFirstChunk(false);
                setIsStreaming(false);
            }
        },
    });

    const cancelGeneration = () => {
        const controller = abortControllerRef.current;

        if (!controller) {
            return;
        }

        cancellationRequestedRef.current = true;
        controller.abort();
    };

    return {
        messages,
        sendMessage: sendMessageMutation.mutate,
        cancelGeneration,
        isStreaming,
        isAwaitingFirstChunk,
    };
}
