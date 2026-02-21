import { useState } from "react";
import { Button, InputCheckbox, InputSmall, Modal } from "../../atoms";
import { Icon } from "@iconify/react";
import { useChatParams } from "../../../../hooks";
import { SettingsChatOllamaModelsPickForm } from "../forms";

export const SettingsChatPanel = () => {
    const [isModelsPickOpen, setIsModelsPickOpen] = useState(false);

    const {
        chatDriver,
        ollamaModel,
        ollamaToken,
        telegramId,
        telegramBotToken,
        assistantName,
        maxToolCallsPerResponse,
        setChatDriver,
        setOllamaModel,
        setOllamaToken,
        setTelegramId,
        setTelegramBotToken,
        setAssistantName,
        setMaxToolCallsPerResponse,
    } = useChatParams();

    return (
        <div className="space-y-5">
            <div className="rounded-2xl bg-main-900/40 p-4">
                <div className="flex gap-2 items-center">
                    <Icon
                        icon="mdi:robot"
                        width={20}
                        height={20}
                        className="text-main-300"
                    />
                    <h4 className="text-sm font-semibold text-main-100">
                        Ассистент
                    </h4>
                </div>

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

            <div className="rounded-2xl bg-main-900/40 p-4">
                <div className="flex gap-2 items-center">
                    <Icon
                        icon="mdi:chip"
                        width={20}
                        height={20}
                        className="text-main-300"
                    />
                    <h4 className="text-sm font-semibold text-main-100">
                        Интеграция с Ollama
                    </h4>
                </div>

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
                        <div className="flex items-center gap-2 w-full">
                            <div className="flex-1">
                                <InputSmall
                                    value={ollamaModel}
                                    className="w-full"
                                    readOnly
                                    placeholder="gpt-oss:20b"
                                />
                            </div>
                            <Button
                                variant="primary"
                                shape="rounded-lg"
                                className="h-9 shrink-0 px-3"
                                onClick={() => setIsModelsPickOpen(true)}
                            >
                                Выбрать
                            </Button>
                        </div>
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

            <div className="rounded-2xl bg-main-900/40 p-4">
                <div className="flex gap-2 items-center">
                    <Icon
                        icon="mdi:telegram"
                        width={20}
                        height={20}
                        className="text-main-300"
                    />
                    <h4 className="text-sm font-semibold text-main-100">
                        Интеграция с Telegram
                    </h4>
                </div>

                <div className="mt-4 space-y-4">
                    <div className="space-y-2">
                        <p className="text-sm font-medium text-main-200">
                            ID Пользователя
                        </p>
                        <InputSmall
                            value={telegramId}
                            onChange={(event) =>
                                void setTelegramId(event.target.value)
                            }
                            placeholder="123456789"
                        />
                    </div>

                    <div className="space-y-2">
                        <p className="text-sm font-medium text-main-200">
                            Bot token
                        </p>
                        <InputSmall
                            value={telegramBotToken}
                            onChange={(event) =>
                                void setTelegramBotToken(event.target.value)
                            }
                            placeholder="123456789:AA..."
                            type="password"
                        />
                    </div>
                </div>
            </div>

            <Modal
                open={isModelsPickOpen}
                onClose={() => setIsModelsPickOpen(false)}
                title="Выбор Ollama-модели"
                className="max-w-6xl min-h-144"
            >
                <SettingsChatOllamaModelsPickForm
                    currentModel={ollamaModel}
                    onSelectModel={(modelName) => {
                        void setOllamaModel(modelName);
                    }}
                    onClose={() => setIsModelsPickOpen(false)}
                />
            </Modal>
        </div>
    );
};
