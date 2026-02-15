export type ChatDriver = "" | "ollama";

export type UserProfile = {
    themePreference: string;
    ollamaModel: string;
    ollamaToken: string;
    chatDriver: ChatDriver;
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
