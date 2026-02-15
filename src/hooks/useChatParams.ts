import { useObserver } from "mobx-react-lite";
import { userProfileStore } from "../stores/userProfileStore";
import type { ChatDriver } from "../types/App";

export const useChatParams = () => {
    return useObserver(() => ({
        isReady: userProfileStore.isReady,
        chatDriver: userProfileStore.userProfile.chatDriver,
        ollamaModel: userProfileStore.userProfile.ollamaModel,
        ollamaToken: userProfileStore.userProfile.ollamaToken,
        setChatDriver: async (driver: ChatDriver) => {
            await userProfileStore.updateUserProfile({ chatDriver: driver });
        },
        setOllamaModel: async (value: string) => {
            await userProfileStore.updateUserProfile({ ollamaModel: value });
        },
        setOllamaToken: async (value: string) => {
            await userProfileStore.updateUserProfile({ ollamaToken: value });
        },
        saveChatParams: async (next: {
            chatDriver: ChatDriver;
            ollamaModel: string;
            ollamaToken: string;
        }) => {
            await userProfileStore.updateUserProfile({
                chatDriver: next.chatDriver,
                ollamaModel: next.ollamaModel,
                ollamaToken: next.ollamaToken,
            });
        },
    }));
};
