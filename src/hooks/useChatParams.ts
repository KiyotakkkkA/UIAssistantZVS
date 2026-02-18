import { useObserver } from "mobx-react-lite";
import { userProfileStore } from "../stores/userProfileStore";
import type { ChatDriver } from "../types/App";

export const useChatParams = () => {
    return useObserver(() => ({
        isReady: userProfileStore.isReady,
        chatDriver: userProfileStore.userProfile.chatDriver,
        ollamaModel: userProfileStore.userProfile.ollamaModel,
        ollamaToken: userProfileStore.userProfile.ollamaToken,
        telegramId: userProfileStore.userProfile.telegramId,
        telegramBotToken: userProfileStore.userProfile.telegramBotToken,
        assistantName: userProfileStore.userProfile.assistantName,
        maxToolCallsPerResponse:
            userProfileStore.userProfile.maxToolCallsPerResponse,
        setChatDriver: async (driver: ChatDriver) => {
            await userProfileStore.updateUserProfile({ chatDriver: driver });
        },
        setOllamaModel: async (value: string) => {
            await userProfileStore.updateUserProfile({ ollamaModel: value });
        },
        setOllamaToken: async (value: string) => {
            await userProfileStore.updateUserProfile({ ollamaToken: value });
        },
        setTelegramId: async (value: string) => {
            await userProfileStore.updateUserProfile({ telegramId: value });
        },
        setTelegramBotToken: async (value: string) => {
            await userProfileStore.updateUserProfile({
                telegramBotToken: value,
            });
        },
        setAssistantName: async (value: string) => {
            await userProfileStore.updateUserProfile({ assistantName: value });
        },
        setMaxToolCallsPerResponse: async (value: number) => {
            await userProfileStore.updateUserProfile({
                maxToolCallsPerResponse: value,
            });
        },
    }));
};
