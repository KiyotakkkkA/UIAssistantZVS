/// <reference types="vite/client" />

import type {
    BootData,
    ThemeData,
    ThemeListItem,
    UserProfile,
} from "./types/App";

interface ImportMetaEnv {}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}

declare global {
    interface Window {
        appApi?: {
            getBootData: () => Promise<BootData>;
            getThemesList: () => Promise<ThemeListItem[]>;
            getThemeData: (themeId: string) => Promise<ThemeData>;
            updateUserProfile: (
                nextProfile: Partial<UserProfile>,
            ) => Promise<UserProfile>;
        };
    }
}

export {};
