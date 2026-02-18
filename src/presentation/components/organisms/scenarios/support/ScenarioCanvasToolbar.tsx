import { Icon } from "@iconify/react";
import { Button } from "../../../atoms";

type ScenarioCanvasToolbarProps = {
    hasScene: boolean;
    showGrid: boolean;
    zoomPercent: number;
    isSaving: boolean;
    onGenerate: () => void;
    onToggleGrid: () => void;
    onResetView: () => void;
    onSave: () => void;
};

export function ScenarioCanvasToolbar({
    hasScene,
    showGrid,
    zoomPercent,
    isSaving,
    onGenerate,
    onToggleGrid,
    onResetView,
    onSave,
}: ScenarioCanvasToolbarProps) {
    return (
        <div className="absolute right-3 top-3 z-20 flex items-center gap-1 rounded-xl border border-main-700/70 bg-main-900/85 p-1.5 backdrop-blur-md">
            {!hasScene ? (
                <Button
                    variant=""
                    className="h-8 rounded-lg border border-main-700/70 bg-main-900/40 px-3 text-xs text-main-100 hover:bg-main-700/70"
                    onClick={onGenerate}
                >
                    Сгенерировать
                </Button>
            ) : null}

            <Button
                variant=""
                className={`h-8 w-8 rounded-lg border border-main-700/70 text-main-200 hover:bg-main-700/70 ${showGrid ? "bg-main-700/50" : "bg-main-900/40"}`}
                onClick={onToggleGrid}
                title={showGrid ? "Выключить сетку" : "Включить сетку"}
                aria-label={showGrid ? "Выключить сетку" : "Включить сетку"}
            >
                <Icon icon="mdi:grid" width={16} height={16} />
            </Button>

            <Button
                variant=""
                className="h-8 w-8 rounded-lg border border-main-700/70 bg-main-900/40 text-main-400"
                disabled
                title="Магнит (пока недоступен)"
                aria-label="Магнит (пока недоступен)"
            >
                <Icon icon="mdi:magnet" width={16} height={16} />
            </Button>

            <Button
                variant=""
                className="h-8 w-8 rounded-lg border border-main-700/70 bg-main-900/40 text-main-200 hover:bg-main-700/70"
                onClick={onResetView}
                title="Сбросить масштаб"
                aria-label="Сбросить масштаб"
            >
                <Icon icon="mdi:fit-to-screen-outline" width={16} height={16} />
            </Button>

            <div className="min-w-12 rounded-lg border border-main-700/70 bg-main-900/40 px-2 py-1 text-center text-xs font-medium text-main-200">
                {zoomPercent}%
            </div>

            <Button
                variant=""
                className="h-8 rounded-lg border border-main-700/70 bg-main-900/40 px-3 text-xs text-main-100 hover:bg-main-700/70"
                onClick={onSave}
                disabled={isSaving}
            >
                {isSaving ? "Сохранение..." : "Сохранить"}
            </Button>
        </div>
    );
}
