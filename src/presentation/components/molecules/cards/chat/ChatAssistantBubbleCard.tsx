import { Avatar } from "../../../atoms";
import { MarkdownStaticContent } from "./../../render";

type ChatAssistantBubbleCardProps = {
    content: string;
    timestamp: string;
};

export function ChatAssistantBubbleCard({
    content,
    timestamp,
}: ChatAssistantBubbleCardProps) {
    return (
        <article className={`flex gap-3 justify-start`}>
            <Avatar label="AI" tone="assistant" />
            <div
                className={`max-w-[72%] rounded-2xl px-4 py-3 text-sm leading-relaxed text-main-100`}
            >
                <MarkdownStaticContent content={content} />
                <p className="mt-2 text-[11px] text-main-400">{timestamp}</p>
            </div>
        </article>
    );
}
