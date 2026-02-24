export type ChatDriver = "" | "ollama";
export type VoiceRecognitionDriver = "" | "mistral";

export type WorkspaceTab = "dialogs" | "projects" | "scenario";

export type UserProfile = {
    themePreference: string;
    ollamaModel: string;
    ollamaToken: string;
    mistralVoiceRecModel: string;
    mistralToken: string;
    voiceRecognitionDriver: VoiceRecognitionDriver;
    telegramId: string;
    telegramBotToken: string;
    chatDriver: ChatDriver;
    assistantName: string;
    maxToolCallsPerResponse: number;
    userName: string;
    userPrompt: string;
    userLanguage: string;
    activeDialogId: string | null;
    activeProjectId: string | null;
    activeScenarioId: string | null;
    lastActiveTab: WorkspaceTab;
};

export type ThemeData = {
    id: string;
    name: string;
    palette: Record<string, string>;
};

export type ThemeListItem = {
    id: string;
    name: string;
};

export type BootData = {
    userProfile: UserProfile;
    preferredThemeData: Record<string, string>;
};
