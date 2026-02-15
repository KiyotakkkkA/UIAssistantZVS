import type { ToolPackageDescriptor } from "../../../../utils/ToolsBuilder";
import { Accordeon } from "../../atoms";

type ToolPackageCardProps = {
    pkg: ToolPackageDescriptor;
};

export function ToolPackageCard({ pkg }: ToolPackageCardProps) {
    return (
        <article className="rounded-2xl bg-main-900/45 p-4">
            <div className="mb-4">
                <p className="text-base font-semibold text-main-100">
                    {pkg.title}
                </p>
                <p className="mt-1 text-xs text-main-400">{pkg.description}</p>
            </div>

            <div className="space-y-3">
                {pkg.tools.map((tool) => (
                    <Accordeon
                        key={`${pkg.id}_${tool.schema.function.name}`}
                        title={`Инструмент: ${tool.schema.function.name}`}
                        subtitle={
                            tool.schema.function.description || "Без описания"
                        }
                    >
                        <div className="mt-3 rounded-lg border border-main-700/60 bg-main-800/50 p-3">
                            <p className="mb-2 text-xs font-medium text-main-300">
                                Параметры
                            </p>
                            <pre className="overflow-auto text-[11px] leading-5 text-main-200 whitespace-pre-wrap break-all">
                                {JSON.stringify(
                                    tool.schema.function.parameters,
                                    null,
                                    2,
                                )}
                            </pre>
                        </div>
                    </Accordeon>
                ))}
            </div>
        </article>
    );
}
