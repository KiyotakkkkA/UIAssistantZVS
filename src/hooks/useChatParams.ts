import { useObserver } from "mobx-react-lite";
import { userProfileStore } from "../stores/userProfileStore";
import type { ChatDriver } from "../types/App";

export const useChatParams = () => {
    return useObserver(() => ({
        isReady: userProfileStore.isReady,
        chatDriver: userProfileStore.userProfile.chatDriver,
        ollamaModel: userProfileStore.userProfile.ollamaModel,
        ollamaToken: userProfileStore.userProfile.ollamaToken,
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
        setAssistantName: async (value: string) => {
            await userProfileStore.updateUserProfile({ assistantName: value });
        },
        setMaxToolCallsPerResponse: async (value: number) => {
            await userProfileStore.updateUserProfile({
                maxToolCallsPerResponse: value,
            });
        },
        saveChatParams: async (next: {
            chatDriver: ChatDriver;
            ollamaModel: string;
            ollamaToken: string;
            assistantName: string;
            maxToolCallsPerResponse: number;
        }) => {
            await userProfileStore.updateUserProfile({
                chatDriver: next.chatDriver,
                ollamaModel: next.ollamaModel,
                ollamaToken: next.ollamaToken,
                assistantName: next.assistantName,
                maxToolCallsPerResponse: next.maxToolCallsPerResponse,
            });
        },
    }));
};
