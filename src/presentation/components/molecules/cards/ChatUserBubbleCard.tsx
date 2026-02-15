import { Avatar } from "../../atoms";

type ChatUserBubbleCardProps = {
    content: string;
    timestamp: string;
};

export function ChatUserBubbleCard({
    content,
    timestamp,
}: ChatUserBubbleCardProps) {
    return (
        <article className={`flex gap-3 justify-end`}>
            <Avatar label="YOU" tone="user" />
            <div
                className={`max-w-[72%] rounded-2xl px-4 py-3 text-sm leading-relaxed bg-main-500/20 text-main-100 ring-main-300/30`}
            >
                <p>{content}</p>
                <p className="mt-2 text-[11px] text-main-400">{timestamp}</p>
            </div>
            <Avatar label="YOU" tone="user" />
        </article>
    );
}
