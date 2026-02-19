import { useMutation } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { useChatParams } from "../useChatParams";
import { useToasts } from "../useToasts";
import { useUserProfile } from "../useUserProfile";
import type { ChatDriver } from "../../types/App";
import type { ChatDialog, ChatMessage } from "../../types/Chat";
import { createOllamaAdapter } from "./adapters/ollamaAdapter";
import type { ChatProviderAdapter } from "../../types/AIRequests";
import { chatsStore } from "../../stores/chatsStore";
import { toolsStore } from "../../stores/toolsStore";
import { projectsStore } from "../../stores/projectsStore";
import { commandExecApprovalService } from "../../services/commandExecApproval";
import { parseScenarioLaunchPayload } from "../../utils/scenarioLaunchEnvelope";
import {
    getSystemPrompt,
    getUserPrompt,
    getProjectPrompt,
} from "../../prompts/base";

const getTimeStamp = () =>
    new Date().toLocaleTimeString("ru-RU", {
        hour: "2-digit",
        minute: "2-digit",
    });

const createMessageId = () => `msg_${crypto.randomUUID().replace(/-/g, "")}`;

const getCommandRequestMeta = (args: Record<string, unknown>) => ({
    command: typeof args.command === "string" ? args.command : "",
    cwd: typeof args.cwd === "string" ? args.cwd : ".",
    isAdmin: false,
});

export function useChat() {
    const { chatDriver, ollamaModel, ollamaToken } = useChatParams();
    const { userProfile } = useUserProfile();
    const toasts = useToasts();

    const [isAwaitingFirstChunk, setIsAwaitingFirstChunk] = useState(false);
    const [isStreaming, setIsStreaming] = useState(false);
    const messages = chatsStore.messages;
    const visibleMessages = useMemo(
        () =>
            messages.filter(
                (message) => message.author !== "system" && !message.hidden,
            ),
        [messages],
    );
    const messagesRef = useRef<ChatMessage[]>(messages);
    const activeDialogRef = useRef<ChatDialog | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);
    const cancellationRequestedRef = useRef(false);

    const providers = useMemo<
        Partial<Record<Exclude<ChatDriver, "">, ChatProviderAdapter>>
    >(
        () => ({
            ollama: createOllamaAdapter({
                model: ollamaModel,
            }),
        }),
        [ollamaModel],
    );

    const commitMessages = (nextMessages: ChatMessage[]) => {
        messagesRef.current = nextMessages;
        chatsStore.setMessages(nextMessages);
    };

    const updateMessages = (
        updater: (prev: ChatMessage[]) => ChatMessage[],
    ) => {
        const next = updater(messagesRef.current);
        messagesRef.current = next;
        chatsStore.setMessages(next);
    };

    const ensureDialog = (): ChatDialog => {
        if (chatsStore.activeDialog) {
            activeDialogRef.current = chatsStore.activeDialog;
            return chatsStore.activeDialog;
        }

        if (activeDialogRef.current) {
            return activeDialogRef.current;
        }

        const now = new Date().toISOString();
        const fallbackDialog: ChatDialog = {
            id: `dialog_${crypto.randomUUID().replace(/-/g, "")}`,
            title: "Новый диалог",
            forProjectId: null,
            messages: messagesRef.current,
            createdAt: now,
            updatedAt: now,
        };

        activeDialogRef.current = fallbackDialog;
        chatsStore.replaceByDialog(fallbackDialog);
        return fallbackDialog;
    };

    useEffect(() => {
        chatsStore.initialize();
    }, []);

    messagesRef.current = chatsStore.messages;
    activeDialogRef.current = chatsStore.activeDialog;

    const sendMessageMutation = useMutation({
        mutationFn: async (rawContent: string) => {
            const isHiddenQa = rawContent.startsWith("__qa_hidden__");
            const content = isHiddenQa
                ? rawContent.slice("__qa_hidden__".length).trim()
                : rawContent.trim();
            const scenarioLaunchPayload = parseScenarioLaunchPayload(content);
            const userVisibleContent =
                scenarioLaunchPayload?.displayMessage || content;

            if (!userVisibleContent) {
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
                id: createMessageId(),
                author: "user",
                content: userVisibleContent,
                timestamp: getTimeStamp(),
                ...(isHiddenQa ? { hidden: true } : {}),
            };

            const assistantTimestamp = getTimeStamp();
            const assistantMessageId = createMessageId();

            const currentDialog = ensureDialog();

            const requestBaseHistory = [...messagesRef.current];
            const isFirstDialogMessage = requestBaseHistory.length === 0;
            const requiredToolsInstruction =
                toolsStore.requiredPromptInstruction;
            const activeProject = projectsStore.activeProject;
            const shouldAttachProjectPrompt =
                activeProject?.dialogId === currentDialog.id;

            const initialSystemMessages: ChatMessage[] = isFirstDialogMessage
                ? [
                      {
                          id: createMessageId(),
                          author: "system",
                          content: getSystemPrompt(userProfile.assistantName),
                          timestamp: getTimeStamp(),
                      },
                      {
                          id: createMessageId(),
                          author: "system",
                          content: getUserPrompt(
                              userProfile.userName,
                              userProfile.userPrompt,
                              userProfile.userLanguage,
                          ),
                          timestamp: getTimeStamp(),
                      },
                      ...(shouldAttachProjectPrompt
                          ? [
                                {
                                    id: createMessageId(),
                                    author: "system" as const,
                                    content: getProjectPrompt(
                                        activeProject.name,
                                        activeProject.description,
                                        activeProject.directoryPath,
                                    ),
                                    timestamp: getTimeStamp(),
                                },
                            ]
                          : []),
                  ]
                : [];

            const historyForStorage = [
                ...initialSystemMessages,
                ...requestBaseHistory,
                ...(scenarioLaunchPayload
                    ? [
                          {
                              id: createMessageId(),
                              author: "system" as const,
                              content: [
                                  `SCENARIO_LAUNCH: ${scenarioLaunchPayload.scenarioName}`,
                                  scenarioLaunchPayload.scenarioFlow,
                                  "Instruction: execute scenario flow strictly by graph links. If data is missing, ask one clear question via qa_tool or plain assistant question.",
                              ].join("\n\n"),
                              timestamp: getTimeStamp(),
                          },
                      ]
                    : []),
                userMessage,
            ];
            const requestConstraintMessages: ChatMessage[] =
                requiredToolsInstruction
                    ? [
                          {
                              id: createMessageId(),
                              author: "system",
                              content: requiredToolsInstruction,
                              timestamp: getTimeStamp(),
                          },
                      ]
                    : [];

            const historyForRequest = [
                ...historyForStorage,
                ...requestConstraintMessages,
            ];
            const answerMessage: ChatMessage = {
                id: assistantMessageId,
                author: "assistant",
                content: "",
                timestamp: assistantTimestamp,
                assistantStage: "answer",
                answeringAt: userMessage.id,
            };

            commitMessages([...historyForStorage, answerMessage]);
            setIsStreaming(true);
            setIsAwaitingFirstChunk(true);
            cancellationRequestedRef.current = false;
            const abortController = new AbortController();
            abortControllerRef.current = abortController;
            const toolTraceMessageIds = new Map<string, string>();
            let thinkingMessageId: string | null = null;

            let hasFirstChunk = false;

            try {
                await adapter.send({
                    history: historyForRequest,
                    tools: toolsStore.toolDefinitions,
                    maxToolCalls:
                        userProfile.maxToolCallsPerResponse > 0
                            ? userProfile.maxToolCallsPerResponse
                            : 1,
                    executeTool: async (toolName, args, meta) => {
                        if (toolName !== "command_exec") {
                            return await toolsStore.executeTool(
                                toolName,
                                args,
                                {
                                    ollamaToken: ollamaToken,
                                },
                            );
                        }

                        const messageId = toolTraceMessageIds.get(meta.callId);
                        const { command, cwd, isAdmin } =
                            getCommandRequestMeta(args);

                        if (!messageId) {
                            return {
                                status: "cancelled",
                                command,
                                cwd,
                                isAdmin,
                                reason: "Не найдена карточка подтверждения",
                            };
                        }

                        const approved =
                            await commandExecApprovalService.waitForDecision(
                                messageId,
                            );

                        updateMessages((prev) =>
                            prev.map((message) =>
                                message.id === messageId && message.toolTrace
                                    ? {
                                          ...message,
                                          toolTrace: {
                                              ...message.toolTrace,
                                              status: approved
                                                  ? "accepted"
                                                  : "cancelled",
                                          },
                                      }
                                    : message,
                            ),
                        );

                        if (!approved) {
                            return {
                                status: "cancelled",
                                command,
                                cwd,
                                isAdmin,
                                reason: "Пользователь отклонил выполнение",
                            };
                        }

                        return await toolsStore.executeTool(toolName, args, {
                            ollamaToken: ollamaToken,
                        });
                    },
                    onToolCall: ({ callId, toolName, args }) => {
                        const messageId = createMessageId();
                        toolTraceMessageIds.set(callId, messageId);
                        const commandMeta =
                            toolName === "command_exec"
                                ? getCommandRequestMeta(args)
                                : null;

                        updateMessages((prev) => [
                            ...prev,
                            {
                                id: messageId,
                                author: "assistant",
                                assistantStage: "tool",
                                answeringAt: userMessage.id,
                                toolTrace: {
                                    callId,
                                    toolName,
                                    args,
                                    result: null,
                                    ...(toolName === "command_exec"
                                        ? {
                                              status: "pending" as const,
                                              command: commandMeta?.command,
                                              cwd: commandMeta?.cwd,
                                              isAdmin: commandMeta?.isAdmin,
                                          }
                                        : {}),
                                },
                                content: "",
                                timestamp: getTimeStamp(),
                            },
                        ]);
                    },
                    onToolResult: ({ callId, toolName, args, result }) => {
                        const messageId = toolTraceMessageIds.get(callId);

                        updateMessages((prev) => {
                            if (!messageId) {
                                return [
                                    ...prev,
                                    {
                                        id: createMessageId(),
                                        author: "assistant",
                                        assistantStage: "tool",
                                        answeringAt: userMessage.id,
                                        toolTrace: {
                                            callId,
                                            toolName,
                                            args,
                                            result,
                                            status:
                                                toolName === "command_exec"
                                                    ? "cancelled"
                                                    : "accepted",
                                            ...(toolName === "command_exec"
                                                ? getCommandRequestMeta(args)
                                                : {}),
                                        },
                                        content: "",
                                        timestamp: getTimeStamp(),
                                    },
                                ];
                            }

                            return prev.map((message) =>
                                message.id === messageId
                                    ? {
                                          ...message,
                                          toolTrace: {
                                              callId,
                                              toolName,
                                              args,
                                              result,
                                              status:
                                                  message.toolTrace?.status ||
                                                  (toolName === "command_exec"
                                                      ? "cancelled"
                                                      : "accepted"),
                                              ...(toolName === "command_exec"
                                                  ? getCommandRequestMeta(args)
                                                  : {}),
                                          },
                                          content: "",
                                      }
                                    : message,
                            );
                        });
                    },
                    onThinkingChunk: (chunkText, done) => {
                        if (!chunkText) {
                            if (done && thinkingMessageId) {
                                thinkingMessageId = null;
                            }
                            return;
                        }

                        if (!thinkingMessageId) {
                            thinkingMessageId = createMessageId();

                            updateMessages((prev) => [
                                ...prev,
                                {
                                    id: thinkingMessageId as string,
                                    author: "assistant",
                                    assistantStage: "thinking",
                                    answeringAt: userMessage.id,
                                    content: chunkText,
                                    timestamp: getTimeStamp(),
                                },
                            ]);

                            return;
                        }

                        updateMessages((prev) =>
                            prev.map((message) =>
                                message.id === thinkingMessageId
                                    ? {
                                          ...message,
                                          content: `${message.content}${chunkText}`,
                                      }
                                    : message,
                            ),
                        );

                        if (done) {
                            thinkingMessageId = null;
                        }
                    },
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
                            const assistantIndex = prev.findIndex(
                                (message) => message.id === assistantMessageId,
                            );

                            if (assistantIndex === -1) {
                                return [
                                    ...prev,
                                    {
                                        id: assistantMessageId,
                                        author: "assistant",
                                        assistantStage: "answer",
                                        answeringAt: userMessage.id,
                                        content: chunkText,
                                        timestamp: assistantTimestamp,
                                    },
                                ];
                            }

                            const updated = [...prev];
                            updated[assistantIndex] = {
                                ...updated[assistantIndex],
                                content: `${updated[assistantIndex].content}${chunkText}`,
                            };

                            return updated;
                        });
                    },
                });

                const snapshot: ChatDialog = {
                    ...currentDialog,
                    messages: messagesRef.current,
                    updatedAt: new Date().toISOString(),
                };

                const savedDialog = await chatsStore.saveSnapshot(snapshot);
                activeDialogRef.current = savedDialog;
                commitMessages(savedDialog.messages);
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
                    const assistantIndex = prev.findIndex(
                        (message) => message.id === assistantMessageId,
                    );

                    if (assistantIndex === -1) {
                        return [
                            ...prev,
                            {
                                id: assistantMessageId,
                                author: "assistant",
                                assistantStage: "answer",
                                answeringAt: userMessage.id,
                                content: `Ошибка: ${errorMessage}`,
                                timestamp: assistantTimestamp,
                            },
                        ];
                    }

                    const updated = [...prev];
                    updated[assistantIndex] = {
                        ...updated[assistantIndex],
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
        messages: visibleMessages,
        sendMessage: sendMessageMutation.mutate,
        cancelGeneration,
        isStreaming,
        isAwaitingFirstChunk,
    };
}
