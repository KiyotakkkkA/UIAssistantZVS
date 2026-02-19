import { makeAutoObservable } from "mobx";
import {
    baseToolsPackage,
    studyingToolsPackage,
    systemToolsPackage,
} from "../tools";
import type { OllamaToolDefinition } from "../types/Chat";
import type { ToolPackageDescriptor } from "../utils/ToolsBuilder";

class ToolsStore {
    readonly packages: ToolPackageDescriptor[];
    readonly systemPackages: ToolPackageDescriptor[];
    enabledToolNames = new Set<string>();
    requiredPromptToolNames = new Set<string>();

    constructor() {
        this.packages = [...baseToolsPackage(), ...studyingToolsPackage()];
        this.systemPackages = [...systemToolsPackage()];
        this.enabledToolNames = new Set(
            this.packages.flatMap((pkg) =>
                pkg.tools.map((tool) => tool.schema.function.name),
            ),
        );
        makeAutoObservable(this, {}, { autoBind: true });
    }

    get allTools() {
        return this.packages.flatMap((pkg) => pkg.tools);
    }

    get allToolOptions() {
        return this.allTools.map((tool) => ({
            value: tool.schema.function.name,
            label: tool.schema.function.name,
            description: tool.schema.function.description || "",
        }));
    }

    get enabledToolOptions() {
        const enabledSet = this.enabledToolNames;

        return this.allToolOptions.filter((option) =>
            enabledSet.has(option.value),
        );
    }

    get requiredPromptTools(): string[] {
        return Array.from(this.requiredPromptToolNames).filter((toolName) =>
            this.enabledToolNames.has(toolName),
        );
    }

    get requiredPromptInstruction(): string {
        const selected = this.requiredPromptTools;

        if (!selected.length) {
            return "";
        }

        return `You must use these tools while completing task: TOOLS - ${selected.join(", ")}`;
    }

    isToolEnabled(toolName: string): boolean {
        return this.enabledToolNames.has(toolName);
    }

    setToolEnabled(toolName: string, enabled: boolean): void {
        const knownTool = this.allTools.some(
            (tool) => tool.schema.function.name === toolName,
        );

        if (!knownTool) {
            return;
        }

        if (enabled) {
            this.enabledToolNames.add(toolName);
            return;
        }

        this.enabledToolNames.delete(toolName);
        this.requiredPromptToolNames.delete(toolName);
    }

    setRequiredPromptTools(toolNames: string[]): void {
        const knownEnabled = new Set(
            this.enabledToolOptions.map((item) => item.value),
        );
        this.requiredPromptToolNames = new Set(
            toolNames.filter((toolName) => knownEnabled.has(toolName)),
        );
    }

    get toolDefinitions(): OllamaToolDefinition[] {
        const userTools = this.allTools.filter((tool) =>
            this.enabledToolNames.has(tool.schema.function.name),
        );
        const systemTools = this.systemPackages.flatMap((pkg) => pkg.tools);

        return [...userTools, ...systemTools].map((tool) => tool.schema);
    }

    getFilteredPackages(query: string): ToolPackageDescriptor[] {
        const normalized = query.trim().toLowerCase();

        if (!normalized) {
            return this.packages;
        }

        return this.packages
            .map((pkg) => {
                const packageMatch =
                    pkg.title.toLowerCase().includes(normalized) ||
                    pkg.description.toLowerCase().includes(normalized);

                if (packageMatch) {
                    return pkg;
                }

                const tools = pkg.tools.filter((tool) => {
                    const toolName = tool.schema.function.name.toLowerCase();
                    const toolDescription =
                        tool.schema.function.description?.toLowerCase() || "";

                    return (
                        toolName.includes(normalized) ||
                        toolDescription.includes(normalized)
                    );
                });

                return {
                    ...pkg,
                    tools,
                };
            })
            .filter((pkg) => pkg.tools.length > 0);
    }

    private get activeTools() {
        const userTools = this.packages.flatMap((pkg) =>
            pkg.tools.filter((tool) =>
                this.enabledToolNames.has(tool.schema.function.name),
            ),
        );

        const systemTools = this.systemPackages.flatMap((pkg) => pkg.tools);

        return [...userTools, ...systemTools];
    }

    async executeTool(
        toolName: string,
        args: Record<string, unknown>,
        context: { ollamaToken: string },
    ): Promise<unknown> {
        const descriptor = this.activeTools.find(
            (tool) => tool.schema.function.name === toolName,
        );

        if (!descriptor) {
            throw new Error(`Tool ${toolName} не зарегистрирован`);
        }

        return descriptor.execute(args, context);
    }
}

export const toolsStore = new ToolsStore();
