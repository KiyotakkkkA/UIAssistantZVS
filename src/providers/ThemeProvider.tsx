import {
    useCallback,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from "react";
import { observer } from "mobx-react-lite";
import type { ThemeListItem } from "../types/App";
import { ThemeContext, type ThemeContextValue } from "./ThemeContext";
import { userProfileStore } from "../stores/userProfileStore";

const applyThemePalette = (palette: Record<string, string>) => {
    const root = document.documentElement;

    Object.entries(palette).forEach(([variableName, variableValue]) => {
        root.style.setProperty(variableName, variableValue);
    });
};

type ThemeProviderProps = {
    children: ReactNode;
};

export const ThemeProvider = observer(({ children }: ThemeProviderProps) => {
    const isUserProfileReady = userProfileStore.isReady;
    const themePreference = userProfileStore.userProfile.themePreference;

    const [isThemeReady, setIsThemeReady] = useState(false);
    const [themesList, setThemesList] = useState<ThemeListItem[]>([]);
    const [preferredThemeData, setPreferredThemeData] = useState<
        Record<string, string>
    >({});

    const setTheme = useCallback(async (themeId: string) => {
        const api = window.appApi;

        if (!api) {
            await userProfileStore.updateUserProfile({
                themePreference: themeId,
            });
            return;
        }

        const selectedTheme = await api.themes.getThemeData(themeId);
        applyThemePalette(selectedTheme.palette);
        setPreferredThemeData(selectedTheme.palette);
        await userProfileStore.updateUserProfile({
            themePreference: themeId,
        });
    }, []);

    useEffect(() => {
        void userProfileStore.initialize();
    }, []);

    useEffect(() => {
        let isMounted = true;

        const loadThemesList = async () => {
            const api = window.appApi;

            if (!api) {
                if (isMounted) {
                    setIsThemeReady(true);
                }
                return;
            }

            const nextThemesList = await api.themes.getThemesList();

            if (!isMounted) {
                return;
            }

            setThemesList(nextThemesList);
            setIsThemeReady(true);
        };

        loadThemesList();

        return () => {
            isMounted = false;
        };
    }, []);

    useEffect(() => {
        let isMounted = true;

        const syncThemePalette = async () => {
            const api = window.appApi;

            if (!api) {
                return;
            }

            const selectedTheme =
                await api.themes.getThemeData(themePreference);

            if (!isMounted) {
                return;
            }

            setPreferredThemeData(selectedTheme.palette);
            applyThemePalette(selectedTheme.palette);
        };

        if (isUserProfileReady) {
            syncThemePalette();
        }

        return () => {
            isMounted = false;
        };
    }, [isUserProfileReady, themePreference]);

    const contextValue = useMemo<ThemeContextValue>(
        () => ({
            isReady: isUserProfileReady && isThemeReady,
            themePreference,
            themesList,
            preferredThemeData,
            setTheme,
        }),
        [
            isUserProfileReady,
            isThemeReady,
            themePreference,
            themesList,
            preferredThemeData,
            setTheme,
        ],
    );

    return (
        <ThemeContext.Provider value={contextValue}>
            {children}
        </ThemeContext.Provider>
    );
});
