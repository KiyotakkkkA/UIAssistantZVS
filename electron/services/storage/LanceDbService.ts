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

    async addVectors(
        vectorStorageId: string,
        rows: LanceVectorRow[],
    ): Promise<void> {
        if (!rows.length) {
            return;
        }

        const lancedb = await this.getLanceDbModule();
        const db = await lancedb.connect(this.vectorIndexPath);
        const tableName = this.toTableName(vectorStorageId);

        try {
            const table = await db.openTable(tableName);
            await table.add(rows);
            return;
        } catch {
            await db.createTable(tableName, rows);
        }
    }

    async search(
        vectorStorageId: string,
        embedding: number[],
        limit: number,
        dataPath?: string,
    ): Promise<LanceSearchResultRow[]> {
        if (!embedding.length) {
            return [];
        }

        let table: unknown;

        try {
            table = await this.openSearchTable(vectorStorageId, dataPath);
        } catch (error) {
            if (
                error instanceof Error &&
                /not found|does not exist|no such table/i.test(error.message)
            ) {
                return [];
            }

            throw error;
        }

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

    async resolveStorageDataPath(vectorStorageId: string): Promise<string> {
        const candidatePaths =
            await this.findStorageCandidatePaths(vectorStorageId);

        if (!candidatePaths.length) {
            return "";
        }

        const candidatesWithStats = await Promise.all(
            candidatePaths.map(async (candidatePath) => ({
                path: candidatePath,
                size: await this.getPathSizeBytes(candidatePath),
            })),
        );

        candidatesWithStats.sort((left, right) => right.size - left.size);
        return candidatesWithStats[0]?.path ?? "";
    }

    async getDataPathSizeBytes(dataPath: string): Promise<number> {
        const normalized = typeof dataPath === "string" ? dataPath.trim() : "";

        if (!normalized) {
            return 0;
        }

        return this.getPathSizeBytes(normalized);
    }

    async getStorageDataSizeBytes(vectorStorageId: string): Promise<number> {
        const candidatePaths =
            await this.findStorageCandidatePaths(vectorStorageId);

        if (!candidatePaths.length) {
            return 0;
        }

        const sizes = await Promise.all(
            candidatePaths.map((candidatePath) =>
                this.getPathSizeBytes(candidatePath),
            ),
        );

        return sizes.reduce((sum, current) => sum + current, 0);
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

    private async findStorageCandidatePaths(
        vectorStorageId: string,
    ): Promise<string[]> {
        const normalized = this.toTableName(vectorStorageId);

        let entries: Array<{
            name: string;
            isFile: () => boolean;
            isDirectory: () => boolean;
        }> = [];

        try {
            entries = await fs.readdir(this.vectorIndexPath, {
                withFileTypes: true,
            });
        } catch {
            return [];
        }

        return entries
            .filter((entry) => {
                const lowerName = entry.name.toLowerCase();

                return (
                    lowerName === normalized ||
                    lowerName === `${normalized}.lance` ||
                    lowerName.startsWith(`${normalized}_`) ||
                    lowerName.startsWith(`${normalized}.`)
                );
            })
            .map((entry) => path.join(this.vectorIndexPath, entry.name));
    }

    private async openSearchTable(
        vectorStorageId: string,
        dataPath?: string,
    ): Promise<unknown> {
        const lancedb = await this.getLanceDbModule();
        const normalizedDataPath =
            typeof dataPath === "string" ? dataPath.trim() : "";

        if (normalizedDataPath) {
            const tableNameFromPath = path
                .basename(normalizedDataPath)
                .replace(/\.lance$/i, "")
                .trim();
            const databasePathFromDataPath = path.dirname(normalizedDataPath);

            if (tableNameFromPath && databasePathFromDataPath) {
                try {
                    const db = await lancedb.connect(databasePathFromDataPath);
                    return await db.openTable(tableNameFromPath);
                } catch {
                    // fallback to default storage root and id-based table name
                }
            }
        }

        const db = await lancedb.connect(this.vectorIndexPath);
        const tableName = this.toTableName(vectorStorageId);
        return db.openTable(tableName);
    }
}
