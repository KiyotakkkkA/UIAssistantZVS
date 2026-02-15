import { Accordeon, Button } from "../../atoms";
import { ShikiCodeBlock } from "../render/ShikiCodeBlock";
import type { ToolTrace } from "../../../../types/Chat";

type ToolBubbleCardProps = {
    messageId: string;
    content: string;
    toolTrace?: ToolTrace;
    onApproveCommandExec?: (messageId: string) => void;
    onRejectCommandExec?: (messageId: string) => void;
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

export function ToolBubbleCard({
    messageId,
    content,
    toolTrace,
    onApproveCommandExec,
    onRejectCommandExec,
}: ToolBubbleCardProps) {
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

    const isCommandExec = payload.toolName === "command_exec";
    const execStatus = payload.status;
    const command = typeof payload.command === "string" ? payload.command : "";
    const cwd = typeof payload.cwd === "string" ? payload.cwd : ".";
    const isAdmin = payload.isAdmin === true;

    return (
        <div className="w-full text-xs leading-relaxed text-main-200">
            <Accordeon
                title={`Инструмент: ${payload.toolName || "unknown"}`}
                subtitle="Аргументы и результат вызова инструмента"
            >
                <div className="space-y-3">
                    {isCommandExec && (
                        <div className="space-y-2 rounded-xl border border-main-700/60 bg-main-900/40 p-3">
                            <p className="text-[11px] font-semibold text-main-300">
                                ЗАПРОС НА ВЫПОЛНЕНИЕ
                            </p>
                            <p className="text-[11px] text-main-300">
                                Директория: {cwd}
                            </p>
                            <p className="text-[11px] text-main-300">
                                Команда: {command || "(не указана)"}
                            </p>
                            <p className="text-[11px] text-main-300">
                                Права администратора: {isAdmin ? "да" : "нет"}
                            </p>

                            {execStatus === "pending" && (
                                <div className="flex items-center gap-2 pt-1">
                                    <Button
                                        variant="primary"
                                        shape="rounded-lg"
                                        className="h-8 px-3"
                                        onClick={() =>
                                            onApproveCommandExec?.(messageId)
                                        }
                                    >
                                        Подтвердить
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        shape="rounded-lg"
                                        className="h-8 px-3"
                                        onClick={() =>
                                            onRejectCommandExec?.(messageId)
                                        }
                                    >
                                        Отклонить
                                    </Button>
                                </div>
                            )}

                            {(execStatus === "accepted" ||
                                execStatus === "cancelled") && (
                                <p className="text-[11px] text-main-400">
                                    Статус: {execStatus}
                                </p>
                            )}
                        </div>
                    )}

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
