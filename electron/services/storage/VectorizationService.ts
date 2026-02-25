import { randomUUID } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";
import { UserDataService } from "../UserDataService";
import { LanceDbService } from "./LanceDbService";
import { OllamaService } from "../agents/OllamaService";
import type {
    CreateJobPayload,
    SavedFileRecord,
} from "../../../src/types/ElectronApi";

type VectorizationStageTag = "info" | "success" | "warning" | "error";

type VectorizationCallbacks = {
    onStage: (message: string, tag?: VectorizationStageTag) => void;
};

const SUPPORTED_FILE_EXTENSIONS = new Set([".pdf", ".docx"]);
const CHUNK_SIZE = 1200;
const MAX_BATCH_SIZE = 24;

export class VectorizationService {
    constructor(
        private readonly userDataService: UserDataService,
        private readonly ollamaService: OllamaService,
        private readonly lanceDbService: LanceDbService,
    ) {}

    async runVectorizationJob(
        payload: CreateJobPayload,
        signal: AbortSignal,
        callbacks: VectorizationCallbacks,
    ): Promise<{ totalFiles: number }> {
        const vectorStorageId = payload.vectorStorageId?.trim();

        if (!vectorStorageId) {
            throw new Error("Не передан идентификатор векторного хранилища");
        }

        this.throwIfAborted(signal);

        callbacks.onStage("Стадия подготовки файлов начата", "info");
        const preparedFiles = this.prepareFiles(payload, callbacks);
        callbacks.onStage(
            `Подготовка завершена. Файлов к обработке: ${preparedFiles.length}`,
            "success",
        );

        this.throwIfAborted(signal);

        callbacks.onStage("Стадия чтения файлов начата", "info");
        const documents = await this.readSupportedDocuments(
            preparedFiles,
            signal,
            callbacks,
        );
        callbacks.onStage(
            `Чтение завершено. Документов: ${documents.length}`,
            "success",
        );

        this.throwIfAborted(signal);

        callbacks.onStage("Стадия эмбеддинга начата", "info");
        const embeddedRows = await this.embedDocuments(
            documents,
            vectorStorageId,
            signal,
            callbacks,
        );
        callbacks.onStage(
            `Эмбеддинг завершён. Векторов: ${embeddedRows.length}`,
            "success",
        );

        this.throwIfAborted(signal);

        callbacks.onStage("Стадия индексации в LanceDB начата", "info");
        callbacks.onStage(
            `Передача ${embeddedRows.length} векторов в индекс LanceDB`,
            "info",
        );
        await this.lanceDbService.addVectors(vectorStorageId, embeddedRows);
        callbacks.onStage("Индексация в LanceDB завершена", "success");

        this.throwIfAborted(signal);

        const existingStorage =
            this.userDataService.getVectorStorageById(vectorStorageId);
        const existingFileIds = existingStorage?.fileIds ?? [];
        const uniqueFileIds = [
            ...new Set([
                ...existingFileIds,
                ...preparedFiles.map((file) => file.id),
            ]),
        ];
        await this.userDataService.updateVectorStorage(vectorStorageId, {
            fileIds: uniqueFileIds,
            size: uniqueFileIds.length,
            lastActiveAt: new Date().toISOString(),
        });

        callbacks.onStage("Пайплайн векторизации завершён", "success");

        return {
            totalFiles: uniqueFileIds.length,
        };
    }

    private prepareFiles(
        payload: CreateJobPayload,
        callbacks: VectorizationCallbacks,
    ): SavedFileRecord[] {
        const sourceFileIds = Array.isArray(payload.sourceFileIds)
            ? payload.sourceFileIds
            : [];
        const existingFiles = this.userDataService.getFilesByIds(sourceFileIds);
        callbacks.onStage(
            `Файлов из хранилища получено: ${existingFiles.length}`,
            "info",
        );

        const uploadedFiles = Array.isArray(payload.uploadedFiles)
            ? payload.uploadedFiles
            : [];
        callbacks.onStage(
            `Файлов из проводника получено: ${uploadedFiles.length}`,
            "info",
        );
        const savedFromUploads = uploadedFiles.length
            ? this.userDataService.saveFiles(uploadedFiles)
            : [];

        if (savedFromUploads.length) {
            callbacks.onStage(
                `Сохранено новых файлов в files: ${savedFromUploads.length}`,
                "success",
            );
        }

        const merged = [...existingFiles, ...savedFromUploads];

        if (!merged.length) {
            throw new Error("Не выбраны файлы для векторизации");
        }

        const deduplicated = new Map<string, SavedFileRecord>();
        for (const file of merged) {
            deduplicated.set(file.id, file);
        }

        const validated = [...deduplicated.values()];

        if (!validated.length) {
            throw new Error("Не найдены файлы для обработки");
        }

        return validated;
    }

    private async readSupportedDocuments(
        files: SavedFileRecord[],
        signal: AbortSignal,
        callbacks: VectorizationCallbacks,
    ): Promise<
        Array<{
            fileId: string;
            fileName: string;
            text: string;
        }>
    > {
        const documents: Array<{
            fileId: string;
            fileName: string;
            text: string;
        }> = [];

        for (const file of files) {
            this.throwIfAborted(signal);

            const extension = path.extname(file.originalName).toLowerCase();

            callbacks.onStage(
                `Чтение файла: ${file.originalName} (${extension || "без расширения"})`,
                "info",
            );

            if (!SUPPORTED_FILE_EXTENSIONS.has(extension)) {
                callbacks.onStage(
                    `Файл ${file.originalName} пропущен: поддерживаются только PDF/DOCX`,
                    "warning",
                );
                continue;
            }

            const buffer = await fs.readFile(file.path);

            let rawText = "";

            if (extension === ".pdf") {
                const parser = new PDFParse({ data: buffer });
                const parsed = await parser.getText();
                rawText = parsed.text || "";
                await parser.destroy();
            } else if (extension === ".docx") {
                const parsed = await mammoth.extractRawText({ buffer });
                rawText = parsed.value || "";
            }

            const normalizedText = rawText.replace(/\s+/g, " ").trim();

            if (!normalizedText) {
                callbacks.onStage(
                    `Файл ${file.originalName} не содержит извлекаемого текста`,
                    "warning",
                );
                continue;
            }

            callbacks.onStage(
                `Текст из ${file.originalName} успешно извлечён`,
                "success",
            );

            documents.push({
                fileId: file.id,
                fileName: file.originalName,
                text: normalizedText,
            });
        }

        if (!documents.length) {
            throw new Error("Не удалось извлечь текст из выбранных файлов");
        }

        return documents;
    }

    private async embedDocuments(
        documents: Array<{
            fileId: string;
            fileName: string;
            text: string;
        }>,
        vectorStorageId: string,
        signal: AbortSignal,
        callbacks: VectorizationCallbacks,
    ) {
        const profile = this.userDataService.getBootData().userProfile;

        if (profile.embeddingDriver !== "ollama") {
            throw new Error(
                "Для векторизации нужно включить настройку 'Использовать для создания эмбеддингов' в Ollama",
            );
        }

        const model =
            profile.ollamaEmbeddingModel.trim() || profile.ollamaModel.trim();

        if (!model) {
            throw new Error("Не выбрана Ollama эмбеддинг-модель");
        }

        const token = profile.ollamaToken;

        const chunks: Array<{
            id: string;
            text: string;
            fileId: string;
            fileName: string;
            chunkIndex: number;
        }> = [];

        for (const document of documents) {
            const documentChunks = this.chunkText(document.text, CHUNK_SIZE);

            callbacks.onStage(
                `Файл ${document.fileName}: подготовлено чанков ${documentChunks.length}`,
                "info",
            );

            for (let index = 0; index < documentChunks.length; index += 1) {
                chunks.push({
                    id: `chunk_${randomUUID().replace(/-/g, "")}`,
                    text: documentChunks[index],
                    fileId: document.fileId,
                    fileName: document.fileName,
                    chunkIndex: index,
                });
            }
        }

        callbacks.onStage(
            `Всего чанков для эмбеддинга: ${chunks.length}`,
            "info",
        );

        const rows: Array<{
            id: string;
            vector: number[];
            text: string;
            fileId: string;
            fileName: string;
            chunkIndex: number;
            vectorStorageId: string;
            createdAt: string;
        }> = [];

        for (let offset = 0; offset < chunks.length; offset += MAX_BATCH_SIZE) {
            this.throwIfAborted(signal);

            const batch = chunks.slice(offset, offset + MAX_BATCH_SIZE);
            const batchTexts = batch.map((chunk) => chunk.text);
            const processedBefore = offset;
            const processedAfter = Math.min(
                offset + batch.length,
                chunks.length,
            );
            const progressPercent = Math.round(
                (processedAfter / chunks.length) * 100,
            );

            callbacks.onStage(
                `Эмбеддинг батча: ${processedBefore + 1}-${processedAfter}/${chunks.length} (${progressPercent}%)`,
                "info",
            );

            const embedResult = await this.ollamaService.getEmbed(
                {
                    model,
                    input: batchTexts,
                },
                token,
            );

            if (embedResult.embeddings.length !== batch.length) {
                throw new Error(
                    "Количество эмбеддингов не совпадает с размером батча",
                );
            }

            for (let index = 0; index < batch.length; index += 1) {
                rows.push({
                    id: batch[index].id,
                    vector: embedResult.embeddings[index],
                    text: batch[index].text,
                    fileId: batch[index].fileId,
                    fileName: batch[index].fileName,
                    chunkIndex: batch[index].chunkIndex,
                    vectorStorageId,
                    createdAt: new Date().toISOString(),
                });
            }
        }

        return rows;
    }

    private chunkText(text: string, chunkSize: number): string[] {
        if (!text) {
            return [];
        }

        const chunks: string[] = [];
        let offset = 0;

        while (offset < text.length) {
            const slice = text.slice(offset, offset + chunkSize).trim();

            if (slice) {
                chunks.push(slice);
            }

            offset += chunkSize;
        }

        return chunks;
    }

    private throwIfAborted(signal: AbortSignal): void {
        if (signal.aborted) {
            throw new DOMException("Aborted", "AbortError");
        }
    }
}
