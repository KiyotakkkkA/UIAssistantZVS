import { ChatBubble } from "../molecules";

const messages = [
    {
        author: "assistant" as const,
        text: "Привет! Я могу помочь оформить интерфейс чата под ваш фирменный neutral-стиль и разложить его по atomic design.",
        timestamp: "12:40",
    },
    {
        author: "user" as const,
        text: "Нужна только вёрстка, без логики. Слева список диалогов, справа сам чат и красивое поле ввода.",
        timestamp: "12:41",
    },
    {
        author: "assistant" as const,
        text: "Готово. Соберу atoms, molecules и organisms, а страницу соберу отдельно в presentation-слое.",
        timestamp: "12:42",
    },
    {
        author: "assistant" as const,
        text: "Готово. Соберу atoms, molecules и organisms, а страницу соберу отдельно в presentation-слое.",
        timestamp: "12:42",
    },
    {
        author: "assistant" as const,
        text: "Готово. Соберу atoms, molecules и organisms, а страницу соберу отдельно в presentation-слое.",
        timestamp: "12:42",
    },
    {
        author: "assistant" as const,
        text: "Готово. Соберу atoms, molecules и organisms, а страницу соберу отдельно в presentation-слое.",
        timestamp: "12:42",
    },
    {
        author: "assistant" as const,
        text: "Готово. Соберу atoms, molecules и organisms, а страницу соберу отдельно в presentation-слое.",
        timestamp: "12:42",
    },
    {
        author: "assistant" as const,
        text: "Готово. Соберу atoms, molecules и organisms, а страницу соберу отдельно в presentation-слое.",
        timestamp: "12:42",
    },
    {
        author: "assistant" as const,
        text: "Готово. Соберу atoms, molecules и organisms, а страницу соберу отдельно в presentation-слое.",
        timestamp: "12:42",
    },
    {
        author: "assistant" as const,
        text: "Готово. Соберу atoms, molecules и organisms, а страницу соберу отдельно в presentation-слое.",
        timestamp: "12:42",
    },
    {
        author: "assistant" as const,
        text: "Готово. Соберу atoms, molecules и organisms, а страницу соберу отдельно в presentation-слое.",
        timestamp: "12:42",
    },
    {
        author: "assistant" as const,
        text: "Готово. Соберу atoms, molecules и organisms, а страницу соберу отдельно в presentation-слое.",
        timestamp: "12:42",
    },
    {
        author: "assistant" as const,
        text: "Готово. Соберу atoms, molecules и organisms, а страницу соберу отдельно в presentation-слое.",
        timestamp: "12:42",
    },
    {
        author: "assistant" as const,
        text: "Готово. Соберу atoms, molecules и organisms, а страницу соберу отдельно в presentation-слое.",
        timestamp: "12:42",
    },
];

export function MessageFeed() {
    return (
        <section className="flex-1 space-y-4 overflow-y-auto rounded-2xl bg-neutral-900/55 p-2 ring-neutral-300/15">
            {messages.map((message, index) => (
                <ChatBubble
                    key={`${message.timestamp}-${index}`}
                    {...message}
                />
            ))}
        </section>
    );
}
