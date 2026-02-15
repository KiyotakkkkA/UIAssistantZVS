import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

export type CommandExecResult = {
    command: string;
    cwd: string;
    isAdmin: false;
    exitCode: number;
    stdout: string;
    stderr: string;
};

const decodeOutput = (buffer: Buffer): string => {
    const utf8 = buffer.toString("utf8");

    if (process.platform !== "win32") {
        return utf8;
    }

    try {
        const cp866 = new TextDecoder("ibm866").decode(buffer);
        const utf8ReplacementCount = (utf8.match(/�/g) || []).length;
        const cp866ReplacementCount = (cp866.match(/�/g) || []).length;

        return cp866ReplacementCount < utf8ReplacementCount ? cp866 : utf8;
    } catch {
        return utf8;
    }
};

export class CommandExecService {
    async execute(command: string, cwd?: string): Promise<CommandExecResult> {
        const trimmedCommand = command.trim();

        if (!trimmedCommand) {
            throw new Error("Команда для выполнения не указана");
        }

        const resolvedCwd = cwd?.trim() ? path.resolve(cwd) : process.cwd();

        if (!fs.existsSync(resolvedCwd)) {
            throw new Error(`Рабочая директория не существует: ${resolvedCwd}`);
        }

        const executableCommand =
            process.platform === "win32"
                ? `chcp 65001>nul & ${trimmedCommand}`
                : trimmedCommand;

        return await new Promise<CommandExecResult>((resolve, reject) => {
            const child = spawn(executableCommand, {
                cwd: resolvedCwd,
                shell: true,
                windowsHide: true,
            });

            const stdoutChunks: Buffer[] = [];
            const stderrChunks: Buffer[] = [];

            child.stdout.on("data", (chunk) => {
                stdoutChunks.push(
                    Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk)),
                );
            });

            child.stderr.on("data", (chunk) => {
                stderrChunks.push(
                    Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk)),
                );
            });

            child.on("error", (error) => {
                reject(error);
            });

            child.on("close", (code) => {
                const stdout = decodeOutput(Buffer.concat(stdoutChunks));
                const stderr = decodeOutput(Buffer.concat(stderrChunks));

                resolve({
                    command: trimmedCommand,
                    cwd: resolvedCwd,
                    isAdmin: false,
                    exitCode: typeof code === "number" ? code : -1,
                    stdout,
                    stderr,
                });
            });
        });
    }
}
