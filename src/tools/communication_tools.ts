import { ToolsBuilder } from "../utils/ToolsBuilder";
import {
    getUnreadTelegramMessagesViaProxy,
    sendTelegramMessageViaProxy,
} from "./communication/communication_telegram";

export const communicationToolsPackage = () => {
    const builder = new ToolsBuilder();

    builder
        .addPackage({
            id: "communication-tools",
            title: "Мессенджеры",
            description: "Инструменты для отправки и чтения сообщений пользователя",
        })
        .addTool({
            name: "send_telegram_msg",
            description:
                "Отправляет сообщение пользователю через Telegram-бота. " +
                "Используй для уведомлений, итогов выполненной работы, напоминаний и важных сообщений. " +
                "Для форматирования ВСЕГДА используй parse_mode='Markdown' (не MarkdownV2). " +
                "Markdown: *жирный*, _курсив_, `код`, ```блок кода```. " +
                "При parse_mode='MarkdownV2' спецсимволы ( ) . - _ * [ ] ~ ` > # + = | { } ! " +
                "экранируются автоматически — использовать только для plain-text сообщений без ручной разметки.",
            parameters: ToolsBuilder.objectSchema({
                properties: {
                    message: ToolsBuilder.stringParam(
                        "Текст сообщения для отправки. Поддерживает Markdown-разметку.",
                    ),
                    parse_mode: ToolsBuilder.stringParam(
                        "Режим форматирования. Используй 'Markdown' для текста с разметкой. " +
                            "'MarkdownV2' — для plain-text (спецсимволы будут экранированы автоматически). " +
                            "'HTML' — для HTML-разметки. По умолчанию: Markdown.",
                        ["Markdown", "HTML", "MarkdownV2"],
                    ),
                },
                required: ["message"],
            }),
            outputScheme: {
                type: "object",
                properties: {
                    success: { type: "boolean" },
                    message: { type: "string" },
                    error: { type: "string" },
                    message_id: { type: "number" },
                },
                required: ["success", "message"],
            },
            execute: async (args, context) => {
                const { telegramBotToken, telegramId } = context;

                if (!telegramBotToken || !telegramId) {
                    return {
                        success: false,
                        error: "missing_config",
                        message:
                            "Telegram не настроен. Укажи Bot Token и ID пользователя в настройках.",
                    };
                }

                const rawMessage =
                    typeof args.message === "string" ? args.message : "";
                const parseMode =
                    typeof args.parse_mode === "string"
                        ? args.parse_mode
                        : "Markdown";

                if (!rawMessage.trim()) {
                    return {
                        success: false,
                        error: "empty_message",
                        message: "Сообщение не может быть пустым.",
                    };
                }

                const message = rawMessage;

                try {
                    return await sendTelegramMessageViaProxy({
                        telegramBotToken,
                        telegramId,
                        message,
                        parseMode:
                            parseMode === "HTML" ||
                            parseMode === "MarkdownV2"
                                ? parseMode
                                : "Markdown",
                    });
                } catch (err: unknown) {
                    return {
                        success: false,
                        error: "unexpected_error",
                        message:
                            err instanceof Error ? err.message : String(err),
                    };
                }
            },
        })
        .addTool({
            name: "get_telegram_unread_msgs",
            description:
                "Получает непрочитанные сообщения пользователя из Telegram через getUpdates. " +
                "По умолчанию помечает полученные апдейты прочитанными (offset сохраняется).",
            parameters: ToolsBuilder.objectSchema({
                properties: {
                    limit: ToolsBuilder.numberParam(
                        "Сколько апдейтов читать за запрос (1..100). По умолчанию: 20.",
                    ),
                    mark_as_read: {
                        type: "boolean",
                        description:
                            "Помечать ли полученные апдейты прочитанными. По умолчанию: true.",
                    },
                },
            }),
            outputScheme: {
                type: "object",
                properties: {
                    success: { type: "boolean" },
                    message: { type: "string" },
                    error: { type: "string" },
                    unread_count: { type: "number" },
                    updates_count: { type: "number" },
                    offset_used: { type: "number" },
                    next_offset: { type: "number" },
                    messages: {
                        type: "array",
                        items: {
                            type: "object",
                        },
                    },
                },
                required: ["success", "message"],
            },
            execute: async (args, context) => {
                const { telegramBotToken, telegramId } = context;

                if (!telegramBotToken || !telegramId) {
                    return {
                        success: false,
                        error: "missing_config",
                        message:
                            "Telegram не настроен. Укажи Bot Token и ID пользователя в настройках.",
                    };
                }

                const rawLimit = args.limit;
                const rawMarkAsRead = args.mark_as_read;

                try {
                    return await getUnreadTelegramMessagesViaProxy({
                        telegramBotToken,
                        telegramId,
                        limit:
                            typeof rawLimit === "number"
                                ? rawLimit
                                : undefined,
                        markAsRead:
                            typeof rawMarkAsRead === "boolean"
                                ? rawMarkAsRead
                                : undefined,
                    });
                } catch (err: unknown) {
                    return {
                        success: false,
                        error: "unexpected_error",
                        message:
                            err instanceof Error ? err.message : String(err),
                    };
                }
            },
        })
        .done();

    return builder.build();
};
