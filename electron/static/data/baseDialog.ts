import { randomUUID } from "node:crypto";
import type { ChatDialog } from "../../../src/types/Chat";

const createPrefixedId = (prefix: "dialog" | "msg") =>
    `${prefix}_${randomUUID().replace(/-/g, "")}`;

export const createDialogId = () => createPrefixedId("dialog");

export const createMessageId = () => createPrefixedId("msg");

export const createBaseDialog = (
    forProjectId: string | null = null,
): ChatDialog => {
    const now = new Date().toISOString();

    return {
        id: createDialogId(),
        title: "Новый диалог",
        messages: [],
        forProjectId,
        createdAt: now,
        updatedAt: now,
    };
};
