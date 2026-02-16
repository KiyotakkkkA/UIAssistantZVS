import { useState } from "react";
import { Button, InputSmall } from "../../components/atoms";

export function CreateProjectPage() {
    const [projectName, setProjectName] = useState("");

    return (
        <div className="flex h-full flex-col rounded-2xl bg-main-900/60 p-5">
            <h2 className="text-lg font-semibold text-main-100">
                Создание проекта
            </h2>
            <p className="mt-2 text-sm text-main-300">
                Заполните базовые параметры проекта.
            </p>

            <div className="mt-6 max-w-xl space-y-3">
                <InputSmall
                    value={projectName}
                    onChange={(event) => setProjectName(event.target.value)}
                    placeholder="Название проекта"
                />

                <Button
                    variant="primary"
                    shape="rounded-lg"
                    className="h-9 px-4"
                    disabled={!projectName.trim()}
                >
                    Создать проект
                </Button>
            </div>
        </div>
    );
}
