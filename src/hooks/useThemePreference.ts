import { useCallback, useEffect, useState } from "react";

export type ThemePreference = "system" | "light" | "dark";

const THEME_STORAGE_KEY = "assistant-zvs.theme";

const isThemePreference = (value: string | null): value is ThemePreference =>
    value === "system" || value === "light" || value === "dark";

const resolveTheme = (preference: ThemePreference): "light" | "dark" => {
    if (preference === "light" || preference === "dark") {
        return preference;
    }

    return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
};

const applyResolvedTheme = (preference: ThemePreference) => {
    const resolved = resolveTheme(preference);
    const root = document.documentElement;

    root.dataset.theme = resolved;
    root.style.colorScheme = resolved;
};

export function useThemePreference() {
    const [themePreference, setThemePreference] =
        useState<ThemePreference>("system");

    useEffect(() => {
        const saved = localStorage.getItem(THEME_STORAGE_KEY);

        if (isThemePreference(saved)) {
            setThemePreference(saved);
            applyResolvedTheme(saved);
            return;
        }

        applyResolvedTheme("system");
    }, []);

    useEffect(() => {
        if (themePreference !== "system") {
            return;
        }

        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        const onChange = () => applyResolvedTheme("system");

        mediaQuery.addEventListener("change", onChange);
        return () => mediaQuery.removeEventListener("change", onChange);
    }, [themePreference]);

    const setTheme = useCallback((nextTheme: ThemePreference) => {
        setThemePreference(nextTheme);
        localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
        applyResolvedTheme(nextTheme);
    }, []);

    return {
        themePreference,
        setTheme,
    };
}
