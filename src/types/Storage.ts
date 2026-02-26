import type { JobEventTag } from "./ElectronApi";

export type LanceVectorRow = {
    id: string;
    vector: number[];
    text: string;
    fileId: string;
    fileName: string;
    chunkIndex: number;
    vectorStorageId: string;
    createdAt: string;
};

export type LanceSearchResultRow = {
    id: string;
    text: string;
    fileId: string;
    fileName: string;
    chunkIndex: number;
    _distance?: number;
    _score?: number;
};

export type VectorizationStageTag = JobEventTag;

export type VectorizationCallbacks = {
    onStage: (message: string, tag?: VectorizationStageTag) => void;
};

export type VectorizationDocument = {
    fileId: string;
    fileName: string;
    text: string;
};

export type VectorizationChunk = {
    id: string;
    text: string;
    fileId: string;
    fileName: string;
    chunkIndex: number;
};

export type VectorizationSourceFile = {
    id: string;
    path: string;
    originalName: string;
    size: number;
    persistedFileId?: string;
};
