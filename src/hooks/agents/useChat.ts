import { useMutation } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { useChatParams } from "../useChatParams";
import { useToasts } from "../useToasts";
import { useUserProfile } from "../useUserProfile";
import type { ChatDriver } from "../../types/App";
import type { AssistantStage, ChatDialog, ChatMessage } from "../../types/Chat";
import { createOllamaAdapter } from "./adapters/ollamaAdapter";
import type { ChatProviderAdapter } from "../../types/AIRequests";
import { chatsStore } from "../../stores/chatsStore";
import { toolsStore } from "../../stores/toolsStore";
import { projectsStore } from "../../stores/projectsStore";
import { commandExecApprovalService } from "../../services/commandExecApproval";
import { parseScenarioLaunchPayload } from "../../utils/scenarioLaunchEnvelope";
import {
    appendAssistantStageChunk,
    buildScenarioRuntimeEnvText,
    createMessageId,
    getCommandRequestMeta,
    getScenarioFormatHint,
    getTimeStamp,
    splitTextChunk,
} from "../../utils/chatStream";
import {
    getSystemPrompt,
    getUserPrompt,
    getProjectPrompt,
} from "../../prompts/base";

export function useChat() {
    const { chatDriver, ollamaModel, ollamaToken } = useChatParams();
    const { userProfile } = useUserProfile();
    const toasts = useToasts();

    const [isAwaitingFirstChunk, setIsAwaitingFirstChunk] = useState(false);
    const [isStreaming, setIsStreaming] = useState(false);
    const [activeStage, setActiveStage] = useState<AssistantStage | null>(null);
    const [activeResponseToId, setActiveResponseToId] = useState<string | null>(
        null,
    );
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
            const scenarioFormatHint = getScenarioFormatHint(
                scenarioLaunchPayload?.scenarioFlow,
            );
            const scenarioRuntimeEnvText = scenarioLaunchPayload
                ? buildScenarioRuntimeEnvText(
                      projectsStore.activeProject?.directoryPath,
                  )
                : "";
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
                                  scenarioRuntimeEnvText,
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
            const chunkQueue: Array<{
                stage: Extract<AssistantStage, "thinking" | "answer">;
                chunkText: string;
            }> = [];
            let queueDrainResolver: (() => void) | null = null;
            let flushFrameId: number | null = null;
            const flushChunkLimitPerFrame = 6;

            const resolveQueueDrain = () => {
                if (chunkQueue.length !== 0 || flushFrameId !== null) {
                    return;
                }

                if (queueDrainResolver) {
                    const resolve = queueDrainResolver;
                    queueDrainResolver = null;
                    resolve();
                }
            };

            const flushChunkQueue = () => {
                flushFrameId = null;

                if (chunkQueue.length === 0) {
                    resolveQueueDrain();
                    return;
                }

                const frameBatch = chunkQueue.splice(
                    0,
                    flushChunkLimitPerFrame,
                );

                updateMessages((prev) =>
                    frameBatch.reduce(
                        (accumulator, item) =>
                            appendAssistantStageChunk(
                                accumulator,
                                userMessage.id,
                                item.stage,
                                item.chunkText,
                            ),
                        prev,
                    ),
                );

                if (chunkQueue.length > 0) {
                    flushFrameId =
                        window.requestAnimationFrame(flushChunkQueue);
                    return;
                }

                resolveQueueDrain();
            };

            const flushChunkQueueImmediate = () => {
                if (flushFrameId !== null) {
                    window.cancelAnimationFrame(flushFrameId);
                    flushFrameId = null;
                }

                if (chunkQueue.length === 0) {
                    resolveQueueDrain();
                    return;
                }

                const immediateBatch = chunkQueue.splice(0, chunkQueue.length);

                updateMessages((prev) =>
                    immediateBatch.reduce(
                        (accumulator, item) =>
                            appendAssistantStageChunk(
                                accumulator,
                                userMessage.id,
                                item.stage,
                                item.chunkText,
                            ),
                        prev,
                    ),
                );

                resolveQueueDrain();
            };

            const scheduleChunkFlush = () => {
                if (flushFrameId !== null) {
                    return;
                }

                flushFrameId = window.requestAnimationFrame(flushChunkQueue);
            };

            const enqueueStageChunk = (
                stage: Extract<AssistantStage, "thinking" | "answer">,
                chunkText: string,
            ) => {
                if (!chunkText) {
                    return;
                }

                splitTextChunk(chunkText).forEach((chunkPart) => {
                    chunkQueue.push({ stage, chunkText: chunkPart });
                });

                scheduleChunkFlush();
            };

            const waitForChunkQueueDrain = async () => {
                if (chunkQueue.length === 0 && flushFrameId === null) {
                    return;
                }

                await new Promise<void>((resolve) => {
                    queueDrainResolver = resolve;
                });
            };

            const resetChunkQueue = () => {
                chunkQueue.length = 0;

                if (flushFrameId !== null) {
                    window.cancelAnimationFrame(flushFrameId);
                    flushFrameId = null;
                }

                resolveQueueDrain();
            };

            const setStreamStage = (stage: AssistantStage) => {
                setActiveStage((previous) =>
                    previous === stage ? previous : stage,
                );
            };

            commitMessages(historyForStorage);
            setIsStreaming(true);
            setIsAwaitingFirstChunk(true);
            setActiveResponseToId(userMessage.id);
            setActiveStage("thinking");
            cancellationRequestedRef.current = false;
            const abortController = new AbortController();
            abortControllerRef.current = abortController;
            const toolTraceMessageIds = new Map<string, string>();
            const isCurrentAnswerMessage = (message: ChatMessage) =>
                message.author === "assistant" &&
                message.assistantStage === "answer" &&
                message.answeringAt === userMessage.id;

            let hasFirstChunk = false;
            const markFirstActivity = () => {
                if (hasFirstChunk) {
                    return;
                }

                hasFirstChunk = true;
                setIsAwaitingFirstChunk(false);
            };

            try {
                await adapter.send({
                    history: historyForRequest,
                    tools: toolsStore.toolDefinitions,
                    ...(scenarioFormatHint
                        ? { format: scenarioFormatHint }
                        : {}),
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
                                    telegramId: userProfile.telegramId,
                                    telegramBotToken:
                                        userProfile.telegramBotToken,
                                    scenarioRuntimeEnv: {
                                        current_date: new Date().toISOString(),
                                        project_directory:
                                            projectsStore.activeProject
                                                ?.directoryPath ?? "",
                                    },
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
                            telegramId: userProfile.telegramId,
                            telegramBotToken: userProfile.telegramBotToken,
                            scenarioRuntimeEnv: {
                                current_date: new Date().toISOString(),
                                project_directory:
                                    projectsStore.activeProject
                                        ?.directoryPath ?? "",
                            },
                        });
                    },
                    onToolCall: ({ callId, toolName, args }) => {
                        flushChunkQueueImmediate();
                        setStreamStage("tool");
                        markFirstActivity();
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
                        flushChunkQueueImmediate();
                        setStreamStage("tool");
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
                    onThinkingChunk: (chunkText) => {
                        if (!chunkText) {
                            return;
                        }

                        setStreamStage("thinking");
                        markFirstActivity();
                        enqueueStageChunk("thinking", chunkText);
                    },
                    signal: abortController.signal,
                    onChunk: (chunkText, done) => {
                        if (!chunkText) {
                            if (done) {
                                setIsAwaitingFirstChunk(false);
                            }
                            return;
                        }

                        setStreamStage("answer");
                        markFirstActivity();

                        enqueueStageChunk("answer", chunkText);
                    },
                });

                await waitForChunkQueueDrain();

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
                    resetChunkQueue();
                    commitMessages(requestBaseHistory);
                    return;
                }

                await waitForChunkQueueDrain();

                const errorMessage =
                    error instanceof Error
                        ? error.message
                        : "Не удалось получить ответ модели";

                updateMessages((prev) => {
                    const lastMessage = prev[prev.length - 1];

                    if (!lastMessage || !isCurrentAnswerMessage(lastMessage)) {
                        return [
                            ...prev,
                            {
                                id: createMessageId(),
                                author: "assistant",
                                assistantStage: "answer",
                                answeringAt: userMessage.id,
                                content: `Ошибка: ${errorMessage}`,
                                timestamp: getTimeStamp(),
                            },
                        ];
                    }

                    const updatedLastMessage: ChatMessage = {
                        ...lastMessage,
                        content: `Ошибка: ${errorMessage}`,
                    };

                    return [...prev.slice(0, -1), updatedLastMessage];
                });
            } finally {
                resetChunkQueue();
                abortControllerRef.current = null;
                cancellationRequestedRef.current = false;
                setIsAwaitingFirstChunk(false);
                setIsStreaming(false);
                setActiveStage(null);
                setActiveResponseToId(null);
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
        activeStage,
        activeResponseToId,
    };
}
