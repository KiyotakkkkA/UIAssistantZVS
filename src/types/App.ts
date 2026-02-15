export type UserProfile = {
    themePreference: string;
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
