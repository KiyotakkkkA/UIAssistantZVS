import { ToolsBuilder } from "../utils/ToolsBuilder";

export const filesystemToolsPackage = () => {
    const builder = new ToolsBuilder();

    builder
        .addPackage({
            id: "filesystem-tools",
            title: "Файловая система",
            description: "Инструменты для работы с файлами и директориями",
        })
        .addTool({
            name: "list_directory",
            description:
                "Получает список файлов и папок в указанной директории. " +
                "Возвращает имя, тип (file/directory), размер и дату изменения каждого элемента.",
            parameters: ToolsBuilder.objectSchema({
                properties: {
                    cwd: ToolsBuilder.stringParam(
                        "Путь к директории для просмотра содержимого",
                    ),
                },
                required: ["cwd"],
            }),
            outputScheme: {
                type: "object",
                properties: {
                    items: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                name: { type: "string" },
                                type: { type: "string" },
                                size: { type: "number" },
                                modifiedAt: { type: "string" },
                            },
                            required: ["name", "type"],
                        },
                    },
                },
                required: ["items"],
            },
            execute: async (args) => {
                const cwd = typeof args.cwd === "string" ? args.cwd.trim() : "";

                if (!cwd) {
                    return { error: "Необходимо указать параметр cwd." };
                }

                const api = window.appApi;
                if (!api?.fs?.listDirectory) {
                    return { error: "API файловой системы недоступно." };
                }

                try {
                    return await api.fs.listDirectory(cwd);
                } catch (err) {
                    return {
                        error: err instanceof Error ? err.message : String(err),
                    };
                }
            },
        })
        .addTool({
            name: "create_file",
            description:
                "Создаёт новый файл по указанному пути с опциональным содержимым. " +
                "Промежуточные директории создаются автоматически. " +
                "Если файл уже существует — перезаписывает его содержимое.",
            parameters: ToolsBuilder.objectSchema({
                properties: {
                    cwd: ToolsBuilder.stringParam(
                        "Директория, в которой создаётся файл",
                    ),
                    filename: ToolsBuilder.stringParam(
                        "Имя файла или относительный путь внутри cwd (например: 'notes.txt' или 'src/index.ts')",
                    ),
                    content: ToolsBuilder.stringParam(
                        "Содержимое файла. Если не указано — создаётся пустой файл.",
                    ),
                },
                required: ["cwd", "filename"],
            }),
            outputScheme: {
                type: "object",
                properties: {
                    success: { type: "boolean" },
                    filePath: { type: "string" },
                    message: { type: "string" },
                },
                required: ["success"],
            },
            execute: async (args) => {
                const cwd = typeof args.cwd === "string" ? args.cwd.trim() : "";
                const filename =
                    typeof args.filename === "string"
                        ? args.filename.trim()
                        : "";
                const content =
                    typeof args.content === "string" ? args.content : "";

                if (!cwd || !filename) {
                    return { error: "Необходимо указать cwd и filename." };
                }

                const api = window.appApi;
                if (!api?.fs?.createFile) {
                    return { error: "API файловой системы недоступно." };
                }

                try {
                    return await api.fs.createFile(cwd, filename, content);
                } catch (err) {
                    return {
                        error: err instanceof Error ? err.message : String(err),
                    };
                }
            },
        })
        .addTool({
            name: "create_dir",
            description:
                "Создаёт директорию по указанному пути. " +
                "Создаёт всю цепочку промежуточных директорий если они не существуют (аналог mkdir -p). " +
                "Не возвращает ошибку если директория уже существует.",
            parameters: ToolsBuilder.objectSchema({
                properties: {
                    cwd: ToolsBuilder.stringParam(
                        "Базовая директория, внутри которой создаётся новая папка",
                    ),
                    dirname: ToolsBuilder.stringParam(
                        "Имя новой папки или вложенный путь (например: 'reports' или 'data/2026/february')",
                    ),
                },
                required: ["cwd", "dirname"],
            }),
            outputScheme: {
                type: "object",
                properties: {
                    success: { type: "boolean" },
                    dirPath: { type: "string" },
                    message: { type: "string" },
                },
                required: ["success"],
            },
            execute: async (args) => {
                const cwd = typeof args.cwd === "string" ? args.cwd.trim() : "";
                const dirname =
                    typeof args.dirname === "string" ? args.dirname.trim() : "";

                if (!cwd || !dirname) {
                    return { error: "Необходимо указать cwd и dirname." };
                }

                const api = window.appApi;
                if (!api?.fs?.createDir) {
                    return { error: "API файловой системы недоступно." };
                }

                try {
                    return await api.fs.createDir(cwd, dirname);
                } catch (err) {
                    return {
                        error: err instanceof Error ? err.message : String(err),
                    };
                }
            },
        })
        .addTool({
            name: "read_file",
            description:
                "Читает содержимое файла. " +
                "Используй readAll=true для чтения всего файла. " +
                "Для чтения фрагмента укажи readAll=false и диапазон строк через readFromRow/readToRow (нумерация с 1). " +
                "Всегда возвращает totalLines — общее количество строк файла.",
            parameters: ToolsBuilder.objectSchema({
                properties: {
                    filePath: ToolsBuilder.stringParam(
                        "Абсолютный путь к файлу для чтения",
                    ),
                    readAll: {
                        type: "boolean",
                        description:
                            "true — прочитать весь файл; false — читать только указанный диапазон строк",
                    },
                    readFromRow: ToolsBuilder.numberParam(
                        "Номер строки с которой начать чтение (включительно, нумерация с 1). Используется когда readAll=false.",
                    ),
                    readToRow: ToolsBuilder.numberParam(
                        "Номер строки на которой закончить чтение (включительно). Используется когда readAll=false.",
                    ),
                },
                required: ["filePath", "readAll"],
            }),
            outputScheme: {
                type: "object",
                properties: {
                    content: { type: "string" },
                    totalLines: { type: "number" },
                    readFromRow: { type: "number" },
                    readToRow: { type: "number" },
                },
                required: ["content", "totalLines"],
            },
            execute: async (args) => {
                const filePath =
                    typeof args.filePath === "string"
                        ? args.filePath.trim()
                        : "";
                const readAll =
                    typeof args.readAll === "boolean" ? args.readAll : true;
                const readFromRow =
                    typeof args.readFromRow === "number"
                        ? args.readFromRow
                        : undefined;
                const readToRow =
                    typeof args.readToRow === "number"
                        ? args.readToRow
                        : undefined;

                if (!filePath) {
                    return { error: "Необходимо указать filePath." };
                }

                const api = window.appApi;
                if (!api?.fs?.readFile) {
                    return { error: "API файловой системы недоступно." };
                }

                try {
                    return await api.fs.readFile(
                        filePath,
                        readAll,
                        readFromRow,
                        readToRow,
                    );
                } catch (err) {
                    return {
                        error: err instanceof Error ? err.message : String(err),
                    };
                }
            },
        })
        .done();

    return builder.build();
};
