import { useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import { Button, InputBig } from "../../../atoms";
import type { ToolTrace } from "../../../../../types/Chat";

type QaToolBubbleCardProps = {
    toolTrace?: ToolTrace;
    onSendAnswer: (answer: string) => void;
};

const pickString = (value: unknown): string =>
    typeof value === "string" ? value.trim() : "";

const pickStringArray = (value: unknown): string[] => {
    if (!Array.isArray(value)) {
        return [];
    }

    return value.filter((item): item is string => typeof item === "string");
};

export function QaToolBubbleCard({
    toolTrace,
    onSendAnswer,
}: QaToolBubbleCardProps) {
    const [answer, setAnswer] = useState("");

    const payload = useMemo(() => {
        const args = (toolTrace?.args || {}) as Record<string, unknown>;
        const result = (toolTrace?.result || {}) as Record<string, unknown>;

        const question =
            pickString(result.question) || pickString(args.question);
        const reason = pickString(result.reason) || pickString(args.reason);
        const expectedFormat =
            pickString(result.expectedFormat) ||
            pickString(args.expectedFormat);
        const selectAnswers = [
            ...pickStringArray(result.selectAnswers),
            ...pickStringArray(args.selectAnswers),
        ].filter((value, index, all) => all.indexOf(value) === index);
        const userAnswerHint =
            pickString(result.userAnswer) || pickString(args.userAnswer);

        return {
            question,
            reason,
            expectedFormat,
            selectAnswers,
            userAnswerHint,
        };
    }, [toolTrace?.args, toolTrace?.result]);

    const submitAnswer = () => {
        const next = answer.trim();

        if (!next) {
            return;
        }

        onSendAnswer(next);
        setAnswer("");
    };

    return (
        <div className="w-full rounded-2xl border border-main-700/60 bg-main-900/60 px-4 py-3 text-sm text-main-100 space-y-3">
            <div className="flex items-center gap-2">
                <Icon
                    icon="mdi:chat-question-outline"
                    width={18}
                    height={18}
                    className="text-main-300"
                />
                <p className="text-sm font-semibold text-main-100">
                    Уточнение от ассистента
                </p>
            </div>

            <div className="rounded-xl border border-main-700/70 bg-main-900/45 p-3 space-y-2">
                <p className="text-sm text-main-100">
                    {payload.question ||
                        "Нужны дополнительные данные от пользователя."}
                </p>

                {payload.reason ? (
                    <p className="text-xs text-main-400">
                        Причина: {payload.reason}
                    </p>
                ) : null}

                {payload.expectedFormat ? (
                    <p className="text-xs text-main-400">
                        Формат ответа: {payload.expectedFormat}
                    </p>
                ) : null}
            </div>

            {payload.selectAnswers.length > 0 ? (
                <div className="space-y-2">
                    <p className="text-xs text-main-300">Быстрый выбор</p>
                    <div className="flex flex-wrap gap-2">
                        {payload.selectAnswers.map((option) => (
                            <Button
                                key={option}
                                variant="secondary"
                                shape="rounded-lg"
                                className="h-8 px-3 text-xs"
                                onClick={() => onSendAnswer(option)}
                            >
                                {option}
                            </Button>
                        ))}
                    </div>
                </div>
            ) : null}

            <div className="space-y-2">
                <p className="text-xs text-main-300">Развёрнутый ответ</p>
                <InputBig
                    value={answer}
                    onChange={setAnswer}
                    className="h-24 rounded-xl border border-main-700 bg-main-800 px-3 py-2 text-sm text-main-100"
                    placeholder={
                        payload.userAnswerHint ||
                        payload.expectedFormat ||
                        "Введите ваш ответ"
                    }
                />
                <div className="flex justify-end">
                    <Button
                        variant="primary"
                        shape="rounded-lg"
                        className="h-8 px-3 text-xs"
                        onClick={submitAnswer}
                        disabled={!answer.trim()}
                    >
                        Отправить ответ
                    </Button>
                </div>
            </div>
        </div>
    );
}
