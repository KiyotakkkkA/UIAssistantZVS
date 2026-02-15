import fs from "node:fs";
import path from "node:path";
import { defaultProfile } from "../static/data";
import { staticThemeEntries } from "../static/themes";

export class InitService {
    private readonly basePath: string;
    private readonly resourcesPath: string;
    private readonly themesPath: string;
    private readonly chatsPath: string;
    private readonly dialogsPath: string;
    private readonly profilePath: string;

    constructor(basePath: string) {
        this.basePath = basePath;
        this.resourcesPath = path.join(this.basePath, "resources");
        this.themesPath = path.join(this.resourcesPath, "themes");
        this.chatsPath = path.join(this.resourcesPath, "chats");
        this.dialogsPath = path.join(this.chatsPath, "dialogs");
        this.profilePath = path.join(this.resourcesPath, "profile.json");
    }

    initialize(): void {
        this.ensureDirectory(this.resourcesPath);
        this.ensureDirectory(this.themesPath);
        this.ensureProfile();
        this.ensureThemes();
        this.ensureChatsDirectory();
    }

    private ensureDirectory(targetPath: string): void {
        if (!fs.existsSync(targetPath)) {
            fs.mkdirSync(targetPath, { recursive: true });
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

    private ensureChatsDirectory(): void {
        this.ensureDirectory(this.chatsPath);

        if (!fs.existsSync(this.dialogsPath)) {
            fs.mkdirSync(this.dialogsPath);
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
