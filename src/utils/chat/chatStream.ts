import type {
    AssistantStage,
    ChatMessage,
    OllamaResponseFormat,
} from "../../types/Chat";

export const getTimeStamp = () =>
    new Date().toLocaleTimeString("ru-RU", {
        hour: "2-digit",
        minute: "2-digit",
    });

export const createMessageId = () =>
    `msg_${crypto.randomUUID().replace(/-/g, "")}`;

export const splitTextChunk = (
    chunkText: string,
    maxChunkLength = 28,
): string[] => {
    if (!chunkText) {
        return [];
    }

    if (chunkText.length <= maxChunkLength) {
        return [chunkText];
    }

    const chunks: string[] = [];

    for (let index = 0; index < chunkText.length; index += maxChunkLength) {
        chunks.push(chunkText.slice(index, index + maxChunkLength));
    }

    return chunks;
};

export const appendAssistantStageChunk = (
    prev: ChatMessage[],
    answeringAt: string,
    stage: AssistantStage,
    chunkText: string,
): ChatMessage[] => {
    const lastMessage = prev[prev.length - 1];

    if (
        lastMessage?.author === "assistant" &&
        lastMessage.assistantStage === stage &&
        lastMessage.answeringAt === answeringAt
    ) {
        const updatedLastMessage: ChatMessage = {
            ...lastMessage,
            content: `${lastMessage.content}${chunkText}`,
        };

        return [...prev.slice(0, -1), updatedLastMessage];
    }

    return [
        ...prev,
        {
            id: createMessageId(),
            author: "assistant",
            assistantStage: stage,
            answeringAt,
            content: chunkText,
            timestamp: getTimeStamp(),
        },
    ];
};

export const getCommandRequestMeta = (args: Record<string, unknown>) => ({
    command: typeof args.command === "string" ? args.command : "",
    cwd: typeof args.cwd === "string" ? args.cwd : ".",
    isAdmin: false,
});

export const getScenarioFormatHint = (
    scenarioFlow?: string,
): OllamaResponseFormat | undefined => {
    if (!scenarioFlow) {
        return undefined;
    }

    const marker = "MODEL_FORMAT_HINT_JSON_SCHEMA:";
    const markerIndex = scenarioFlow.indexOf(marker);

    if (markerIndex < 0) {
        return undefined;
    }

    const hintRaw = scenarioFlow.slice(markerIndex + marker.length).trim();
    if (!hintRaw) {
        return undefined;
    }

    const firstNonEmptyLine = hintRaw
        .split("\n")
        .find((line) => line.trim().length > 0)
        ?.trim();

    const parseCandidate = (candidate?: string) => {
        if (!candidate) {
            return undefined;
        }

        try {
            return JSON.parse(candidate) as Record<string, unknown>;
        } catch {
            return undefined;
        }
    };

    return parseCandidate(firstNonEmptyLine) ?? parseCandidate(hintRaw);
};

export const buildScenarioRuntimeEnvText = (projectDirectory?: string) => {
    const now = new Date().toLocaleString("ru-RU", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });

    return [
        "SCENARIO_RUNTIME_ENV:",
        `  - current_date=${now}`,
        `  - project_directory=${projectDirectory?.trim() || ""}`,
    ].join("\n");
};
