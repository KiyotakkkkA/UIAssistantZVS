type ConversationItemProps = {
    title: string;
    preview: string;
    time: string;
    active?: boolean;
};

export function ConversationItem({
    title,
    preview,
    time,
    active = false,
}: ConversationItemProps) {
    return (
        <button
            type="button"
            className={`w-full rounded-xl p-3 text-left transition ${
                active
                    ? "bg-neutral-500/20"
                    : "bg-transparent ring-transparent hover:bg-neutral-800/70"
            }`}
        >
            <div className="flex items-center justify-between gap-2">
                <p className="truncate text-sm font-medium text-neutral-100">
                    {title}
                </p>
                <span className="text-xs text-neutral-400">{time}</span>
            </div>
            <p className="mt-1 truncate text-xs text-neutral-400">{preview}</p>
        </button>
    );
}
