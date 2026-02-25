import { useCallback } from "react";
import { useToasts } from "../useToasts";
import { storageStore } from "../../stores/storageStore";

export const useVectorStorage = () => {
    const toasts = useToasts();

    const createVectorStorage = useCallback(async () => {
        const createdVectorStorage = await storageStore.createVectorStorage();

        if (!createdVectorStorage) {
            toasts.warning({
                title: "Не удалось создать хранилище",
                description: "Попробуйте ещё раз.",
            });
            return null;
        }

        toasts.success({
            title: "Векторное хранилище создано",
            description: `Создано: ${createdVectorStorage.name}`,
        });

        return createdVectorStorage;
    }, [toasts]);

    const deleteVectorStorage = useCallback(
        async (vectorStorageId: string) => {
            const isDeleted =
                await storageStore.deleteVectorStorage(vectorStorageId);

            if (!isDeleted) {
                toasts.warning({
                    title: "Не удалось удалить хранилище",
                    description: "Попробуйте ещё раз.",
                });
                return false;
            }

            toasts.success({
                title: "Векторное хранилище удалено",
                description: "Выбранный стор удалён.",
            });

            return true;
        },
        [toasts],
    );

    return {
        createVectorStorage,
        deleteVectorStorage,
    };
};
