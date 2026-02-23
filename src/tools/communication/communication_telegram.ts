import { Config } from "../../config";

type TelegramParseMode = "Markdown" | "MarkdownV2" | "HTML";

type TelegramUpdate = {
    update_id: number;
    message?: {
        message_id?: number;
        date?: number;
        text?: string;
        chat?: {
            id?: number | string;
            type?: string;
            title?: string;
            username?: string;
            first_name?: string;
            last_name?: string;
        };
        from?: {
            id?: number;
            is_bot?: boolean;
            first_name?: string;
            last_name?: string;
            username?: string;
            language_code?: string;
        };
    };
};

type SendTelegramInput = {
    telegramBotToken: string;
    telegramId: string;
    message: string;
    parseMode: TelegramParseMode;
};

type GetUnreadTelegramInput = {
    telegramBotToken: string;
    telegramId: string;
    limit?: number;
    markAsRead?: boolean;
};

export function escapeMarkdownV2(text: string): string {
    return text.replace(/[_*[\]()~`>#+\-=|{}.!\\]/g, "\\$&");
}

const proxyTelegramApiRequest = async <TResult>(
    telegramBotToken: string,
    methodName: string,
    payload: Record<string, unknown>,
): Promise<{ ok: boolean; result?: TResult; description?: string }> => {
    const api = window.appApi;

    if (!api?.network?.proxyHttpRequest) {
        throw new Error("proxy_http_request_unavailable");
    }

    const response = await api.network.proxyHttpRequest({
        url: `${Config.TELEGRAM_BOT_BASE_URL}${telegramBotToken}/${methodName}`,
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        bodyText: JSON.stringify(payload),
    });

    if (!response.ok) {
        throw new Error(`request_failed_${response.status}`);
    }

    let parsed: { ok: boolean; result?: TResult; description?: string };
    try {
        parsed = JSON.parse(response.bodyText) as {
            ok: boolean;
            result?: TResult;
            description?: string;
        };
    } catch {
        throw new Error("invalid_telegram_response");
    }

    return parsed;
};

export const sendTelegramMessageViaProxy = async ({
    telegramBotToken,
    telegramId,
    message,
    parseMode,
}: SendTelegramInput) => {
    const formattedMessage =
        parseMode === "MarkdownV2" ? escapeMarkdownV2(message) : message;

    const response = await proxyTelegramApiRequest<{ message_id?: number }>(
        telegramBotToken,
        "sendMessage",
        {
            chat_id: telegramId,
            text: formattedMessage,
            parse_mode: parseMode,
        },
    );

    if (!response.ok) {
        return {
            success: false,
            error: response.description ?? "unknown",
            message: "failed",
        };
    }

    return {
        success: true,
        message: "sent",
        message_id: response.result?.message_id,
    };
};

const clampLimit = (value?: number): number => {
    if (!Number.isFinite(value)) {
        return 20;
    }

    const safeValue = Math.floor(value as number);
    if (safeValue < 1) {
        return 1;
    }
    if (safeValue > 100) {
        return 100;
    }

    return safeValue;
};

export const getUnreadTelegramMessagesViaProxy = async ({
    telegramBotToken,
    telegramId,
    limit,
    markAsRead,
}: GetUnreadTelegramInput) => {
    const safeLimit = clampLimit(limit);
    const shouldMarkAsRead = markAsRead !== false;
    const offset = 0;

    const response = await proxyTelegramApiRequest<TelegramUpdate[]>(
        telegramBotToken,
        "getUpdates",
        {
            offset,
            limit: safeLimit,
            timeout: 0,
            allowed_updates: ["message"],
        },
    );

    if (!response.ok) {
        return {
            success: false,
            error: response.description ?? "unknown",
            message: "failed",
        };
    }

    const updates = Array.isArray(response.result) ? response.result : [];
    const nextOffset =
        updates.length > 0
            ? Math.max(...updates.map((item) => item.update_id)) + 1
            : offset;

    if (shouldMarkAsRead && nextOffset > 0) {
        await proxyTelegramApiRequest<TelegramUpdate[]>(
            telegramBotToken,
            "getUpdates",
            {
                offset: nextOffset,
                limit: 1,
                timeout: 0,
                allowed_updates: ["message"],
            },
        );
    }

    const userMessages = updates
        .filter((update) => {
            const chatId = update.message?.chat?.id;
            return String(chatId ?? "") === String(telegramId);
        })
        .map((update) => ({
            update_id: update.update_id,
            message_id: update.message?.message_id,
            date: update.message?.date,
            text: update.message?.text ?? "",
            chat: {
                id: update.message?.chat?.id,
                type: update.message?.chat?.type,
                title: update.message?.chat?.title,
                username: update.message?.chat?.username,
                first_name: update.message?.chat?.first_name,
                last_name: update.message?.chat?.last_name,
            },
            from: {
                id: update.message?.from?.id,
                is_bot: update.message?.from?.is_bot,
                first_name: update.message?.from?.first_name,
                last_name: update.message?.from?.last_name,
                username: update.message?.from?.username,
                language_code: update.message?.from?.language_code,
            },
        }));

    return {
        success: true,
        message: "ok",
        unread_count: userMessages.length,
        updates_count: updates.length,
        offset_used: offset,
        next_offset: shouldMarkAsRead ? nextOffset : offset,
        messages: userMessages,
    };
};
