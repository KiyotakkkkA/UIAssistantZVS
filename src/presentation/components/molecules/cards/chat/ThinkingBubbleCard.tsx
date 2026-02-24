import { Accordeon, Loader } from "../../../atoms";
import { Icon } from "@iconify/react";

type ThinkingBubbleCardProps = {
    content: string;
    isLoading?: boolean;
};

export function ThinkingBubbleCard({
    content,
    isLoading = false,
}: ThinkingBubbleCardProps) {
    return (
        <div className="w-full text-xs leading-relaxed text-main-200">
            <Accordeon
                title="Размышления"
                subtitle="Размышления ассистента в процессе генерации ответа"
                variant="thinking"
                compact
                titleIcon={
                    <span className="flex items-center gap-1.5">
                        <Icon
                            icon="mdi:head-lightbulb-outline"
                            width={14}
                            height={14}
                        />
                        {isLoading ? <Loader className="h-3 w-3" /> : null}
                    </span>
                }
            >
                <pre className="whitespace-pre-wrap wrap-break-word text-[11px] text-main-200">
                    {content}
                </pre>
            </Accordeon>
        </div>
    );
}
