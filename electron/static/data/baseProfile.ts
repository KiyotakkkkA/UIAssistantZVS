import { UserProfile } from "../../../src/types/App";

export const defaultProfile: UserProfile = {
    themePreference: "dark-main",
    ollamaModel: "gpt-oss:20b",
    ollamaToken: "",
    telegramId: "",
    telegramBotToken: "",
    chatDriver: "ollama",
    assistantName: "Чарли",
    maxToolCallsPerResponse: 10,
    userName: "Пользователь",
    userPrompt: "",
    userLanguage: "Русский",
    activeDialogId: null,
    activeProjectId: null,
    activeScenarioId: null,
    lastActiveTab: "dialogs",
};
