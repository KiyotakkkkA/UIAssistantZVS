import fs from "node:fs";
import path from "node:path";
import { defaultProfile } from "../static/data";
import { staticThemesMap, staticThemesList } from "../static/themes";
import type {
    BootData,
    ThemeData,
    ThemeListItem,
    UserProfile,
} from "../../src/types/App";

export class UserDataService {
    private readonly resourcesPath: string;
    private readonly themesPath: string;
    private readonly profilePath: string;

    constructor(basePath: string) {
        this.resourcesPath = path.join(basePath, "resources");
        this.themesPath = path.join(this.resourcesPath, "themes");
        this.profilePath = path.join(this.resourcesPath, "profile.json");
    }

    getBootData(): BootData {
        const userProfile = this.readUserProfile();
        const preferredThemeData = this.resolveThemePalette(
            userProfile.themePreference,
        );

        return {
            userProfile,
            preferredThemeData,
        };
    }

    getThemesList(): ThemeListItem[] {
        const themes = this.readThemes();
        if (themes.length === 0) {
            return staticThemesList;
        }

        return themes.map((theme) => ({
            id: theme.id,
            name: theme.name,
        }));
    }

    getThemeData(themeId: string): ThemeData {
        const themes = this.readThemes();
        const preferredTheme = themes.find((theme) => theme.id === themeId);

        if (preferredTheme) {
            return preferredTheme;
        }

        const fallbackTheme = staticThemesMap[themeId];
        if (fallbackTheme) {
            return fallbackTheme;
        }

        return staticThemesMap[defaultProfile.themePreference];
    }

    updateUserProfile(nextProfile: Partial<UserProfile>): UserProfile {
        const currentProfile = this.readUserProfile();
        const mergedProfile: UserProfile = {
            ...currentProfile,
            ...nextProfile,
        };

        fs.writeFileSync(
            this.profilePath,
            JSON.stringify(mergedProfile, null, 2),
        );
        return mergedProfile;
    }

    private readUserProfile(): UserProfile {
        if (!fs.existsSync(this.profilePath)) {
            return defaultProfile;
        }

        try {
            const rawProfile = fs.readFileSync(this.profilePath, "utf-8");
            const parsed = JSON.parse(rawProfile) as UserProfile;

            if (typeof parsed.themePreference === "string") {
                return parsed;
            }

            return defaultProfile;
        } catch {
            return defaultProfile;
        }
    }

    private readThemes(): ThemeData[] {
        if (!fs.existsSync(this.themesPath)) {
            return [];
        }

        const files = fs
            .readdirSync(this.themesPath)
            .filter((fileName) => fileName.endsWith(".json"));

        const result: ThemeData[] = [];

        for (const fileName of files) {
            const filePath = path.join(this.themesPath, fileName);

            try {
                const rawTheme = fs.readFileSync(filePath, "utf-8");
                const parsed = JSON.parse(rawTheme) as ThemeData;

                if (
                    typeof parsed.id === "string" &&
                    typeof parsed.name === "string" &&
                    typeof parsed.palette === "object" &&
                    parsed.palette !== null
                ) {
                    result.push(parsed);
                }
            } catch {
                continue;
            }
        }

        return result;
    }

    private resolveThemePalette(themeId: string): Record<string, string> {
        const themes = this.readThemes();
        const preferredTheme = themes.find((theme) => theme.id === themeId);

        if (preferredTheme) {
            return preferredTheme.palette;
        }

        return staticThemesMap[defaultProfile.themePreference].palette;
    }
}
