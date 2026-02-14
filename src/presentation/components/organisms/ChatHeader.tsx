import { useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import { useThemePreference, type ThemePreference } from "../../../hooks";
import { Button, Modal, Select } from "../atoms";

export function ChatHeader() {
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const { themePreference, setTheme } = useThemePreference();

    const themeOptions = useMemo(
        () => [
            { value: "system", label: "Система" },
            { value: "light", label: "Светлая" },
            { value: "dark", label: "Тёмная" },
        ],
        [],
    );

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
                <div className="grid min-h-62.5 gap-5 md:grid-cols-[240px_1fr]">
                    <aside className="border-r border-neutral-700/80 pr-3">
                        <div className="rounded-xl bg-neutral-700/50 px-3 py-2 text-sm font-medium text-neutral-100">
                            <span className="inline-flex items-center gap-2">
                                <Icon
                                    icon="mdi:monitor"
                                    width="16"
                                    height="16"
                                />
                                Интерфейс
                            </span>
                        </div>
                    </aside>

                    <section className="mx-auto w-full">
                        <div className="py-3 flex items-center justify-between border-b border-neutral-700/80">
                            <span className="text-sm font-medium text-neutral-200">
                                Тема
                            </span>

                            <Select
                                value={themePreference}
                                onChange={(nextValue) =>
                                    setTheme(nextValue as ThemePreference)
                                }
                                options={themeOptions}
                                placeholder="Выберите тему"
                                className="rounded-xl bg-neutral-800/70 hover:bg-neutral-700/70 px-3 py-2 text-neutral-100"
                                wrapperClassName="text-neutral-200"
                            />
                        </div>
                    </section>
                </div>
            </Modal>
        </>
    );
}
