import { createContext } from "react";
import type { ThemeListItem, UserProfile } from "../types/App";

export type ThemeContextValue = {
    isReady: boolean;
    userProfile: UserProfile;
    themesList: ThemeListItem[];
    preferredThemeData: Record<string, string>;
    setTheme: (themeId: string) => Promise<void>;
    updateUserProfile: (
        nextProfile: Partial<UserProfile>,
    ) => Promise<UserProfile>;
};

export const ThemeContext = createContext<ThemeContextValue | null>(null);
