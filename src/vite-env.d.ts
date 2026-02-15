/// <reference types="vite/client" />

import type {
    BootData,
    ThemeData,
    ThemeListItem,
    UserProfile,
} from "./types/App";

interface ImportMetaEnv {
    readonly VITE_OLLAMA_BASE_URL?: string;
    readonly VITE_OLLAMA_MODEL?: string;
    readonly VITE_OLLAMA_TOKEN?: string;
}

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
