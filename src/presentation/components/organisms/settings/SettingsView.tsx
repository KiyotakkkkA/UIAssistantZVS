import {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useMemo,
    useState,
    type ReactNode,
} from "react";
import { Icon } from "@iconify/react";
import { useChatParams, useUserProfile } from "../../../../hooks";
import type { ChatDriver } from "../../../../types/App";
import { SettingsChatPanel } from "./SettingsChatPanel";
import { SettingsInterfacePanel } from "./SettingsInterfacePanel";
import { SettingsProfilePanel } from "./SettingsProfilePanel";

type SettingsRoute = "interface" | "chat" | "profile";

interface SettingsViewProps {
    themePreference: string;
    themeOptions: { value: string; label: string }[];
    setTheme: (themeId: string) => void;
}

export type SettingsViewHandle = {
    save: () => Promise<{ saved: boolean; scope: "chat" | "profile" | "general" }>;
};

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

export const SettingsView = forwardRef<SettingsViewHandle, SettingsViewProps>(
    ({ themePreference, themeOptions, setTheme }, ref) => {
        const [activeRoute, setActiveRoute] =
            useState<SettingsRoute>("interface");
        const { chatDriver, ollamaModel, ollamaToken, saveChatParams } =
            useChatParams();
        const { userProfile, updateUserProfile } = useUserProfile();

        const [chatDraft, setChatDraft] = useState<{
            chatDriver: ChatDriver;
            ollamaModel: string;
            ollamaToken: string;
        }>({
            chatDriver,
            ollamaModel,
            ollamaToken,
        });

        const [profileDraft, setProfileDraft] = useState<{
            userName: string;
            userPrompt: string;
        }>({
            userName: userProfile.userName,
            userPrompt: userProfile.userPrompt,
        });

        useEffect(() => {
            setChatDraft({
                chatDriver,
                ollamaModel,
                ollamaToken,
            });
        }, [chatDriver, ollamaModel, ollamaToken]);

        useEffect(() => {
            setProfileDraft({
                userName: userProfile.userName,
                userPrompt: userProfile.userPrompt,
            });
        }, [userProfile.userName, userProfile.userPrompt]);

        useImperativeHandle(
            ref,
            () => ({
                save: async () => {
                    if (activeRoute === "chat") {
                        await saveChatParams(chatDraft);
                        return { saved: true, scope: "chat" };
                    }

                    if (activeRoute === "profile") {
                        await updateUserProfile({
                            userName:
                                profileDraft.userName.trim() || "Пользователь",
                            userPrompt: profileDraft.userPrompt,
                        });
                        return { saved: true, scope: "profile" };
                    }

                    return { saved: false, scope: "general" };
                },
            }),
            [activeRoute, chatDraft, profileDraft, saveChatParams, updateUserProfile],
        );

        const renderedPanel: Record<SettingsRoute, ReactNode> = useMemo(
            () => ({
                interface: (
                    <SettingsInterfacePanel
                        themePreference={themePreference}
                        themeOptions={themeOptions}
                        setTheme={setTheme}
                    />
                ),
                chat: (
                    <SettingsChatPanel
                        chatDriver={chatDraft.chatDriver}
                        ollamaModel={chatDraft.ollamaModel}
                        ollamaToken={chatDraft.ollamaToken}
                        setChatDriver={(driver) => {
                            setChatDraft((prev) => ({
                                ...prev,
                                chatDriver: driver,
                            }));
                        }}
                        setOllamaModel={(value) => {
                            setChatDraft((prev) => ({
                                ...prev,
                                ollamaModel: value,
                            }));
                        }}
                        setOllamaToken={(value) => {
                            setChatDraft((prev) => ({
                                ...prev,
                                ollamaToken: value,
                            }));
                        }}
                    />
                ),
                profile: (
                    <SettingsProfilePanel
                        userName={profileDraft.userName}
                        userPrompt={profileDraft.userPrompt}
                        setUserName={(value) => {
                            setProfileDraft((prev) => ({
                                ...prev,
                                userName: value,
                            }));
                        }}
                        setUserPrompt={(value) => {
                            setProfileDraft((prev) => ({
                                ...prev,
                                userPrompt: value,
                            }));
                        }}
                    />
                ),
            }),
            [chatDraft, profileDraft, setTheme, themeOptions, themePreference],
        );

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
    },
);

SettingsView.displayName = "SettingsView";
