import { Accordeon } from "../../atoms";
import { ShikiCodeBlock } from "../render/ShikiCodeBlock";
import type { ToolTrace } from "../../../../types/Chat";

type ToolBubbleCardProps = {
    content: string;
    toolTrace?: ToolTrace;
};

type ToolTracePayload = Partial<ToolTrace>;

const parseToolTrace = (raw: string): ToolTracePayload | null => {
    try {
        const parsed = JSON.parse(raw) as ToolTracePayload;

        if (!parsed || typeof parsed !== "object") {
            return null;
        }

        return parsed;
    } catch {
        return null;
    }
};

export function ToolBubbleCard({ content, toolTrace }: ToolBubbleCardProps) {
    const payload = toolTrace ?? parseToolTrace(content);

    if (!payload) {
        return (
            <div className="w-full rounded-2xl border border-main-700/60 bg-main-900/60 px-4 py-3 text-xs leading-relaxed text-main-200">
                <pre className="whitespace-pre-wrap wrap-break-word">
                    {content}
                </pre>
            </div>
        );
    }

    return (
        <div className="w-full text-xs leading-relaxed text-main-200">
            <Accordeon
                title={`Инструмент: ${payload.toolName || "unknown"}`}
                subtitle="Аргументы и результат вызова инструмента"
            >
                <div className="space-y-3">
                    <div>
                        <p className="text-[11px] font-semibold text-main-300">
                            ВЫЗОВ
                        </p>
                        <ShikiCodeBlock
                            code={JSON.stringify(payload.args ?? {}, null, 2)}
                            language={"json"}
                        />
                    </div>
                    <div>
                        <p className="text-[11px] font-semibold text-main-300">
                            РЕЗУЛЬТАТ
                        </p>
                        <ShikiCodeBlock
                            code={JSON.stringify(payload.result ?? {}, null, 2)}
                            language={"json"}
                        />
                    </div>
                </div>
            </Accordeon>
        </div>
    );
}
