import { UserProfile } from "../../../src/types/App";

export const defaultProfile: UserProfile = {
    themePreference: "dark-main",
    ollamaModel: "gpt-oss:20b",
    ollamaToken: "",
    chatDriver: "ollama",
    assistantName: "Чарли",
    maxToolCallsPerResponse: 10,
    userName: "Пользователь",
    userPrompt: "",
    userLanguage: "Русский",
    activeDialogId: "",
    activeProjectId: null,
};
