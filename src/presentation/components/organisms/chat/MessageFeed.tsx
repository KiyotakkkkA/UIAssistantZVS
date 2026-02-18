import { useEffect, useRef } from "react";
import { Avatar, Button, Loader, Modal } from "../../atoms";
import {
    ChatUserBubbleCard,
    ThinkingBubbleCard,
    ToolBubbleCard,
} from "../../molecules/cards/chat";
import { MarkdownStaticContent } from "../../molecules/render";
import type { ChatMessage } from "../../../../types/Chat";
import { useMessages } from "../../../../hooks";

interface MessageFeedProps {
    messages: ChatMessage[];
    sendMessage: (content: string) => void;
    showLoader?: boolean;
}

function AssistantResponseBlock({
    stages,
    onApproveCommandExec,
    onRejectCommandExec,
}: {
    stages: ChatMessage[];
    onApproveCommandExec: (messageId: string) => void;
    onRejectCommandExec: (messageId: string) => void;
}) {
    const thinkingStages = stages.filter(
        (message) => message.assistantStage === "thinking",
    );
    const toolStages = stages.filter(
        (message) => message.assistantStage === "tool",
    );
    const answerStage = [...stages]
        .reverse()
        .find((message) => message.assistantStage === "answer");

    if (!thinkingStages.length && !toolStages.length && !answerStage) {
        return null;
    }

    return (
        <article className="flex gap-3 justify-start">
            <Avatar label="AI" tone="assistant" />
            <div className="w-full max-w-[72%] space-y-3 rounded-2xl px-4 py-3 text-sm leading-relaxed text-main-100">
                {thinkingStages.length > 0 && (
                    <ThinkingBubbleCard
                        content={thinkingStages
                            .map((message) => message.content)
                            .join("\n")}
                    />
                )}
                {toolStages.map((message) => (
                    <ToolBubbleCard
                        key={message.id}
                        messageId={message.id}
                        content={message.content}
                        toolTrace={message.toolTrace}
                        onApproveCommandExec={onApproveCommandExec}
                        onRejectCommandExec={onRejectCommandExec}
                    />
                ))}
                {answerStage && (
                    <div>
                        <MarkdownStaticContent content={answerStage.content} />
                        <p className="mt-2 text-[11px] text-main-400">
                            {answerStage.timestamp}
                        </p>
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
}: MessageFeedProps) {
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const previousLastMessageIdRef = useRef<string | null>(null);
    const scrollContainerRef = useRef<HTMLElement | null>(null);
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
                            const linkedStages = messages.filter(
                                (candidate) =>
                                    candidate.author === "assistant" &&
                                    candidate.answeringAt === message.id,
                            );

                            linkedStages.forEach((item) =>
                                consumedMessageIds.add(item.id),
                            );

                            return (
                                <div key={message.id} className="space-y-3">
                                    <ChatUserBubbleCard
                                        messageId={message.id}
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

                                    {linkedStages.length > 0 && (
                                        <AssistantResponseBlock
                                            stages={linkedStages}
                                            onApproveCommandExec={
                                                approveCommandExec
                                            }
                                            onRejectCommandExec={
                                                rejectCommandExec
                                            }
                                        />
                                    )}
                                </div>
                            );
                        }

                        if (
                            message.author === "assistant" &&
                            !message.answeringAt
                        ) {
                            return (
                                <div key={message.id}>
                                    <AssistantResponseBlock
                                        stages={[message]}
                                        onApproveCommandExec={
                                            approveCommandExec
                                        }
                                        onRejectCommandExec={rejectCommandExec}
                                    />
                                </div>
                            );
                        }

                        return null;
                    });
                })()}
                {showLoader && (
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
