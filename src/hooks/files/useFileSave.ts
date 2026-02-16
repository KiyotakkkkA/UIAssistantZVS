import { useCallback, useState } from "react";
import type {
    SavedFileRecord,
    UploadedFileData,
} from "../../types/ElectronApi";

export const useFileSave = () => {
    const [isSaving, setIsSaving] = useState(false);

    const saveFiles = useCallback(
        async (files: UploadedFileData[]): Promise<SavedFileRecord[]> => {
            const api = window.appApi?.files.saveFiles;

            if (!api || files.length === 0) {
                return [];
            }

            try {
                setIsSaving(true);
                return await api(files);
            } finally {
                setIsSaving(false);
            }
        },
        [],
    );

    const getFilesByIds = useCallback(async (fileIds: string[]) => {
        const api = window.appApi?.files.getFilesByIds;

        if (!api || fileIds.length === 0) {
            return [];
        }

        return await api(fileIds);
    }, []);

    const openFile = useCallback(async (fileId: string): Promise<boolean> => {
        const api = window.appApi?.files.openFile;

        if (!api) {
            return false;
        }

        return await api(fileId);
    }, []);

    return {
        isSaving,
        saveFiles,
        getFilesByIds,
        openFile,
    };
};
