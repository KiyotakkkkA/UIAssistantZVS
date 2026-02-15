import { useState } from "react";
import { Icon } from "@iconify/react";
import type { ThemePreference } from "../../../../hooks";
import { SettingsInterfacePanel } from "./SettingsInterfacePanel";

type SettingsRoute = "interface";

interface SettingsViewProps {
    themePreference: ThemePreference;
    themeOptions: { value: ThemePreference; label: string }[];
    setTheme: (theme: ThemePreference) => void;
}

type SettingsRouteItem = {
    key: SettingsRoute;
    title: string;
    icon: string;
};

const settingsRoutes: SettingsRouteItem[] = [
    {
        key: "interface",
        title: "Интерфейс",
        icon: "mdi:monitor",
    },
];

export const SettingsView = ({
    themePreference,
    themeOptions,
    setTheme,
}: SettingsViewProps) => {
    const [activeRoute, setActiveRoute] = useState<SettingsRoute>("interface");

    return (
        <div className="grid min-h-62.5 gap-5 md:grid-cols-[240px_1fr]">
            <aside className="border-r border-neutral-700/80 pr-3">
                <nav className="space-y-2">
                    {settingsRoutes.map((route) => {
                        const isActive = route.key === activeRoute;

                        return (
                            <button
                                key={route.key}
                                type="button"
                                onClick={() => setActiveRoute(route.key)}
                                className={`w-full rounded-xl px-3 py-2 text-left text-sm font-medium transition-colors ${
                                    isActive
                                        ? "bg-neutral-700/50 text-neutral-100"
                                        : "text-neutral-300 hover:bg-neutral-800/60"
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
                            </button>
                        );
                    })}
                </nav>
            </aside>

            <section className="mx-auto w-full">
                {activeRoute === "interface" && (
                    <SettingsInterfacePanel
                        themePreference={themePreference}
                        themeOptions={themeOptions}
                        setTheme={setTheme}
                    />
                )}
            </section>
        </div>
    );
};
