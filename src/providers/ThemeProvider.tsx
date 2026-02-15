import {
    useCallback,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from "react";
import type { BootData, ThemeListItem, UserProfile } from "../types/App";
import { ThemeContext, type ThemeContextValue } from "./ThemeContext";

const DEFAULT_THEME_ID = "dark-main";

const defaultBootData: BootData = {
    userProfile: {
        themePreference: DEFAULT_THEME_ID,
    },
    preferredThemeData: {},
};

const applyThemePalette = (palette: Record<string, string>) => {
    const root = document.documentElement;

    Object.entries(palette).forEach(([variableName, variableValue]) => {
        root.style.setProperty(variableName, variableValue);
    });
};

type ThemeProviderProps = {
    children: ReactNode;
};

export function ThemeProvider({ children }: ThemeProviderProps) {
    const [isReady, setIsReady] = useState(false);
    const [userProfile, setUserProfile] = useState<UserProfile>(
        defaultBootData.userProfile,
    );
    const [themesList, setThemesList] = useState<ThemeListItem[]>([]);
    const [preferredThemeData, setPreferredThemeData] = useState<
        Record<string, string>
    >(defaultBootData.preferredThemeData);

    const updateUserProfile = useCallback(
        async (nextProfile: Partial<UserProfile>) => {
            const api = window.appApi;

            if (!api) {
                const mergedProfile: UserProfile = {
                    ...userProfile,
                    ...nextProfile,
                };
                setUserProfile(mergedProfile);
                return mergedProfile;
            }

            const updatedProfile = await api.updateUserProfile(nextProfile);
            setUserProfile(updatedProfile);
            return updatedProfile;
        },
        [userProfile],
    );

    const setTheme = useCallback(
        async (themeId: string) => {
            const api = window.appApi;

            if (!api) {
                await updateUserProfile({ themePreference: themeId });
                return;
            }

            const selectedTheme = await api.getThemeData(themeId);
            applyThemePalette(selectedTheme.palette);
            setPreferredThemeData(selectedTheme.palette);
            await updateUserProfile({ themePreference: themeId });
        },
        [updateUserProfile],
    );

    useEffect(() => {
        let isMounted = true;

        const bootstrap = async () => {
            const api = window.appApi;

            if (!api) {
                if (isMounted) {
                    setIsReady(true);
                }
                return;
            }

            const [bootData, nextThemesList] = await Promise.all([
                api.getBootData(),
                api.getThemesList(),
            ]);

            if (!isMounted) {
                return;
            }

            setUserProfile(bootData.userProfile);
            setPreferredThemeData(bootData.preferredThemeData);
            setThemesList(nextThemesList);
            applyThemePalette(bootData.preferredThemeData);
            setIsReady(true);
        };

        bootstrap();

        return () => {
            isMounted = false;
        };
    }, []);

    const contextValue = useMemo<ThemeContextValue>(
        () => ({
            isReady,
            userProfile,
            themesList,
            preferredThemeData,
            setTheme,
            updateUserProfile,
        }),
        [
            isReady,
            userProfile,
            themesList,
            preferredThemeData,
            setTheme,
            updateUserProfile,
        ],
    );

    return (
        <ThemeContext.Provider value={contextValue}>
            {children}
        </ThemeContext.Provider>
    );
}
