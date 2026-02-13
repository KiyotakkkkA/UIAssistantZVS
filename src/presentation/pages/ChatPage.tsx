import { useState } from "react";
import { ChatMessage } from "../../types/Chat";
import { MessageComposer } from "../components/molecules";
import { ChatHeader, ChatSidebar, MessageFeed } from "../components/organisms";

export function ChatPage() {
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            author: "assistant" as const,
            content:
                "Привет! Я могу помочь оформить интерфейс чата под ваш фирменный neutral-стиль и разложить его по atomic design.",
            timestamp: "12:40",
        },
        {
            author: "user" as const,
            content:
                "Нужна только вёрстка, без логики. Слева список диалогов, справа сам чат и красивое поле ввода.",
            timestamp: "12:41",
        },
        {
            author: "assistant" as const,
            content:
                "Готово. Соберу atoms, molecules и organisms, а страницу соберу отдельно в presentation-слое.",
            timestamp: "12:42",
        },
        {
            author: "assistant" as const,
            content:
                "Готово. Соберу atoms, molecules и organisms, а страницу соберу отдельно в presentation-слое.",
            timestamp: "12:42",
        },
        {
            author: "assistant" as const,
            content:
                "Готово. Соберу atoms, molecules и organisms, а страницу соберу отдельно в presentation-слое.",
            timestamp: "12:42",
        },
        {
            author: "assistant" as const,
            content:
                "Готово. Соберу atoms, molecules и organisms, а страницу соберу отдельно в presentation-слое.",
            timestamp: "12:42",
        },
        {
            author: "assistant" as const,
            content:
                "Готово. Соберу atoms, molecules и organisms, а страницу соберу отдельно в presentation-слое.",
            timestamp: "12:42",
        },
        {
            author: "assistant" as const,
            content:
                "Готово. Соберу atoms, molecules и organisms, а страницу соберу отдельно в presentation-слое.",
            timestamp: "12:42",
        },
        {
            author: "assistant" as const,
            content:
                "Готово. Соберу atoms, molecules и organisms, а страницу соберу отдельно в presentation-слое.",
            timestamp: "12:42",
        },
        {
            author: "assistant" as const,
            content:
                "Готово. Соберу atoms, molecules и organisms, а страницу соберу отдельно в presentation-слое.",
            timestamp: "12:42",
        },
        {
            author: "assistant" as const,
            content:
                "Готово. Соберу atoms, molecules и organisms, а страницу соберу отдельно в presentation-слое.",
            timestamp: "12:42",
        },
        {
            author: "assistant" as const,
            content:
                "Готово. Соберу atoms, molecules и organisms, а страницу соберу отдельно в presentation-слое.",
            timestamp: "12:42",
        },
        {
            author: "assistant" as const,
            content:
                "Готово. Соберу atoms, molecules и organisms, а страницу соберу отдельно в presentation-слое.",
            timestamp: "12:42",
        },
        {
            author: "assistant" as const,
            content:
                "Готово. Соберу atoms, molecules и organisms, а страницу соберу отдельно в presentation-слое.",
            timestamp: "12:42",
        },
    ]);

    const addUserMsg = (content: string) => {
        setMessages([
            ...messages,
            {
                author: "user",
                content: content,
                timestamp: "11:11",
            },
        ]);
    };

    return (
        <main className="h-screen w-screen overflow-hidden bg-neutral-900 p-3 text-neutral-100">
            <div className="flex h-full w-full gap-3">
                <ChatSidebar />

                <section className="flex min-w-0 flex-1 flex-col gap-3 rounded-3xl bg-neutral-900/70 backdrop-blur-md">
                    <ChatHeader />
                    <MessageFeed messages={messages} />
                    <MessageComposer onMessageSend={addUserMsg} />
                </section>
            </div>
        </main>
    );
}
