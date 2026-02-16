import fs from "node:fs";
import path from "node:path";
import { createBaseDialog, defaultProfile } from "../static/data";
import { staticThemeEntries } from "../static/themes";

export class InitService {
    private readonly basePath: string;
    private readonly resourcesPath: string;
    private readonly themesPath: string;
    private readonly chatsPath: string;
    private readonly dialogsPath: string;
    private readonly projectsPath: string;
    private readonly filesPath: string;
    private readonly storageManifestPath: string;
    private readonly profilePath: string;

    constructor(basePath: string) {
        this.basePath = basePath;
        this.resourcesPath = path.join(this.basePath, "resources");
        this.themesPath = path.join(this.resourcesPath, "themes");
        this.chatsPath = path.join(this.resourcesPath, "chats");
        this.dialogsPath = path.join(this.chatsPath, "dialogs");
        this.projectsPath = path.join(this.chatsPath, "projects");
        this.filesPath = path.join(this.resourcesPath, "files");
        this.storageManifestPath = path.join(
            this.resourcesPath,
            "storage.json",
        );
        this.profilePath = path.join(this.resourcesPath, "profile.json");
    }

    initialize(): void {
        this.ensureDirectory(this.resourcesPath);
        this.ensureDirectory(this.themesPath);
        this.ensureProfile();
        this.ensureThemes();
        this.ensureChatsDirectory();
        this.ensureFilesStorage();
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
        this.ensureDirectory(this.dialogsPath);
        this.ensureDirectory(this.projectsPath);

        const dialogFiles = fs
            .readdirSync(this.dialogsPath)
            .filter((fileName) => fileName.endsWith(".json"));

        if (dialogFiles.length > 0) {
            return;
        }

        const baseDialog = createBaseDialog();
        const baseDialogPath = path.join(
            this.dialogsPath,
            `${baseDialog.id}.json`,
        );

        fs.writeFileSync(baseDialogPath, JSON.stringify(baseDialog, null, 2));
    }

    private ensureFilesStorage(): void {
        this.ensureDirectory(this.filesPath);

        if (!fs.existsSync(this.storageManifestPath)) {
            fs.writeFileSync(
                this.storageManifestPath,
                JSON.stringify({}, null, 2),
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
