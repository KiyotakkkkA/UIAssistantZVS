import { useRef, useState } from "react";
import { Icon } from "@iconify/react";
import { useTheme, useToasts } from "../../../../hooks";
import { toolsStore } from "../../../../stores/toolsStore";
import { Button, Modal } from "../../atoms";
import { ToolPackageCard } from "../../molecules/cards";
import { SettingsView, type SettingsViewHandle } from "../settings";

type ChatHeaderProps = {
    title?: string;
    onOpenDocuments?: () => void;
};

export function ChatHeader({
    title = "Чат с моделью",
    onOpenDocuments,
}: ChatHeaderProps) {
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isToolsOpen, setIsToolsOpen] = useState(false);
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
                        {title}
                    </h1>
                </div>
                <div className="flex items-center gap-2">
                    {onOpenDocuments ? (
                        <Button
                            label="Документы"
                            className="px-3 py-2 text-xs"
                            onClick={onOpenDocuments}
                        >
                            <span className="inline-flex items-center gap-1">
                                <Icon
                                    icon="mdi:file-document-multiple-outline"
                                    width="16"
                                    height="16"
                                />
                                Документы
                            </span>
                        </Button>
                    ) : null}
                    <Button label="Search" className="p-2">
                        <Icon icon="mdi:magnify" width="16" height="16" />
                    </Button>
                    <Button
                        label="Menu"
                        className="p-2"
                        onClick={() => setIsToolsOpen(true)}
                    >
                        <Icon icon="mdi:tools" width="16" height="16" />
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

            <Modal
                open={isToolsOpen}
                onClose={() => setIsToolsOpen(false)}
                title="Пакеты инструментов"
                className="max-w-6xl min-h-144"
            >
                <div className="space-y-4">
                    {toolsStore.packages.map((pkg) => (
                        <ToolPackageCard key={pkg.id} pkg={pkg} />
                    ))}
                </div>
            </Modal>
        </>
    );
}
