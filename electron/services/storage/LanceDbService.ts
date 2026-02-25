type LanceDbModule = typeof import("@lancedb/lancedb");

type VectorRow = {
    id: string;
    vector: number[];
    text: string;
    fileId: string;
    fileName: string;
    chunkIndex: number;
    vectorStorageId: string;
    createdAt: string;
};

type SearchResultRow = {
    id: string;
    text: string;
    fileId: string;
    fileName: string;
    chunkIndex: number;
    _distance?: number;
    _score?: number;
};

export class LanceDbService {
    private lancedbModule: LanceDbModule | null = null;

    constructor(private readonly vectorIndexPath: string) {}

    async addVectors(
        vectorStorageId: string,
        rows: VectorRow[],
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
    ): Promise<SearchResultRow[]> {
        if (!embedding.length) {
            return [];
        }

        const lancedb = await this.getLanceDbModule();
        const db = await lancedb.connect(this.vectorIndexPath);
        const tableName = this.toTableName(vectorStorageId);

        let table: unknown;

        try {
            table = await db.openTable(tableName);
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
                        toArray: () => Promise<SearchResultRow[]>;
                    };
                };
            }
        )
            .search(embedding)
            .limit(limited)
            .toArray();

        return Array.isArray(results) ? results : [];
    }

    private toTableName(vectorStorageId: string): string {
        const normalized = vectorStorageId
            .toLowerCase()
            .replace(/[^a-z0-9_]/g, "_");

        return `vs_${normalized}`;
    }

    private async getLanceDbModule(): Promise<LanceDbModule> {
        if (this.lancedbModule) {
            return this.lancedbModule;
        }

        this.lancedbModule = await import("@lancedb/lancedb");
        return this.lancedbModule;
    }
}
