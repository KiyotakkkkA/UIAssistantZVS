import { Accordeon } from "../../../atoms";

type ThinkingBubbleCardProps = {
    content: string;
};

export function ThinkingBubbleCard({ content }: ThinkingBubbleCardProps) {
    return (
        <div className="w-full text-xs leading-relaxed text-main-200">
            <Accordeon
                title="Размышления"
                subtitle="Размышления ассистента в процессе генерации ответа"
            >
                <pre className="whitespace-pre-wrap wrap-break-word text-[11px] text-main-200">
                    {content}
                </pre>
            </Accordeon>
        </div>
    );
}
