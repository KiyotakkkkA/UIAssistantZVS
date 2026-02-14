import { useMutation } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { Config } from "../config";
import api from "../services/api";
import { ChatMessage } from "../types/Chat";

const getTimeStamp = () =>
    new Date().toLocaleTimeString("ru-RU", {
        hour: "2-digit",
        minute: "2-digit",
    });

const toOllamaMessages = (messages: ChatMessage[]) =>
    messages.map((message) => ({
        role: message.author,
        content: message.content,
    }));

export function useOllamaChat() {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isAwaitingFirstChunk, setIsAwaitingFirstChunk] = useState(false);
    const [isStreaming, setIsStreaming] = useState(false);
    const messagesRef = useRef<ChatMessage[]>(messages);

    useEffect(() => {
        messagesRef.current = messages;
    }, [messages]);

    const sendMessageMutation = useMutation({
        mutationFn: async (rawContent: string) => {
            const content = rawContent.trim();

            if (!content) {
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

            const historyForRequest = toOllamaMessages([
                ...messagesRef.current,
                userMessage,
            ]);

            const nextMessages = [
                ...messagesRef.current,
                userMessage,
                assistantMessage,
            ];
            setMessages(nextMessages);
            messagesRef.current = nextMessages;
            setIsStreaming(true);
            setIsAwaitingFirstChunk(true);

            let hasFirstChunk = false;

            try {
                await api.streamChat({
                    model: Config.OLLAMA_MODEL,
                    messages: historyForRequest,
                    onChunk: (chunk) => {
                        const chunkContent = chunk.message?.content || "";

                        if (!chunkContent) {
                            if (chunk.done) {
                                setIsAwaitingFirstChunk(false);
                            }
                            return;
                        }

                        if (!hasFirstChunk) {
                            hasFirstChunk = true;
                            setIsAwaitingFirstChunk(false);
                        }

                        setMessages((prev) => {
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
                                content: `${updated[actualIndex].content}${chunkContent}`,
                            };

                            return updated;
                        });
                    },
                });
            } catch (error) {
                const errorMessage =
                    error instanceof Error
                        ? error.message
                        : "Не удалось получить ответ модели";

                setMessages((prev) => {
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
                setIsAwaitingFirstChunk(false);
                setIsStreaming(false);
            }
        },
    });

    return {
        messages,
        sendMessage: sendMessageMutation.mutate,
        isStreaming,
        isAwaitingFirstChunk,
    };
}
