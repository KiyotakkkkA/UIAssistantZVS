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
