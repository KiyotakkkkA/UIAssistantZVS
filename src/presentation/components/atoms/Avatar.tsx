type AvatarProps = {
    label: string;
    tone?: "user" | "assistant";
};

export function Avatar({ label, tone = "assistant" }: AvatarProps) {
    const toneStyles =
        tone === "assistant"
            ? "bg-neutral-500/20 text-neutral-100 ring-neutral-300/30"
            : "bg-neutral-700/70 text-neutral-100 ring-neutral-400/30";

    return (
        <div
            className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ring-1 ${toneStyles}`}
            aria-hidden="true"
        >
            {label}
        </div>
    );
}
