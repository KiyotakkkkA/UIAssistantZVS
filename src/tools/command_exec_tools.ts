import { ToolsBuilder } from "../utils/ToolsBuilder";

export const commandExecToolsPackage = () => {
    const builder = new ToolsBuilder();

    builder
        .addPackage({
            id: "command-exec",
            title: "Command Exec Tools",
            description:
                "Выполнение shell-команд в пользовательском контексте (без прав администратора).",
        })
        .addTool({
            name: "command_exec",
            description:
                "Выполняет shell-команду в указанной директории после подтверждения пользователем.",
            parameters: ToolsBuilder.objectSchema({
                properties: {
                    command: ToolsBuilder.stringParam(
                        "Shell-команда для выполнения",
                    ),
                    cwd: ToolsBuilder.stringParam(
                        "Рабочая директория выполнения (опционально)",
                    ),
                },
                required: ["command"],
            }),
            execute: async (args) => {
                const command =
                    typeof args.command === "string" ? args.command : "";
                const cwd = typeof args.cwd === "string" ? args.cwd : undefined;

                const api = window.appApi;

                if (!api?.shell.execShellCommand) {
                    throw new Error(
                        "Командное выполнение недоступно в текущей среде",
                    );
                }

                return await api.shell.execShellCommand(command, cwd);
            },
        })
        .done();

    return builder.build();
};
