import type { OllamaToolDefinition } from "../../../../types/Chat";

type ToolFunctionCardProps = {
    schema: OllamaToolDefinition;
};

export function ToolFunctionCard({ schema }: ToolFunctionCardProps) {
    return (
        <details className="rounded-xl border border-main-700/70 bg-main-900/60 p-3">
            <summary className="cursor-pointer list-none">
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <p className="text-sm font-semibold text-main-100">
                            {schema.function.name}
                        </p>
                        <p className="mt-1 text-xs text-main-400">
                            {schema.function.description || "Без описания"}
                        </p>
                    </div>
                    <span className="rounded-md bg-main-700/70 px-2 py-1 text-[10px] uppercase tracking-wide text-main-300">
                        function
                    </span>
                </div>
            </summary>

            <div className="mt-3 rounded-lg border border-main-700/60 bg-main-800/50 p-3">
                <p className="mb-2 text-xs font-medium text-main-300">Параметры</p>
                <pre className="overflow-auto text-[11px] leading-5 text-main-200 whitespace-pre-wrap break-all">
                    {JSON.stringify(schema.function.parameters, null, 2)}
                </pre>
            </div>
        </details>
    );
}
