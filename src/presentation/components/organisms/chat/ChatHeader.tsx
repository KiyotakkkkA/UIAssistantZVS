import { useState } from "react";
import { Icon } from "@iconify/react";
import { useThemePreference, type ThemePreference } from "../../../../hooks";
import { Button, Modal } from "../../atoms";
import { SettingsView } from "../settings";

export function ChatHeader() {
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const { themePreference, setTheme } = useThemePreference();

    const themeOptions: { value: ThemePreference; label: string }[] = [
        { value: "system", label: "Система" },
        { value: "light", label: "Светлая" },
        { value: "dark", label: "Тёмная" },
    ];

    return (
        <>
            <header className="flex items-center justify-between rounded-2xl bg-neutral-900/90 px-4 py-3 backdrop-blur-md">
                <div>
                    <h1 className="text-base font-semibold text-neutral-100">
                        Чат с моделью
                    </h1>
                </div>
                <div className="flex items-center gap-2">
                    <Button label="Search" className="p-2">
                        <Icon icon="mdi:magnify" width="16" height="16" />
                    </Button>
                    <Button label="Menu" className="p-2">
                        <Icon icon="mdi:menu" width="16" height="16" />
                    </Button>
                    <Button
                        label="Settings"
                        className="p-2"
                        onClick={() => setIsSettingsOpen(true)}
                    >
                        <Icon icon="mdi:cog-outline" width="16" height="16" />
                    </Button>
                </div>
            </header>

            <Modal
                open={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                title="Настройки"
                className="max-w-6xl min-h-95"
            >
                <SettingsView
                    themePreference={themePreference}
                    themeOptions={themeOptions}
                    setTheme={setTheme}
                />
            </Modal>
        </>
    );
}
