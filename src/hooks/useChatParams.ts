import { useCallback } from "react";
import { useObserver } from "mobx-react-lite";
import { userProfileStore } from "../stores/userProfileStore";
import type { ChatDriver } from "../types/App";

export const useChatParams = () => {
    const setChatDriver = useCallback(async (driver: ChatDriver) => {
        await userProfileStore.updateUserProfile({ chatDriver: driver });
    }, []);

    const setOllamaModel = useCallback(async (value: string) => {
        await userProfileStore.updateUserProfile({ ollamaModel: value });
    }, []);

    const setOllamaToken = useCallback(async (value: string) => {
        await userProfileStore.updateUserProfile({ ollamaToken: value });
    }, []);

    const setTelegramId = useCallback(async (value: string) => {
        await userProfileStore.updateUserProfile({ telegramId: value });
    }, []);

    const setTelegramBotToken = useCallback(async (value: string) => {
        await userProfileStore.updateUserProfile({ telegramBotToken: value });
    }, []);

    const setAssistantName = useCallback(async (value: string) => {
        await userProfileStore.updateUserProfile({ assistantName: value });
    }, []);

    const setMaxToolCallsPerResponse = useCallback(async (value: number) => {
        await userProfileStore.updateUserProfile({
            maxToolCallsPerResponse: value,
        });
    }, []);

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
        setChatDriver,
        setOllamaModel,
        setOllamaToken,
        setTelegramId,
        setTelegramBotToken,
        setAssistantName,
        setMaxToolCallsPerResponse,
    }));
};
