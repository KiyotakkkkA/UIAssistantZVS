import Database from "better-sqlite3";
import type {
    FileManifestEntry,
    SavedFileRecord,
} from "../../src/types/ElectronApi";

type CacheEntry = {
    collectedAt: number;
    ttlSeconds: number;
    expiresAt: number;
    data: unknown;
};

export class DatabaseService {
    private readonly database: Database.Database;

    constructor(private readonly databasePath: string) {
        this.database = new Database(this.databasePath);
        this.database.pragma("journal_mode = WAL");
        this.database.pragma("foreign_keys = ON");
        this.initializeSchema();
    }

    upsertDialogRaw(dialogId: string, payload: unknown): void {
        const payloadRecord =
            payload && typeof payload === "object"
                ? (payload as Record<string, unknown>)
                : {};
        const updatedAt =
            typeof payloadRecord.updatedAt === "string" &&
            payloadRecord.updatedAt
                ? payloadRecord.updatedAt
                : new Date().toISOString();

        this.database
            .prepare(
                `
                INSERT INTO dialogs (id, payload_json, updated_at)
                VALUES (?, ?, ?)
                ON CONFLICT(id) DO UPDATE SET
                    payload_json = excluded.payload_json,
                    updated_at = excluded.updated_at
                `,
            )
            .run(dialogId, JSON.stringify(payload), updatedAt);
    }

    getDialogsRaw(): unknown[] {
        const rows = this.database
            .prepare(
                `SELECT payload_json
                 FROM dialogs
                 ORDER BY updated_at DESC`,
            )
            .all() as Array<{ payload_json: string }>;

        return rows
            .map((row) => this.tryParseJson(row.payload_json))
            .filter((row) => row !== null);
    }

    deleteDialog(dialogId: string): void {
        this.database.prepare(`DELETE FROM dialogs WHERE id = ?`).run(dialogId);
    }

    upsertProjectRaw(projectId: string, payload: unknown): void {
        const payloadRecord =
            payload && typeof payload === "object"
                ? (payload as Record<string, unknown>)
                : {};
        const updatedAt =
            typeof payloadRecord.updatedAt === "string" &&
            payloadRecord.updatedAt
                ? payloadRecord.updatedAt
                : new Date().toISOString();

        this.database
            .prepare(
                `
                INSERT INTO projects (id, payload_json, updated_at)
                VALUES (?, ?, ?)
                ON CONFLICT(id) DO UPDATE SET
                    payload_json = excluded.payload_json,
                    updated_at = excluded.updated_at
                `,
            )
            .run(projectId, JSON.stringify(payload), updatedAt);
    }

    getProjectsRaw(): unknown[] {
        const rows = this.database
            .prepare(
                `SELECT payload_json
                 FROM projects
                 ORDER BY updated_at DESC`,
            )
            .all() as Array<{ payload_json: string }>;

        return rows
            .map((row) => this.tryParseJson(row.payload_json))
            .filter((row) => row !== null);
    }

    deleteProject(projectId: string): void {
        this.database
            .prepare(`DELETE FROM projects WHERE id = ?`)
            .run(projectId);
    }

    upsertScenarioRaw(scenarioId: string, payload: unknown): void {
        const payloadRecord =
            payload && typeof payload === "object"
                ? (payload as Record<string, unknown>)
                : {};
        const updatedAt =
            typeof payloadRecord.updatedAt === "string" &&
            payloadRecord.updatedAt
                ? payloadRecord.updatedAt
                : new Date().toISOString();

        this.database
            .prepare(
                `
                INSERT INTO scenarios (id, payload_json, updated_at)
                VALUES (?, ?, ?)
                ON CONFLICT(id) DO UPDATE SET
                    payload_json = excluded.payload_json,
                    updated_at = excluded.updated_at
                `,
            )
            .run(scenarioId, JSON.stringify(payload), updatedAt);
    }

    getScenariosRaw(): unknown[] {
        const rows = this.database
            .prepare(
                `SELECT payload_json
                 FROM scenarios
                 ORDER BY updated_at DESC`,
            )
            .all() as Array<{ payload_json: string }>;

        return rows
            .map((row) => this.tryParseJson(row.payload_json))
            .filter((row) => row !== null);
    }

    deleteScenario(scenarioId: string): void {
        this.database
            .prepare(`DELETE FROM scenarios WHERE id = ?`)
            .run(scenarioId);
    }

    upsertFile(fileId: string, entry: FileManifestEntry): void {
        this.database
            .prepare(
                `
                INSERT INTO files (id, path, original_name, size, saved_at)
                VALUES (?, ?, ?, ?, ?)
                ON CONFLICT(id) DO UPDATE SET
                    path = excluded.path,
                    original_name = excluded.original_name,
                    size = excluded.size,
                    saved_at = excluded.saved_at
                `,
            )
            .run(
                fileId,
                entry.path,
                entry.originalName,
                entry.size,
                entry.savedAt,
            );
    }

    getFilesByIds(fileIds: string[]): SavedFileRecord[] {
        if (!fileIds.length) {
            return [];
        }

        const placeholders = fileIds.map(() => "?").join(", ");
        const rows = this.database
            .prepare(
                `SELECT id, path, original_name, size, saved_at
                 FROM files
                 WHERE id IN (${placeholders})`,
            )
            .all(...fileIds) as Array<{
            id: string;
            path: string;
            original_name: string;
            size: number;
            saved_at: string;
        }>;

        const byId = new Map(
            rows.map((row) => [
                row.id,
                {
                    id: row.id,
                    path: row.path,
                    originalName: row.original_name,
                    size: row.size,
                    savedAt: row.saved_at,
                } satisfies SavedFileRecord,
            ]),
        );

        return fileIds
            .map((fileId) => byId.get(fileId))
            .filter((file): file is SavedFileRecord => Boolean(file));
    }

    getFileById(fileId: string): SavedFileRecord | null {
        const row = this.database
            .prepare(
                `SELECT id, path, original_name, size, saved_at
                 FROM files
                 WHERE id = ?`,
            )
            .get(fileId) as
            | {
                  id: string;
                  path: string;
                  original_name: string;
                  size: number;
                  saved_at: string;
              }
            | undefined;

        if (!row) {
            return null;
        }

        return {
            id: row.id,
            path: row.path,
            originalName: row.original_name,
            size: row.size,
            savedAt: row.saved_at,
        };
    }

    deleteFilesByIds(fileIds: string[]): void {
        if (!fileIds.length) {
            return;
        }

        const statement = this.database.prepare(
            `DELETE FROM files WHERE id = ?`,
        );
        const transaction = this.database.transaction((ids: string[]) => {
            for (const fileId of ids) {
                statement.run(fileId);
            }
        });

        transaction(fileIds);
    }

    getCacheEntry(key: string): CacheEntry | null {
        const row = this.database
            .prepare(
                `SELECT collected_at, ttl_seconds, expires_at, data_json
                 FROM cache
                 WHERE key = ?`,
            )
            .get(key) as
            | {
                  collected_at: number;
                  ttl_seconds: number;
                  expires_at: number;
                  data_json: string;
              }
            | undefined;

        if (!row) {
            return null;
        }

        const parsedData = this.tryParseJson(row.data_json);

        if (parsedData === null) {
            return null;
        }

        return {
            collectedAt: row.collected_at,
            ttlSeconds: row.ttl_seconds,
            expiresAt: row.expires_at,
            data: parsedData,
        };
    }

    setCacheEntry(key: string, entry: CacheEntry): void {
        this.database
            .prepare(
                `
                INSERT INTO cache (key, collected_at, ttl_seconds, expires_at, data_json)
                VALUES (?, ?, ?, ?, ?)
                ON CONFLICT(key) DO UPDATE SET
                    collected_at = excluded.collected_at,
                    ttl_seconds = excluded.ttl_seconds,
                    expires_at = excluded.expires_at,
                    data_json = excluded.data_json
                `,
            )
            .run(
                key,
                entry.collectedAt,
                entry.ttlSeconds,
                entry.expiresAt,
                JSON.stringify(entry.data),
            );
    }

    private initializeSchema(): void {
        this.database.exec(`
            CREATE TABLE IF NOT EXISTS dialogs (
                id TEXT PRIMARY KEY,
                payload_json TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS projects (
                id TEXT PRIMARY KEY,
                payload_json TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS scenarios (
                id TEXT PRIMARY KEY,
                payload_json TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS files (
                id TEXT PRIMARY KEY,
                path TEXT NOT NULL,
                original_name TEXT NOT NULL,
                size INTEGER NOT NULL,
                saved_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS cache (
                key TEXT PRIMARY KEY,
                collected_at INTEGER NOT NULL,
                ttl_seconds INTEGER NOT NULL,
                expires_at INTEGER NOT NULL,
                data_json TEXT NOT NULL
            );

            CREATE INDEX IF NOT EXISTS idx_dialogs_updated_at ON dialogs(updated_at DESC);
            CREATE INDEX IF NOT EXISTS idx_projects_updated_at ON projects(updated_at DESC);
            CREATE INDEX IF NOT EXISTS idx_scenarios_updated_at ON scenarios(updated_at DESC);
            CREATE INDEX IF NOT EXISTS idx_cache_expires_at ON cache(expires_at);
        `);
    }

    private tryParseJson(raw: string): unknown | null {
        try {
            return JSON.parse(raw);
        } catch {
            return null;
        }
    }
}
