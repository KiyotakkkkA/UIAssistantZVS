import type { OllamaToolDefinition, ToolParameterSchema } from "../types/Chat";

export type ToolExecutionContext = {
    ollamaToken: string;
    telegramId: string;
    telegramBotToken: string;
};

export type ToolExecutor = (
    args: Record<string, unknown>,
    context: ToolExecutionContext,
) => Promise<unknown> | unknown;

export type ToolDescriptor = {
    packageId: string;
    packageTitle: string;
    packageDescription: string;
    schema: OllamaToolDefinition;
    execute: ToolExecutor;
};

export type ToolPackageDescriptor = {
    id: string;
    title: string;
    description: string;
    tools: ToolDescriptor[];
};

export class ToolsBuilder {
    private readonly packages: ToolPackageDescriptor[] = [];

    addPackage(config: { id: string; title: string; description: string }): {
        addTool: (tool: {
            name: string;
            description: string;
            parameters: OllamaToolDefinition["function"]["parameters"];
            execute: ToolExecutor;
        }) => ReturnType<ToolsBuilder["addPackage"]>;
        done: () => ToolsBuilder;
    } {
        const packageDescriptor: ToolPackageDescriptor = {
            id: config.id,
            title: config.title,
            description: config.description,
            tools: [],
        };

        this.packages.push(packageDescriptor);

        const chain = {
            addTool: (tool: {
                name: string;
                description: string;
                parameters: OllamaToolDefinition["function"]["parameters"];
                execute: ToolExecutor;
            }) => {
                packageDescriptor.tools.push({
                    packageId: packageDescriptor.id,
                    packageTitle: packageDescriptor.title,
                    packageDescription: packageDescriptor.description,
                    schema: {
                        type: "function",
                        function: {
                            name: tool.name,
                            description: tool.description,
                            parameters: tool.parameters,
                        },
                    },
                    execute: tool.execute,
                });

                return chain;
            },
            done: () => this,
        };

        return chain;
    }

    build(): ToolPackageDescriptor[] {
        return this.packages.map((pkg) => ({
            ...pkg,
            tools: [...pkg.tools],
        }));
    }

    static stringParam(
        description: string,
        enumValues?: string[],
    ): ToolParameterSchema {
        return {
            type: "string",
            description,
            ...(enumValues && enumValues.length > 0
                ? { enum: enumValues }
                : {}),
        };
    }

    static numberParam(description: string): ToolParameterSchema {
        return {
            type: "number",
            description,
        };
    }

    static objectSchema(config: {
        properties: Record<string, ToolParameterSchema>;
        required?: string[];
    }): ToolParameterSchema {
        return {
            type: "object",
            properties: config.properties,
            ...(config.required && config.required.length > 0
                ? { required: config.required }
                : {}),
        };
    }

    static arrayOfObjects(config: {
        properties: Record<string, ToolParameterSchema>;
        required?: string[];
        description?: string;
    }): ToolParameterSchema {
        return {
            type: "array",
            ...(config.description ? { description: config.description } : {}),
            items: {
                type: "object",
                properties: config.properties,
                ...(config.required && config.required.length > 0
                    ? { required: config.required }
                    : {}),
            },
        };
    }
}
