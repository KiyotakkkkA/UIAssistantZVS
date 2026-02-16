import { InputBig, InputSmall } from "../../atoms";

type SettingsProfilePanelProps = {
    userName: string;
    userPrompt: string;
    userLanguage: string;
    setUserName: (value: string) => void;
    setUserPrompt: (value: string) => void;
    setUserLanguage: (value: string) => void;
};

export const SettingsProfilePanel = ({
    userName,
    userPrompt,
    userLanguage,
    setUserName,
    setUserPrompt,
    setUserLanguage,
}: SettingsProfilePanelProps) => {
    return (
        <div className="space-y-5">
            <div className="rounded-2xl bg-main-900/40 p-4">
                <h4 className="text-sm font-semibold text-main-100">Профиль</h4>

                <div className="mt-4 space-y-4">
                    <div className="space-y-2">
                        <p className="text-sm font-medium text-main-200">Имя</p>
                        <InputSmall
                            value={userName}
                            onChange={(event) =>
                                setUserName(event.target.value)
                            }
                            placeholder="Пользователь"
                        />
                    </div>

                    <div className="space-y-2">
                        <p className="text-sm font-medium text-main-200">
                            Предпочитаемый язык
                        </p>
                        <InputSmall
                            value={userLanguage}
                            onChange={(event) =>
                                setUserLanguage(event.target.value)
                            }
                            placeholder="Русский"
                        />
                    </div>

                    <div className="space-y-2">
                        <p className="text-sm font-medium text-main-200">
                            Пользовательский промпт
                        </p>
                        <InputBig
                            value={userPrompt}
                            onChange={setUserPrompt}
                            placeholder="Введите инструкции для модели"
                            className="h-28 rounded-xl border border-main-700 bg-main-800 px-3 py-2 text-sm text-main-100 placeholder:text-main-500"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
