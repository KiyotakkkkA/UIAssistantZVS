import fs from "node:fs";
import path from "node:path";
import { defaultProfile } from "../static/data";
import { staticThemeEntries } from "../static/themes";
import type { ElectronPaths } from "../paths";

export class InitService {
    private readonly resourcesPath: string;
    private readonly themesPath: string;
    private readonly filesPath: string;
    private readonly profilePath: string;
    private readonly databasePath: string;

    constructor(paths: ElectronPaths) {
        this.resourcesPath = paths.resourcesPath;
        this.themesPath = paths.themesPath;
        this.filesPath = paths.filesPath;
        this.profilePath = paths.profilePath;
        this.databasePath = paths.databasePath;
    }

    initialize(): void {
        this.ensureDirectory(this.resourcesPath);
        this.ensureDirectory(this.themesPath);
        this.ensureDirectory(this.filesPath);
        this.ensureDatabase(this.databasePath);
        this.ensureProfile();
        this.ensureThemes();
    }

    private ensureDirectory(targetPath: string): void {
        if (!fs.existsSync(targetPath)) {
            fs.mkdirSync(targetPath, { recursive: true });
        }
    }

    private ensureDatabase(databasePath: string): void {
        if (!fs.existsSync(databasePath)) {
            fs.writeFileSync(databasePath, "");
        }
    }

    private ensureProfile(): void {
        if (!fs.existsSync(this.profilePath)) {
            fs.writeFileSync(
                this.profilePath,
                JSON.stringify(defaultProfile, null, 2),
            );
        }
    }

    private ensureThemes(): void {
        for (const entry of staticThemeEntries) {
            const themeFilePath = path.join(this.themesPath, entry.fileName);

            if (!fs.existsSync(themeFilePath)) {
                fs.writeFileSync(
                    themeFilePath,
                    JSON.stringify(entry.data, null, 2),
                );
            }
        }
    }
}
