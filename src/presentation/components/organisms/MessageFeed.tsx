import { useEffect, useRef } from "react";
import type { ChatMessage } from "../../../types/Chat";
import { Loader } from "../atoms";
import { ChatBubble } from "../molecules";

interface MessageFeedProps {
    messages: ChatMessage[];
    showLoader?: boolean;
}

export function MessageFeed({
    messages,
    showLoader = false,
}: MessageFeedProps) {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef?.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    return (
        <>
            <section className="flex-1 space-y-4 overflow-y-auto rounded-2xl bg-neutral-900/55 p-2 ring-neutral-300/15">
                {messages.map((message, index) => (
                    <ChatBubble
                        key={`${message.timestamp}-${index}`}
                        {...message}
                    />
                ))}
                {showLoader && (
                    <div className="flex items-center gap-2 px-2 text-sm text-neutral-400">
                        <Loader />
                        <span>Модель печатает...</span>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </section>
        </>
    );
}
