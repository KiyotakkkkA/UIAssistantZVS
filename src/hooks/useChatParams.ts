import { useCallback } from "react";
import { useObserver } from "mobx-react-lite";
import { userProfileStore } from "../stores/userProfileStore";
import type { ChatDriver, VoiceRecognitionDriver } from "../types/App";

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

    const setMistralVoiceRecModel = useCallback(async (value: string) => {
        await userProfileStore.updateUserProfile({
            mistralVoiceRecModel: value,
        });
    }, []);

    const setMistralToken = useCallback(async (value: string) => {
        await userProfileStore.updateUserProfile({ mistralToken: value });
    }, []);

    const setVoiceRecognitionDriver = useCallback(
        async (driver: VoiceRecognitionDriver) => {
            await userProfileStore.updateUserProfile({
                voiceRecognitionDriver: driver,
            });
        },
        [],
    );

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
        mistralVoiceRecModel: userProfileStore.userProfile.mistralVoiceRecModel,
        mistralToken: userProfileStore.userProfile.mistralToken,
        voiceRecognitionDriver:
            userProfileStore.userProfile.voiceRecognitionDriver,
        telegramId: userProfileStore.userProfile.telegramId,
        telegramBotToken: userProfileStore.userProfile.telegramBotToken,
        assistantName: userProfileStore.userProfile.assistantName,
        maxToolCallsPerResponse:
            userProfileStore.userProfile.maxToolCallsPerResponse,
        setChatDriver,
        setOllamaModel,
        setOllamaToken,
        setMistralVoiceRecModel,
        setMistralToken,
        setVoiceRecognitionDriver,
        setTelegramId,
        setTelegramBotToken,
        setAssistantName,
        setMaxToolCallsPerResponse,
    }));
};
