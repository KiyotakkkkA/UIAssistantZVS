import { ConversationItem } from "../molecules";

const conversations = [
    {
        title: "Новый сценарий onboarding",
        preview: "Сделай flow первого запуска с 3 шагами",
        time: "12:45",
        active: true,
    },
    {
        title: "Компоненты профиля",
        preview: "Обнови карточку пользователя в минимальном стиле",
        time: "11:20",
    },
    {
        title: "E2E smoke checklist",
        preview: "Нужна короткая проверка перед релизом",
        time: "Вчера",
    },
];

export function ChatSidebar() {
    return (
        <aside className="flex h-full w-[320px] flex-col bg-neutral-900/85 p-4 border-r border-neutral-300/20 backdrop-blur-md">
            <div>
                <p className="text-xs uppercase tracking-[0.18em] text-neutral-400">
                    Рабочая область
                </p>
            </div>

            <div className="mt-6 flex-1 space-y-2 overflow-y-auto pr-1">
                {conversations.map((conversation) => (
                    <ConversationItem
                        key={conversation.title}
                        {...conversation}
                    />
                ))}
            </div>
        </aside>
    );
}
