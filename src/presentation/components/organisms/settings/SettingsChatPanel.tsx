import { InputCheckbox, InputSmall } from "../../atoms";
import type { ChatDriver } from "../../../../types/App";

interface SettingsChatPanelProps {
    chatDriver: string;
    ollamaModel: string;
    ollamaToken: string;
    assistantName: string;
    maxToolCallsPerResponse: number;
    setChatDriver: (driver: ChatDriver) => void;
    setOllamaModel: (value: string) => void;
    setOllamaToken: (value: string) => void;
    setAssistantName: (value: string) => void;
    setMaxToolCallsPerResponse: (value: number) => void;
}

export const SettingsChatPanel = ({
    chatDriver,
    ollamaModel,
    ollamaToken,
    assistantName,
    maxToolCallsPerResponse,
    setChatDriver,
    setOllamaModel,
    setOllamaToken,
    setAssistantName,
    setMaxToolCallsPerResponse,
}: SettingsChatPanelProps) => {
    return (
        <div className="space-y-5">
            <div className="rounded-2xl border border-main-700/60 bg-main-900/40 p-4">
                <h4 className="text-sm font-semibold text-main-100">
                    Ассистент
                </h4>

                <div className="mt-4 space-y-4">
                    <div className="space-y-2">
                        <p className="text-sm font-medium text-main-200">
                            Имя ассистента
                        </p>
                        <InputSmall
                            value={assistantName}
                            onChange={(event) =>
                                setAssistantName(event.target.value)
                            }
                            placeholder="Чарли"
                        />
                    </div>

                    <div className="space-y-2">
                        <p className="text-sm font-medium text-main-200">
                            Макс. кол-во вызовов инструментов за ответ
                        </p>
                        <InputSmall
                            value={String(maxToolCallsPerResponse)}
                            onChange={(event) => {
                                const raw = Number(event.target.value);
                                if (!Number.isFinite(raw)) {
                                    setMaxToolCallsPerResponse(1);
                                    return;
                                }

                                const nextValue = Math.max(1, Math.floor(raw));
                                setMaxToolCallsPerResponse(nextValue);
                            }}
                            placeholder="4"
                            type="number"
                            min={1}
                        />
                    </div>
                </div>
            </div>

            <div className="rounded-2xl border border-main-700/60 bg-main-900/40 p-4">
                <h4 className="text-sm font-semibold text-main-100">
                    Интеграция с Ollama
                </h4>

                <div className="mt-4 space-y-4">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <p className="text-sm font-medium text-main-200">
                                Провайдер
                            </p>
                            <p className="text-xs text-main-400">Ollama</p>
                        </div>

                        <InputCheckbox
                            checked={chatDriver === "ollama"}
                            onChange={(checked) => {
                                setChatDriver(checked ? "ollama" : "");
                            }}
                        />
                    </div>

                    <div className="space-y-2">
                        <p className="text-sm font-medium text-main-200">
                            Модель
                        </p>
                        <InputSmall
                            value={ollamaModel}
                            onChange={(event) =>
                                setOllamaModel(event.target.value)
                            }
                            placeholder="gpt-oss:20b"
                        />
                    </div>

                    <div className="space-y-2">
                        <p className="text-sm font-medium text-main-200">
                            Token
                        </p>
                        <InputSmall
                            value={ollamaToken}
                            onChange={(event) =>
                                setOllamaToken(event.target.value)
                            }
                            placeholder="Bearer token"
                            type="password"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
