import type { ToolPackageDescriptor } from "../../../../utils/ToolsBuilder";
import { ToolFunctionCard } from "./ToolFunctionCard";

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
                    <ToolFunctionCard
                        key={`${pkg.id}_${tool.schema.function.name}`}
                        schema={tool.schema}
                    />
                ))}
            </div>
        </article>
    );
}
