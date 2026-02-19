import { ToolsBuilder } from "../utils/ToolsBuilder";

/**
 * Escapes all MarkdownV2 special characters in a plain-text string.
 * Required characters: _ * [ ] ( ) ~ ` > # + - = | { } . !  \
 * Does NOT escape existing formatting — use only when the input is plain text.
 */
function escapeMarkdownV2(text: string): string {
    return text.replace(/[_*[\]()~`>#+\-=|{}.!\\]/g, "\\$&");
}

export const communicationToolsPackage = () => {
    const builder = new ToolsBuilder();

    builder
        .addPackage({
            id: "communication-tools",
            title: "Мессенджеры",
            description: "Инструменты для отправки сообщений пользователю",
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

                // Auto-escape special chars when MarkdownV2 is requested
                const message =
                    parseMode === "MarkdownV2"
                        ? escapeMarkdownV2(rawMessage)
                        : rawMessage;

                try {
                    const url = `https://api.telegram.org/bot${telegramBotToken}/sendMessage`;
                    const payload = {
                        chat_id: telegramId,
                        text: message,
                        parse_mode: parseMode,
                    };

                    const controller = new AbortController();
                    const timeoutId = setTimeout(
                        () => controller.abort(),
                        10_000,
                    );

                    let response: Response;
                    try {
                        response = await fetch(url, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(payload),
                            signal: controller.signal,
                        });
                    } finally {
                        clearTimeout(timeoutId);
                    }

                    const data = (await response.json()) as {
                        ok: boolean;
                        description?: string;
                        result?: { message_id?: number };
                    };

                    if (response.ok && data.ok) {
                        return {
                            success: true,
                            message: "sent",
                            message_id: data.result?.message_id,
                        };
                    }

                    return {
                        success: false,
                        error: data.description ?? "unknown",
                        message: "failed",
                    };
                } catch (err: unknown) {
                    if (
                        err instanceof DOMException &&
                        err.name === "AbortError"
                    ) {
                        return {
                            success: false,
                            error: "timeout",
                            message: "request timeout",
                        };
                    }
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
