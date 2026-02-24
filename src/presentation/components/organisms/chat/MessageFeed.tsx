import { useEffect, useMemo, useRef } from "react";
import { Avatar, Button, Loader, Modal } from "../../atoms";
import {
    ChatUserBubbleCard,
    QaToolBubbleCard,
    ThinkingBubbleCard,
    ToolBubbleCard,
} from "../../molecules/cards/chat";
import { MarkdownStaticContent } from "../../molecules/render";
import type { AssistantStage, ChatMessage } from "../../../../types/Chat";
import { useMessages } from "../../../../hooks";

interface MessageFeedProps {
    messages: ChatMessage[];
    sendMessage: (content: string) => void;
    showLoader?: boolean;
    activeStage?: AssistantStage | null;
    activeResponseToId?: string | null;
}

type AssistantStageBlock = {
    stage: "thinking" | "tool" | "answer";
    messages: ChatMessage[];
};

const buildAssistantStageBlocks = (
    stages: ChatMessage[],
): AssistantStageBlock[] => {
    return stages.reduce<AssistantStageBlock[]>((accumulator, message) => {
        const stage = (message.assistantStage || "answer") as
            | "thinking"
            | "tool"
            | "answer";
        const lastBlock = accumulator[accumulator.length - 1];

        if (!lastBlock || lastBlock.stage !== stage) {
            accumulator.push({ stage, messages: [message] });
            return accumulator;
        }

        lastBlock.messages.push(message);
        return accumulator;
    }, []);
};

function AssistantResponseBlock({
    stages,
    sendQaAnswer,
    onApproveCommandExec,
    onRejectCommandExec,
    activeStage,
    isActive,
}: {
    stages: ChatMessage[];
    sendQaAnswer: (qaMessageId: string, answer: string) => void;
    onApproveCommandExec: (messageId: string) => void;
    onRejectCommandExec: (messageId: string) => void;
    activeStage?: AssistantStage | null;
    isActive?: boolean;
}) {
    const stageBlocks = buildAssistantStageBlocks(stages);
    const normalizedActiveStage = isActive && activeStage ? activeStage : null;

    const activeBlockIndex =
        normalizedActiveStage === null
            ? -1
            : stageBlocks
                  .map((block) => block.stage)
                  .lastIndexOf(normalizedActiveStage);

    const hasActiveBlock = activeBlockIndex !== -1;

    const stageLoaderTitles: Record<AssistantStage, string> = {
        thinking: "Думаю...",
        tool: "Вызываю инструменты...",
        answer: "Генерирую ответ...",
    };

    if (!stageBlocks.length && !normalizedActiveStage) {
        return null;
    }

    return (
        <article className="flex gap-3 justify-start">
            <Avatar label="AI" tone="assistant" />
            <div className="w-full max-w-[72%] space-y-3 rounded-2xl px-4 py-3 text-sm leading-relaxed text-main-100">
                {stageBlocks.map((block, blockIndex) => {
                    if (block.stage === "thinking") {
                        return (
                            <ThinkingBubbleCard
                                key={`thinking_${blockIndex}`}
                                content={block.messages
                                    .map((message) => message.content)
                                    .join("\n")}
                                isLoading={
                                    normalizedActiveStage === "thinking" &&
                                    activeBlockIndex === blockIndex
                                }
                            />
                        );
                    }

                    if (block.stage === "tool") {
                        const isToolBlockLoading =
                            normalizedActiveStage === "tool" &&
                            activeBlockIndex === blockIndex;

                        return block.messages.map((message, toolIndex) =>
                            message.toolTrace?.toolName === "qa_tool" ? (
                                <QaToolBubbleCard
                                    key={message.id}
                                    toolTrace={message.toolTrace}
                                    answered={
                                        message.toolTrace?.status === "answered"
                                    }
                                    onSendAnswer={(answer) =>
                                        sendQaAnswer(message.id, answer)
                                    }
                                />
                            ) : (
                                <ToolBubbleCard
                                    key={message.id}
                                    content={message.content}
                                    toolTrace={message.toolTrace}
                                    onApproveCommandExec={() =>
                                        onApproveCommandExec(message.id)
                                    }
                                    onRejectCommandExec={() =>
                                        onRejectCommandExec(message.id)
                                    }
                                    isLoading={
                                        isToolBlockLoading &&
                                        toolIndex === block.messages.length - 1
                                    }
                                />
                            ),
                        );
                    }

                    const combinedAnswer = block.messages
                        .map((message) => message.content)
                        .join("");
                    const answerTimestamp =
                        block.messages[block.messages.length - 1]?.timestamp;

                    return (
                        <div key={`answer_${blockIndex}`}>
                            <MarkdownStaticContent content={combinedAnswer} />
                            {normalizedActiveStage === "answer" &&
                                activeBlockIndex === blockIndex && (
                                    <div className="mt-2 flex items-center gap-2 text-[11px] text-main-400">
                                        <Loader className="h-3.5 w-3.5" />
                                        <span>Генерирую ответ...</span>
                                    </div>
                                )}
                            <p className="mt-2 text-[11px] text-main-400">
                                {answerTimestamp}
                            </p>
                        </div>
                    );
                })}
                {normalizedActiveStage && !hasActiveBlock && (
                    <div className="flex items-center gap-2 rounded-xl border border-main-700/60 bg-main-900/50 px-3 py-2 text-xs text-main-300">
                        <Loader className="h-3.5 w-3.5" />
                        <span>{stageLoaderTitles[normalizedActiveStage]}</span>
                    </div>
                )}
            </div>
        </article>
    );
}

export function MessageFeed({
    messages,
    sendMessage,
    showLoader = false,
    activeStage = null,
    activeResponseToId = null,
}: MessageFeedProps) {
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const previousLastMessageIdRef = useRef<string | null>(null);
    const scrollContainerRef = useRef<HTMLElement | null>(null);
    const linkedStagesByUserId = useMemo(() => {
        const userMessageIds = new Set(
            messages
                .filter((message) => message.author === "user")
                .map((message) => message.id),
        );
        const grouped = new Map<string, ChatMessage[]>();

        messages.forEach((message) => {
            if (
                message.author !== "assistant" ||
                !message.answeringAt ||
                !userMessageIds.has(message.answeringAt)
            ) {
                return;
            }

            const linkedStages = grouped.get(message.answeringAt) || [];
            linkedStages.push(message);
            grouped.set(message.answeringAt, linkedStages);
        });

        return grouped;
    }, [messages]);
    const {
        editingMessageId,
        editingValue,
        setEditingValue,
        startEdit,
        cancelEdit,
        submitEdit,
        retryMessage,
        copyMessage,
        deleteMessageId,
        requestDeleteMessage,
        cancelDeleteMessage,
        confirmDeleteMessage,
        approveCommandExec,
        rejectCommandExec,
        sendQaAnswer,
    } = useMessages({ sendMessage });

    useEffect(() => {
        const lastMessage = messages[messages.length - 1];

        if (!lastMessage) {
            previousLastMessageIdRef.current = null;
            return;
        }

        const previousLastMessageId = previousLastMessageIdRef.current;
        const isNewLastMessage = previousLastMessageId !== lastMessage.id;
        const shouldSmoothScroll =
            previousLastMessageId !== null &&
            isNewLastMessage &&
            lastMessage.author === "user";

        if (shouldSmoothScroll) {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }

        previousLastMessageIdRef.current = lastMessage.id;
    }, [messages]);

    return (
        <>
            <section
                ref={scrollContainerRef}
                className="flex-1 space-y-4 overflow-y-auto rounded-2xl bg-main-900/55 p-2 ring-main-300/15"
            >
                {(() => {
                    const consumedMessageIds = new Set<string>();

                    return messages.map((message) => {
                        if (consumedMessageIds.has(message.id)) {
                            return null;
                        }

                        if (message.author === "user") {
                            const linkedStages =
                                linkedStagesByUserId.get(message.id) || [];
                            const isActiveResponse =
                                activeResponseToId === message.id;

                            linkedStages.forEach((item) =>
                                consumedMessageIds.add(item.id),
                            );

                            return (
                                <div key={message.id} className="space-y-3">
                                    <ChatUserBubbleCard
                                        content={message.content}
                                        timestamp={message.timestamp}
                                        isEditing={
                                            editingMessageId === message.id
                                        }
                                        editValue={
                                            editingMessageId === message.id
                                                ? editingValue
                                                : message.content
                                        }
                                        onEditValueChange={setEditingValue}
                                        onEditConfirm={() => {
                                            void submitEdit();
                                        }}
                                        onEditCancel={cancelEdit}
                                        msgDelete={() =>
                                            requestDeleteMessage(message.id)
                                        }
                                        msgEdit={() =>
                                            startEdit(
                                                message.id,
                                                message.content,
                                            )
                                        }
                                        msgCopy={() => {
                                            void copyMessage(message.content);
                                        }}
                                        msgRetry={() => {
                                            void retryMessage(
                                                message.id,
                                                message.content,
                                            );
                                        }}
                                    />

                                    {(linkedStages.length > 0 ||
                                        isActiveResponse) && (
                                        <AssistantResponseBlock
                                            stages={linkedStages}
                                            sendQaAnswer={sendQaAnswer}
                                            onApproveCommandExec={
                                                approveCommandExec
                                            }
                                            onRejectCommandExec={
                                                rejectCommandExec
                                            }
                                            activeStage={activeStage}
                                            isActive={isActiveResponse}
                                        />
                                    )}
                                </div>
                            );
                        }

                        if (
                            message.author === "assistant" &&
                            (!message.answeringAt ||
                                !messages.some(
                                    (m) => m.id === message.answeringAt,
                                ))
                        ) {
                            return (
                                <div key={message.id}>
                                    <AssistantResponseBlock
                                        stages={[message]}
                                        sendQaAnswer={sendQaAnswer}
                                        onApproveCommandExec={
                                            approveCommandExec
                                        }
                                        onRejectCommandExec={rejectCommandExec}
                                        activeStage={null}
                                        isActive={false}
                                    />
                                </div>
                            );
                        }

                        return null;
                    });
                })()}
                {showLoader && !activeResponseToId && (
                    <div className="flex items-center gap-2 px-2 text-sm text-main-400">
                        <Loader />
                        <span>Модель печатает...</span>
                    </div>
                )}
            </section>

            <Modal
                open={Boolean(deleteMessageId)}
                onClose={cancelDeleteMessage}
                title="Удаление сообщения"
                className="max-w-md"
                footer={
                    <>
                        <Button
                            variant="secondary"
                            shape="rounded-lg"
                            className="h-9 px-4"
                            onClick={cancelDeleteMessage}
                        >
                            Отмена
                        </Button>
                        <Button
                            variant="primary"
                            shape="rounded-lg"
                            className="h-9 px-4"
                            onClick={() => {
                                void confirmDeleteMessage();
                            }}
                        >
                            Удалить
                        </Button>
                    </>
                }
            >
                <p className="text-sm text-main-300">
                    Вы уверены, что хотите удалить это сообщение?
                </p>
            </Modal>
        </>
    );
}
