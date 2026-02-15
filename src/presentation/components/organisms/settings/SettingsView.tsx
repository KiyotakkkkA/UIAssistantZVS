import { useState, type ReactNode } from "react";
import { Icon } from "@iconify/react";
import { SettingsInterfacePanel } from "./SettingsInterfacePanel";

type SettingsRoute = "interface" | "chat" | "profile";

interface SettingsViewProps {
    themePreference: string;
    themeOptions: { value: string; label: string }[];
    setTheme: (themeId: string) => void;
}

type SettingsRouteItem = {
    key: SettingsRoute;
    title: string;
    icon: string;
    description: string;
};

const settingsRoutes: SettingsRouteItem[] = [
    {
        key: "interface",
        title: "Интерфейс",
        icon: "mdi:monitor",
        description: "Тема, внешний вид и отображение",
    },
    {
        key: "chat",
        title: "Чат",
        icon: "mdi:message-outline",
        description: "Параметры диалога и истории",
    },
    {
        key: "profile",
        title: "Профиль",
        icon: "mdi:account-outline",
        description: "Данные текущего пользователя",
    },
];

const SettingsPlaceholderPanel = ({
    title,
    description,
}: {
    title: string;
    description: string;
}) => {
    return (
        <div className="rounded-2xl border border-main-700/60 bg-main-900/40 p-4">
            <h4 className="text-sm font-semibold text-main-100">{title}</h4>
            <p className="mt-2 text-xs leading-5 text-main-300">
                {description}
            </p>
        </div>
    );
};

export const SettingsView = ({
    themePreference,
    themeOptions,
    setTheme,
}: SettingsViewProps) => {
    const [activeRoute, setActiveRoute] = useState<SettingsRoute>("interface");

    const renderedPanel: Record<SettingsRoute, ReactNode> = {
        interface: (
            <SettingsInterfacePanel
                themePreference={themePreference}
                themeOptions={themeOptions}
                setTheme={setTheme}
            />
        ),
        chat: (
            <SettingsPlaceholderPanel
                title="Настройки чата"
                description="Скоро здесь появятся параметры поведения чата и истории сообщений."
            />
        ),
        profile: (
            <SettingsPlaceholderPanel
                title="Профиль"
                description="Скоро здесь появятся персональные настройки текущего пользователя."
            />
        ),
    };

    return (
        <div className="grid min-h-120 gap-6 md:grid-cols-[260px_1fr]">
            <aside className="md:sticky md:top-0 md:self-start">
                <nav className="max-h-120 space-y-2 overflow-y-auto border-r border-main-700/80 pr-3">
                    {settingsRoutes.map((route) => {
                        const isActive = route.key === activeRoute;

                        return (
                            <button
                                key={route.key}
                                type="button"
                                onClick={() => setActiveRoute(route.key)}
                                aria-current={isActive ? "page" : undefined}
                                className={`w-full rounded-xl px-3 py-2 text-left text-sm font-medium transition-colors cursor-pointer ${
                                    isActive
                                        ? "bg-main-700/60 text-main-100"
                                        : "text-main-300 hover:bg-main-800/60 hover:text-main-100"
                                }`}
                            >
                                <span className="inline-flex items-center gap-2">
                                    <Icon
                                        icon={route.icon}
                                        width="16"
                                        height="16"
                                    />
                                    {route.title}
                                </span>
                                <span className="mt-1 block text-[11px] font-normal leading-4 text-main-400">
                                    {route.description}
                                </span>
                            </button>
                        );
                    })}
                </nav>
            </aside>

            <section className="min-h-0 max-h-120 overflow-y-auto overflow-x-hidden pr-1">
                {renderedPanel[activeRoute]}
            </section>
        </div>
    );
};
