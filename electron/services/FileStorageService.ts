import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import type {
    FileManifestEntry,
    SavedFileRecord,
    UploadedFileData,
} from "../../src/types/ElectronApi";

type FileManifest = Record<string, FileManifestEntry>;

export class FileStorageService {
    constructor(
        private readonly filesPath: string,
        private readonly manifestPath: string,
    ) {}

    saveFiles(files: UploadedFileData[]): SavedFileRecord[] {
        const manifest = this.readManifest();
        const saved: SavedFileRecord[] = [];

        for (const file of files) {
            const fileId = randomUUID().replace(/-/g, "");
            const fileExt = path.extname(file.name || "");
            const encryptedName = `${fileId}${fileExt}`;
            const absolutePath = path.join(this.filesPath, encryptedName);
            const buffer = this.parseDataUrl(file.dataUrl);

            fs.writeFileSync(absolutePath, buffer);

            manifest[fileId] = {
                path: absolutePath,
                originalName: file.name,
                size: Number.isFinite(file.size)
                    ? file.size
                    : buffer.byteLength,
                savedAt: new Date().toISOString(),
            };

            saved.push({
                id: fileId,
                ...manifest[fileId],
            });
        }

        this.writeManifest(manifest);
        return saved;
    }

    getFilesByIds(fileIds: string[]): SavedFileRecord[] {
        const manifest = this.readManifest();

        return fileIds
            .map((fileId) => {
                const entry = manifest[fileId];

                if (!entry) {
                    return null;
                }

                return {
                    id: fileId,
                    ...entry,
                } satisfies SavedFileRecord;
            })
            .filter(Boolean) as SavedFileRecord[];
    }

    getFileById(fileId: string): SavedFileRecord | null {
        const manifest = this.readManifest();
        const entry = manifest[fileId];

        if (!entry) {
            return null;
        }

        return {
            id: fileId,
            ...entry,
        };
    }

    deleteFilesByIds(fileIds: string[]): void {
        if (!fileIds.length) {
            return;
        }

        const manifest = this.readManifest();

        for (const fileId of fileIds) {
            const entry = manifest[fileId];

            if (!entry) {
                continue;
            }

            if (fs.existsSync(entry.path)) {
                fs.unlinkSync(entry.path);
            }

            delete manifest[fileId];
        }

        this.writeManifest(manifest);
    }

    private parseDataUrl(dataUrl: string): Buffer {
        if (typeof dataUrl !== "string") {
            return Buffer.from("");
        }

        const marker = ";base64,";
        const markerIndex = dataUrl.indexOf(marker);

        if (markerIndex === -1) {
            return Buffer.from(dataUrl);
        }

        const base64 = dataUrl.slice(markerIndex + marker.length);
        return Buffer.from(base64, "base64");
    }

    private ensureStorage(): void {
        if (!fs.existsSync(this.filesPath)) {
            fs.mkdirSync(this.filesPath, { recursive: true });
        }

        if (!fs.existsSync(this.manifestPath)) {
            fs.writeFileSync(this.manifestPath, JSON.stringify({}, null, 2));
        }
    }

    private readManifest(): FileManifest {
        this.ensureStorage();

        try {
            const rawManifest = fs.readFileSync(this.manifestPath, "utf-8");
            const parsed = JSON.parse(rawManifest) as FileManifest;

            if (
                !parsed ||
                typeof parsed !== "object" ||
                Array.isArray(parsed)
            ) {
                return {};
            }

            return parsed;
        } catch {
            return {};
        }
    }

    private writeManifest(manifest: FileManifest): void {
        this.ensureStorage();
        fs.writeFileSync(this.manifestPath, JSON.stringify(manifest, null, 2));
    }
}
