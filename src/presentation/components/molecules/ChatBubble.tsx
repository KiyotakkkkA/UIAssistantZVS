import { Avatar } from "../atoms";

type ChatBubbleProps = {
    author: "assistant" | "user";
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
                className={`max-w-[72%] rounded-2xl px-4 py-3 text-sm leading-relaxed ring-1 ${
                    isAssistant
                        ? "bg-neutral-800/70 text-neutral-100 ring-neutral-300/20"
                        : "bg-neutral-500/20 text-neutral-100 ring-neutral-300/30"
                }`}
            >
                <p>{content}</p>
                <p className="mt-2 text-[11px] text-neutral-400">{timestamp}</p>
            </div>
            {!isAssistant && <Avatar label="YOU" tone="user" />}
        </article>
    );
}
