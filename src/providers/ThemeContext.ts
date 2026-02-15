import { createContext } from "react";
import type { ThemeListItem } from "../types/App";

export type ThemeContextValue = {
    isReady: boolean;
    themePreference: string;
    themesList: ThemeListItem[];
    preferredThemeData: Record<string, string>;
    setTheme: (themeId: string) => Promise<void>;
};

export const ThemeContext = createContext<ThemeContextValue | null>(null);
