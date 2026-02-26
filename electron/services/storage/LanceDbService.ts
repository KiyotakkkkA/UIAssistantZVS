import fs from "node:fs/promises";
import path from "node:path";

type LanceDbModule = typeof import("@lancedb/lancedb");
import type {
    LanceSearchResultRow,
    LanceVectorRow,
} from "../../../src/types/Storage";

export class LanceDbService {
    private lancedbModule: LanceDbModule | null = null;

    constructor(private readonly vectorIndexPath: string) {}

    async addVectors(dataPath: string, rows: LanceVectorRow[]): Promise<void> {
        if (!rows.length) {
            return;
        }

        const normalizedPath = this.normalizeDataPath(dataPath);
        const { databasePath, tableName } =
            await this.getDataPathReferenceOrThrow(normalizedPath);

        const lancedb = await this.getLanceDbModule();
        const db = await lancedb.connect(databasePath);

        try {
            const table = await db.openTable(tableName);
            await table.add(rows);
            return;
        } catch {
            await db.createTable(tableName, rows);
        }
    }

    async search(
        dataPath: string,
        embedding: number[],
        limit: number,
    ): Promise<LanceSearchResultRow[]> {
        if (!embedding.length) {
            return [];
        }

        const normalizedPath = this.normalizeDataPath(dataPath);
        const { databasePath, tableName } =
            await this.getDataPathReferenceOrThrow(normalizedPath);
        const lancedb = await this.getLanceDbModule();
        const db = await lancedb.connect(databasePath);
        const table = await db.openTable(tableName);

        const limited = Number.isFinite(limit)
            ? Math.max(1, Math.min(20, Math.floor(limit)))
            : 5;

        const results = await (
            table as {
                search: (vector: number[]) => {
                    limit: (value: number) => {
                        toArray: () => Promise<LanceSearchResultRow[]>;
                    };
                };
            }
        )
            .search(embedding)
            .limit(limited)
            .toArray();

        return Array.isArray(results) ? results : [];
    }

    getDefaultDataPath(vectorStorageId: string): string {
        const normalized = this.toTableName(vectorStorageId);
        return path.join(this.vectorIndexPath, `${normalized}.lance`);
    }

    async getDataPathSizeBytes(dataPath: string): Promise<number> {
        const normalized = typeof dataPath === "string" ? dataPath.trim() : "";

        if (!normalized) {
            return 0;
        }

        return this.getPathSizeBytes(normalized);
    }

    async resolveDataPathReference(dataPath: string): Promise<{
        databasePath: string;
        tableName: string;
        dataPath: string;
    } | null> {
        const normalized = this.normalizeDataPath(dataPath);

        if (!normalized) {
            return null;
        }

        let stats;

        try {
            stats = await fs.stat(normalized);
        } catch {
            return null;
        }

        if (!stats.isDirectory()) {
            return null;
        }

        const baseName = path.basename(normalized);

        if (/\.lance$/i.test(baseName)) {
            return {
                databasePath: path.dirname(normalized),
                tableName: baseName.replace(/\.lance$/i, ""),
                dataPath: normalized,
            };
        }

        let entries: Array<{
            name: string;
            isDirectory: () => boolean;
        }> = [];

        try {
            entries = await fs.readdir(normalized, { withFileTypes: true });
        } catch {
            return null;
        }

        const tableDirs = entries
            .filter(
                (entry) => entry.isDirectory() && /\.lance$/i.test(entry.name),
            )
            .map((entry) => entry.name);

        if (!tableDirs.length) {
            return null;
        }

        if (tableDirs.length > 1) {
            return null;
        }

        const selectedTableDirName = tableDirs[0];

        const selectedDataPath = path.join(normalized, selectedTableDirName);

        return {
            databasePath: normalized,
            tableName: selectedTableDirName.replace(/\.lance$/i, ""),
            dataPath: selectedDataPath,
        };
    }

    private toTableName(vectorStorageId: string): string {
        const normalized = vectorStorageId
            .toLowerCase()
            .replace(/[^a-z0-9_]/g, "_");

        return `${normalized}`;
    }

    private async getLanceDbModule(): Promise<LanceDbModule> {
        if (this.lancedbModule) {
            return this.lancedbModule;
        }

        this.lancedbModule = await import("@lancedb/lancedb");
        return this.lancedbModule;
    }

    private async getPathSizeBytes(targetPath: string): Promise<number> {
        let stats;

        try {
            stats = await fs.stat(targetPath);
        } catch {
            return 0;
        }

        if (stats.isFile()) {
            return stats.size;
        }

        if (!stats.isDirectory()) {
            return 0;
        }

        let entries: Array<{
            name: string;
            isFile: () => boolean;
            isDirectory: () => boolean;
        }> = [];

        try {
            entries = await fs.readdir(targetPath, { withFileTypes: true });
        } catch {
            return 0;
        }

        if (!entries.length) {
            return 0;
        }

        const nestedSizes = await Promise.all(
            entries.map((entry) =>
                this.getPathSizeBytes(path.join(targetPath, entry.name)),
            ),
        );

        return nestedSizes.reduce((sum, current) => sum + current, 0);
    }

    private normalizeDataPath(dataPath: string): string {
        return typeof dataPath === "string" ? dataPath.trim() : "";
    }

    private async getDataPathReferenceOrThrow(dataPath: string): Promise<{
        databasePath: string;
        tableName: string;
        dataPath: string;
    }> {
        const resolved = await this.resolveDataPathReference(dataPath);

        if (!resolved) {
            throw new Error(
                "Некорректный путь vector storage: укажите папку таблицы .lance или директорию с единственной таблицей .lance",
            );
        }

        return resolved;
    }
}
