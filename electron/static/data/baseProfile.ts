import { UserProfile } from "../../../src/types/App";

export const defaultProfile: UserProfile = {
    themePreference: "dark-main",
    ollamaModel: "gpt-oss:20b",
    ollamaToken: "",
    chatDriver: "ollama",
    userName: "Пользователь",
    userPrompt: "",
    activeDialogId: "",
};
