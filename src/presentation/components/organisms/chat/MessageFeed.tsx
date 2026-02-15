import { useEffect, useRef } from "react";
import { Button, Loader, Modal } from "../../atoms";
import {
    ChatAssistantBubbleCard,
    ChatUserBubbleCard,
} from "../../molecules/cards";
import type { ChatMessage } from "../../../../types/Chat";
import { useMessages } from "../../../../hooks";

interface MessageFeedProps {
    messages: ChatMessage[];
    sendMessage: (content: string) => void;
    showLoader?: boolean;
}

export function MessageFeed({
    messages,
    sendMessage,
    showLoader = false,
}: MessageFeedProps) {
    const messagesEndRef = useRef<HTMLDivElement>(null);
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
    } = useMessages({ sendMessage });

    useEffect(() => {
        messagesEndRef?.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    return (
        <>
            <section className="flex-1 space-y-4 overflow-y-auto rounded-2xl bg-main-900/55 p-2 ring-main-300/15">
                {messages.map((message) => (
                    <div key={message.id}>
                        {message.author === "assistant" && (
                            <ChatAssistantBubbleCard
                                content={message.content}
                                timestamp={message.timestamp}
                            />
                        )}
                        {message.author === "user" && (
                            <ChatUserBubbleCard
                                messageId={message.id}
                                content={message.content}
                                timestamp={message.timestamp}
                                isEditing={editingMessageId === message.id}
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
                                    startEdit(message.id, message.content)
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
                        )}
                    </div>
                ))}
                {showLoader && (
                    <div className="flex items-center gap-2 px-2 text-sm text-main-400">
                        <Loader />
                        <span>Модель печатает...</span>
                    </div>
                )}
                <div ref={messagesEndRef} />
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
