import { makeAutoObservable } from "mobx";
import { webToolsPackage } from "../tools";
import type { OllamaToolDefinition } from "../types/Chat";
import type { ToolPackageDescriptor } from "../utils/ToolsBuilder";

class ToolsStore {
    readonly packages: ToolPackageDescriptor[];

    constructor() {
        this.packages = [...webToolsPackage()];
        makeAutoObservable(this, {}, { autoBind: true });
    }

    get toolDefinitions(): OllamaToolDefinition[] {
        return this.packages.flatMap((pkg) =>
            pkg.tools.map((tool) => tool.schema),
        );
    }

    async executeTool(
        toolName: string,
        args: Record<string, unknown>,
        context: { ollamaToken: string },
    ): Promise<unknown> {
        const descriptor = this.packages
            .flatMap((pkg) => pkg.tools)
            .find((tool) => tool.schema.function.name === toolName);

        if (!descriptor) {
            throw new Error(`Tool ${toolName} не зарегистрирован`);
        }

        return descriptor.execute(args, context);
    }
}

export const toolsStore = new ToolsStore();
