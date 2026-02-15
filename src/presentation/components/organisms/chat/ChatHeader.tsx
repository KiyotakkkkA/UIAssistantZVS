import { useRef, useState } from "react";
import { Icon } from "@iconify/react";
import { useTheme, useToasts } from "../../../../hooks";
import { Button, Modal } from "../../atoms";
import { SettingsView, type SettingsViewHandle } from "../settings";

export function ChatHeader() {
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const settingsViewRef = useRef<SettingsViewHandle | null>(null);
    const { themePreference, themeOptions, setTheme } = useTheme();
    const toasts = useToasts();

    const handleSaveSettings = async () => {
        const result = await settingsViewRef.current?.save();

        if (!result) {
            return;
        }

        if (result.scope === "chat") {
            toasts.success({
                title: "Интеграция сохранена",
                description: "Параметры провайдера успешно сохранены.",
            });
            return;
        }

        if (result.scope === "profile") {
            toasts.success({
                title: "Профиль сохранён",
                description: "Пользовательские данные обновлены.",
            });
            return;
        }

        toasts.info({
            title: "Изменений нет",
            description: "Для этой вкладки сохранение не требуется.",
        });
    };

    return (
        <>
            <header className="flex items-center justify-between rounded-2xl bg-main-900/90 px-4 py-3 backdrop-blur-md">
                <div>
                    <h1 className="text-base font-semibold text-main-100">
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
                className="max-w-6xl min-h-144"
                footer={
                    <Button
                        className="rounded-xl px-4 py-2"
                        onClick={() => {
                            void handleSaveSettings();
                        }}
                    >
                        Сохранить
                    </Button>
                }
            >
                <SettingsView
                    ref={settingsViewRef}
                    themePreference={themePreference}
                    themeOptions={themeOptions}
                    setTheme={(themeId) => {
                        void setTheme(themeId);
                    }}
                />
            </Modal>
        </>
    );
}
