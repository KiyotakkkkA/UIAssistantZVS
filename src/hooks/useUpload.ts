import { useCallback, useState } from "react";
import type { UploadedFileData } from "../types/ElectronApi";

type UploadOptions = {
    accept?: string[];
    multiple?: boolean;
};

export const useUpload = () => {
    const [isUploading, setIsUploading] = useState(false);

    const pickFiles = useCallback(
        async (options?: UploadOptions): Promise<UploadedFileData[]> => {
            const api = window.appApi?.upload.pickFiles;

            if (!api) {
                return [];
            }

            try {
                setIsUploading(true);
                return await api(options);
            } finally {
                setIsUploading(false);
            }
        },
        [],
    );

    return {
        isUploading,
        pickFiles,
    };
};
