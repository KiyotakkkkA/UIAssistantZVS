import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { observer } from "mobx-react-lite";
import { Icon } from "@iconify/react";
import { useToasts, useVectorStorage } from "../../../hooks";
import { useFileSave } from "../../../hooks/files";
import { Button, InputSmall, Modal, Switcher } from "../../components/atoms";
import { StoredFileCard } from "../../components/molecules/cards/storage";
import { LoadingFallbackPage } from "../LoadingFallbackPage";
import { storageStore } from "../../../stores/storageStore";

type StorageView = "files" | "vector-stores";

const STORAGE_VIEW_OPTIONS: { value: StorageView; label: string }[] = [
    { value: "files", label: "Файлы" },
    { value: "vector-stores", label: "Векторное хранилище" },
];

export const StoragePage = observer(function StoragePage() {
    const toasts = useToasts();
    const { createVectorStorage, deleteVectorStorage } = useVectorStorage();
    const { openFile } = useFileSave();
    const navigate = useNavigate();
    const [activeView, setActiveView] = useState<StorageView>("files");
    const [fileSearchQuery, setFileSearchQuery] = useState("");
    const [vectorSearchQuery, setVectorSearchQuery] = useState("");
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const files = storageStore.files;
    const vectorStorages = storageStore.vectorStorages;

    useEffect(() => {
        void storageStore.loadFilesData();
        void storageStore.loadVectorStoragesData();
    }, []);

    const formatFileSize = (bytes: number) => {
        if (!Number.isFinite(bytes) || bytes <= 0) {
            return "0 КБ";
        }

        const units = ["Б", "КБ", "МБ", "ГБ"];
        const exponent = Math.min(
            Math.floor(Math.log(bytes) / Math.log(1024)),
            units.length - 1,
        );
        const value = bytes / 1024 ** exponent;

        return `${value.toFixed(value >= 10 || exponent === 0 ? 0 : 1)} ${units[exponent]}`;
    };

    const formatDateTime = (value: string) => {
        if (!value) {
            return "Неизвестно";
        }

        const parsedDate = new Date(value);

        if (Number.isNaN(parsedDate.getTime())) {
            return "Неизвестно";
        }

        return parsedDate.toLocaleString("ru-RU", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const filteredFiles = useMemo(() => {
        const normalizedQuery = fileSearchQuery.trim().toLowerCase();

        if (!normalizedQuery) {
            return files;
        }

        return files.filter((file) =>
            file.originalName.toLowerCase().includes(normalizedQuery),
        );
    }, [fileSearchQuery, files]);

    const filteredVectorStorages = useMemo(() => {
        const normalizedQuery = vectorSearchQuery.trim().toLowerCase();

        if (!normalizedQuery) {
            return vectorStorages;
        }

        return vectorStorages.filter((vectorStorage) => {
            const haystack =
                `${vectorStorage.name} ${vectorStorage.id}`.toLowerCase();
            return haystack.includes(normalizedQuery);
        });
    }, [vectorSearchQuery, vectorStorages]);

    const openSelectedFile = async () => {
        const selectedFile = storageStore.selectedFile;

        if (!selectedFile) {
            return;
        }

        const isOpened = await openFile(selectedFile.id);

        if (isOpened) {
            return;
        }

        toasts.warning({
            title: "Не удалось открыть файл",
            description: "Файл недоступен или был перемещён.",
        });
    };

    const openSelectedFileProject = () => {
        const selectedFileProjectRef = storageStore.selectedFileProjectRef;
        const targetProjectId = selectedFileProjectRef?.id;

        if (!targetProjectId) {
            toasts.info({
                title: "Проект не найден",
                description: "Этот файл не привязан к проекту.",
            });
            return;
        }

        navigate(`/workspace/projects/${targetProjectId}`);
    };

    const openDeleteConfirmModal = () => {
        if (!storageStore.selectedVectorStorage) {
            toasts.info({
                title: "Стор не выбран",
                description: "Выберите векторное хранилище для удаления.",
            });
            return;
        }

        setIsDeleteConfirmOpen(true);
    };

    const confirmDeleteVectorStorage = async () => {
        const selectedVectorStorage = storageStore.selectedVectorStorage;

        if (!selectedVectorStorage) {
            setIsDeleteConfirmOpen(false);
            return;
        }

        const isDeleted = await deleteVectorStorage(selectedVectorStorage.id);

        if (isDeleted) {
            setIsDeleteConfirmOpen(false);
        }
    };

    const isActiveViewLoading =
        activeView === "files"
            ? storageStore.isFilesLoading
            : storageStore.isVectorStoragesLoading;

    if (isActiveViewLoading) {
        return <LoadingFallbackPage title="Загрузка хранилища..." />;
    }

    return (
        <section className="animate-page-fade-in flex min-w-0 flex-1 flex-col gap-3 rounded-3xl bg-main-900/70 p-4 backdrop-blur-md">
            <div className="rounded-2xl border border-main-700/70 bg-main-900/60 p-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h2 className="text-lg font-semibold text-main-100">
                            Хранилище
                        </h2>
                    </div>
                </div>

                <div className="mt-4">
                    <Switcher
                        value={activeView}
                        options={STORAGE_VIEW_OPTIONS}
                        onChange={(nextValue) =>
                            setActiveView(nextValue as StorageView)
                        }
                    />
                </div>
            </div>

            {activeView === "files" ? (
                <div className="min-h-0 flex-1 rounded-2xl bg-main-900/60">
                    <div className="grid h-full min-h-0 grid-cols-[360px_1fr] gap-3">
                        <div className="flex min-h-0 flex-col gap-3 border-r border-main-700/70 pr-3">
                            <InputSmall
                                value={fileSearchQuery}
                                onChange={(event) =>
                                    setFileSearchQuery(event.target.value)
                                }
                                placeholder="Найти файл..."
                            />

                            <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
                                {filteredFiles.length > 0 ? (
                                    filteredFiles.map((file) => (
                                        <StoredFileCard
                                            key={file.id}
                                            file={file}
                                            selected={
                                                file.id ===
                                                storageStore.selectedFileId
                                            }
                                            projectRef={
                                                storageStore.projectRefByFileId[
                                                    file.id
                                                ]
                                            }
                                            withOpenIcon={false}
                                            onClick={() => {
                                                storageStore.setSelectedFileId(
                                                    file.id,
                                                );
                                            }}
                                        />
                                    ))
                                ) : (
                                    <div className="rounded-xl border border-dashed border-main-700/70 bg-main-900/40 px-3 py-6 text-center text-sm text-main-400">
                                        Не найдено файлов, соответствующих
                                        запросу.
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex min-h-0 flex-col rounded-xl bg-main-900/40 p-4">
                            {storageStore.selectedFile ? (
                                <>
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="truncate text-base font-semibold text-main-100">
                                                {
                                                    storageStore.selectedFile
                                                        .originalName
                                                }
                                            </p>
                                            <p className="mt-1 text-xs text-main-400">
                                                ID:{" "}
                                                {storageStore.selectedFile.id}
                                            </p>
                                        </div>

                                        <div className="space-x-4">
                                            <Button
                                                variant="primary"
                                                shape="rounded-lg"
                                                className="h-8 px-3 text-xs"
                                                onClick={() => {
                                                    void openSelectedFile();
                                                }}
                                            >
                                                <Icon
                                                    icon="mdi:open-in-new"
                                                    width={16}
                                                />
                                                <span className="ml-1">
                                                    Открыть файл
                                                </span>
                                            </Button>
                                            <Button
                                                variant="secondary"
                                                shape="rounded-lg"
                                                className="h-8 px-3 text-xs"
                                                onClick={() => {
                                                    openSelectedFileProject();
                                                }}
                                            >
                                                <Icon
                                                    icon="mdi:open-in-new"
                                                    width={16}
                                                />
                                                <span className="ml-1">
                                                    Открыть проект
                                                </span>
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="mt-4 space-y-2 text-sm">
                                        <div className="rounded-lg border border-main-700/70 bg-main-900/60 px-3 py-2">
                                            <p className="text-xs text-main-400">
                                                Путь
                                            </p>
                                            <p className="truncate text-main-200">
                                                {storageStore.selectedFile.path}
                                            </p>
                                        </div>

                                        <div className="rounded-lg border border-main-700/70 bg-main-900/60 px-3 py-2">
                                            <p className="text-xs text-main-400">
                                                Проект
                                            </p>
                                            <p className="text-main-200">
                                                {storageStore
                                                    .selectedFileProjectRef
                                                    ?.title ||
                                                    "Без привязки к проекту"}
                                            </p>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="flex h-full items-center justify-center text-sm text-main-400">
                                    Выберите файл для просмотра деталей.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="min-h-0 flex-1 rounded-2xl border border-main-700/70 bg-main-900/60 p-3">
                    <div className="grid h-full min-h-0 grid-cols-[360px_1fr] gap-3">
                        <aside className="flex min-h-0 flex-col gap-3 border-r border-main-700/70 pr-3">
                            <InputSmall
                                value={vectorSearchQuery}
                                onChange={(event) =>
                                    setVectorSearchQuery(event.target.value)
                                }
                                placeholder="Поиск векторного хранилища..."
                            />

                            <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
                                {filteredVectorStorages.length > 0 ? (
                                    filteredVectorStorages.map(
                                        (vectorStorage) => (
                                            <button
                                                key={vectorStorage.id}
                                                type="button"
                                                className={`w-full rounded-xl border px-3 py-3 text-left transition-colors cursor-pointer ${
                                                    vectorStorage.id ===
                                                    storageStore.selectedVectorStorageId
                                                        ? "border-main-500/70 bg-main-800/80"
                                                        : "border-main-700/70 bg-main-900/55 hover:bg-main-800/70"
                                                }`}
                                                onClick={() => {
                                                    storageStore.setSelectedVectorStorageId(
                                                        vectorStorage.id,
                                                    );
                                                }}
                                            >
                                                <div className="flex items-center justify-between gap-2">
                                                    <p className="truncate text-sm font-medium text-main-100">
                                                        {vectorStorage.name}
                                                    </p>
                                                    <p className="text-xs text-main-400">
                                                        {formatDateTime(
                                                            vectorStorage.createdAt,
                                                        )}
                                                    </p>
                                                </div>
                                                <p className="mt-1 truncate text-xs text-main-400">
                                                    id: {vectorStorage.id}
                                                </p>
                                            </button>
                                        ),
                                    )
                                ) : (
                                    <div className="rounded-xl border border-dashed border-main-700/70 bg-main-900/40 px-3 py-6 text-center text-sm text-main-400">
                                        Векторные хранилища не найдены.
                                    </div>
                                )}
                            </div>
                        </aside>

                        <section className="min-h-0 overflow-y-auto rounded-xl bg-main-900/40 p-4">
                            <div className="mb-4 flex items-center justify-between gap-3">
                                <div>
                                    <p className="text-xs uppercase tracking-[0.16em] text-main-400">
                                        Векторное хранилище
                                    </p>
                                    <h3 className="mt-1 text-lg font-semibold text-main-100">
                                        {storageStore.selectedVectorStorage
                                            ?.name || "Без названия"}
                                    </h3>
                                </div>
                                <div className="space-x-4">
                                    <Button
                                        variant="primary"
                                        shape="rounded-lg"
                                        className="h-8 px-3 text-xs"
                                        onClick={() => {
                                            void createVectorStorage();
                                        }}
                                    >
                                        <Icon icon="mdi:plus" width={16} />
                                        <span className="ml-1">
                                            Создать новое
                                        </span>
                                    </Button>
                                    <Button
                                        variant="danger"
                                        shape="rounded-lg"
                                        className="h-8 px-3 text-xs"
                                        onClick={() => {
                                            openDeleteConfirmModal();
                                        }}
                                    >
                                        <Icon
                                            icon="mdi:trash-can-outline"
                                            width={16}
                                        />
                                        <span className="ml-1">
                                            Удалить текущее
                                        </span>
                                    </Button>
                                </div>
                            </div>

                            {storageStore.selectedVectorStorage ? (
                                <>
                                    <div className="grid grid-cols-[180px_1fr] gap-y-2 text-sm">
                                        <p className="text-main-400">ID</p>
                                        <p className="text-main-200">
                                            {
                                                storageStore
                                                    .selectedVectorStorage.id
                                            }
                                        </p>
                                        <p className="text-main-400">Размер</p>
                                        <p className="text-main-200">
                                            {formatFileSize(
                                                storageStore
                                                    .selectedVectorStorage.size,
                                            )}
                                        </p>
                                        <p className="text-main-400">
                                            Последняя активность
                                        </p>
                                        <p className="text-main-200">
                                            {formatDateTime(
                                                storageStore
                                                    .selectedVectorStorage
                                                    .lastActiveAt,
                                            )}
                                        </p>
                                        <p className="text-main-400">Создано</p>
                                        <p className="text-main-200">
                                            {formatDateTime(
                                                storageStore
                                                    .selectedVectorStorage
                                                    .createdAt,
                                            )}
                                        </p>
                                    </div>

                                    <div className="mt-8 rounded-xl border border-main-700/70 bg-main-900/45 p-3">
                                        <h4 className="text-sm font-semibold text-main-100">
                                            Привязанные файлы
                                        </h4>
                                        <div className="mt-3 flex h-28 items-center justify-center text-xs text-main-400">
                                            {storageStore.selectedVectorStorage
                                                .fileIds.length > 0
                                                ? `Файлов: ${storageStore.selectedVectorStorage.fileIds.length}`
                                                : "Это векторное хранилище пока пусто."}
                                        </div>
                                    </div>

                                    <div className="mt-4 rounded-xl border border-main-700/70 bg-main-900/45 p-3">
                                        <h4 className="text-sm font-semibold text-main-100">
                                            Используется в проектах
                                        </h4>
                                        <div className="mt-3 flex h-20 items-center justify-center text-xs text-main-400">
                                            {storageStore.selectedVectorStorage
                                                .usedByProjects.length > 0
                                                ? storageStore.selectedVectorStorage.usedByProjects
                                                      .map(
                                                          (project) =>
                                                              project.title,
                                                      )
                                                      .join(", ")
                                                : "Не используется ни в одном проекте."}
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="flex h-full items-center justify-center text-sm text-main-400">
                                    Выберите векторное хранилище для просмотра.
                                </div>
                            )}
                        </section>
                    </div>
                </div>
            )}

            <Modal
                open={isDeleteConfirmOpen}
                onClose={() => setIsDeleteConfirmOpen(false)}
                title="Удаление векторного хранилища"
                className="max-w-md"
                footer={
                    <>
                        <Button
                            variant="secondary"
                            shape="rounded-lg"
                            className="h-9 px-4"
                            onClick={() => setIsDeleteConfirmOpen(false)}
                        >
                            Отмена
                        </Button>
                        <Button
                            variant="danger"
                            shape="rounded-lg"
                            className="h-9 px-4"
                            onClick={() => {
                                void confirmDeleteVectorStorage();
                            }}
                        >
                            Удалить
                        </Button>
                    </>
                }
            >
                <div className="space-y-2 text-sm text-main-300">
                    <p>Подтвердите удаление выбранного векторного хранилища.</p>
                    <p>
                        <span className="text-main-400">Название:</span>{" "}
                        {storageStore.selectedVectorStorage?.name ||
                            "Не выбрано"}
                    </p>
                </div>
            </Modal>
        </section>
    );
});
