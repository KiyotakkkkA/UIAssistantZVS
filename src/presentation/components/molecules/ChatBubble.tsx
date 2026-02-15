import { Avatar } from "../atoms";
import { MarkdownStaticContent } from "./render";

import type { MessageRole } from "../../../types/Chat";

type ChatBubbleProps = {
    author: MessageRole;
    content: string;
    timestamp: string;
};

export function ChatBubble({ author, content, timestamp }: ChatBubbleProps) {
    const isAssistant = author === "assistant";

    return (
        <article
            className={`flex gap-3 ${isAssistant ? "justify-start" : "justify-end"}`}
        >
            {isAssistant && <Avatar label="AI" tone="assistant" />}
            <div
                className={`max-w-[72%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    isAssistant
                        ? " text-main-100"
                        : "bg-main-500/20 text-main-100 ring-main-300/30"
                }`}
            >
                {isAssistant ? (
                    <MarkdownStaticContent content={content} />
                ) : (
                    <p>{content}</p>
                )}
                <p className="mt-2 text-[11px] text-main-400">{timestamp}</p>
            </div>
            {!isAssistant && <Avatar label="YOU" tone="user" />}
        </article>
    );
}
