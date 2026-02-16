import { useCallback } from "react";
import { useToasts } from "../useToasts";

export const useFileDownload = (content: string, filename: string) => {
    const toasts = useToasts();

    return useCallback(
        (nextFilename?: string) => {
            const targetFilename = nextFilename || filename;

            try {
                const blob = new Blob([content], {
                    type: "text/plain;charset=utf-8",
                });
                const objectUrl = URL.createObjectURL(blob);
                const link = document.createElement("a");

                link.href = objectUrl;
                link.download = targetFilename;
                document.body.appendChild(link);
                link.click();
                link.remove();
                URL.revokeObjectURL(objectUrl);
            } catch {
                toasts.danger({
                    title: "Ошибка скачивания",
                    description: "Не удалось скачать файл.",
                });
            }
        },
        [content, filename, toasts],
    );
};
