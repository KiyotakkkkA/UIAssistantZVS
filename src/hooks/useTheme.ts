import { useMemo } from "react";
import { useThemeContext } from "../providers";

export const useTheme = () => {
    const { isReady, userProfile, themesList, preferredThemeData, setTheme } =
        useThemeContext();

    const themeOptions = useMemo(
        () =>
            themesList.map((theme) => ({
                value: theme.id,
                label: theme.name,
            })),
        [themesList],
    );

    return {
        isReady,
        themePreference: userProfile.themePreference,
        preferredThemeData,
        themeOptions,
        setTheme,
    };
};
