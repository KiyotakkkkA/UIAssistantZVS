import { useState } from "react";
import { Button, InputCheckbox, InputSmall, Modal } from "../../atoms";
import { Icon } from "@iconify/react";
import { useChatParams } from "../../../../hooks";
import { SettingsChatOllamaModelsPickForm } from "../forms";
import { PrettyBR } from "../../atoms/PrettyBR";
import { Link } from "react-router-dom";

export const SettingsChatPanel = () => {
    const [isModelsPickOpen, setIsModelsPickOpen] = useState(false);

    const {
        chatDriver,
        ollamaModel,
        ollamaToken,
        mistralVoiceRecModel,
        mistralToken,
        voiceRecognitionDriver,
        telegramId,
        telegramBotToken,
        assistantName,
        maxToolCallsPerResponse,
        setChatDriver,
        setOllamaModel,
        setOllamaToken,
        setMistralVoiceRecModel,
        setMistralToken,
        setVoiceRecognitionDriver,
        setTelegramId,
        setTelegramBotToken,
        setAssistantName,
        setMaxToolCallsPerResponse,
    } = useChatParams();

    return (
        <div className="gap-5">
            <div className="rounded-2xl bg-main-900/40 p-5">
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

            <PrettyBR icon="mdi:chip" label="ИИ Сервисы" size={20} />

            <div className="rounded-2xl bg-main-900/40 p-5">
                <div className="flex gap-2 items-center">
                    <Icon
                        icon="mdi:alpha-m-circle-outline"
                        width={20}
                        height={20}
                        className="text-main-300"
                    />
                    <h4 className="text-sm font-semibold text-main-100">
                        Интеграция с Mistral
                    </h4>
                </div>

                <div className="mt-4 space-y-4">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <p className="text-sm font-medium text-main-200">
                                Использовать для распознавания голоса
                            </p>
                            <p className="text-xs text-main-400">Mistral</p>
                        </div>

                        <InputCheckbox
                            checked={voiceRecognitionDriver === "mistral"}
                            onChange={(checked) => {
                                void setVoiceRecognitionDriver(
                                    checked ? "mistral" : "",
                                );
                            }}
                        />
                    </div>

                    <div className="space-y-2">
                        <p className="text-sm font-medium text-main-200">
                            Модель распознавания голоса
                        </p>
                        <InputSmall
                            value={mistralVoiceRecModel}
                            onChange={(event) =>
                                void setMistralVoiceRecModel(event.target.value)
                            }
                            placeholder="voxtral-mini-transcribe-realtime-2602"
                        />
                    </div>

                    <div className="space-y-2">
                        <p className="text-sm font-medium text-main-200">
                            Token
                        </p>
                        <div className="flex items-center gap-2 w-full">
                            <div className="flex-1">
                                <InputSmall
                                    value={mistralToken}
                                    onChange={(event) =>
                                        void setMistralToken(event.target.value)
                                    }
                                    placeholder="MISTRAL_API_KEY"
                                    type="password"
                                    className="w-full"
                                />
                            </div>
                            <Link
                                to="https://console.mistral.ai/build/audio/realtime?workspace_dialog=apiKeys"
                                target="_blank"
                                className="rounded-md p-2 text-white bg-indigo-700 hover:bg-indigo-800 transition-colors"
                            >
                                <Icon
                                    icon="mdi:open-in-new"
                                    width={18}
                                    height={18}
                                />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <div className="rounded-2xl bg-main-900/40 p-5">
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
                                Использовать для общения
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
                        <div className="flex items-center gap-2 w-full">
                            <div className="flex-1">
                                <InputSmall
                                    value={ollamaToken}
                                    onChange={(event) =>
                                        setOllamaToken(event.target.value)
                                    }
                                    placeholder="Bearer token"
                                    type="password"
                                />
                            </div>
                            <Link
                                to="https://ollama.com/settings/keys"
                                target="_blank"
                                className="rounded-md p-2 text-white bg-indigo-700 hover:bg-indigo-800 transition-colors"
                            >
                                <Icon
                                    icon="mdi:open-in-new"
                                    width={18}
                                    height={18}
                                />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <PrettyBR icon="mdi:link-variant" label="Прочие интеграции" />

            <div className="rounded-2xl bg-main-900/40 p-5">
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
                        <div className="flex items-center gap-2 w-full">
                            <div className="flex-1">
                                <InputSmall
                                    value={telegramBotToken}
                                    onChange={(event) =>
                                        void setTelegramBotToken(
                                            event.target.value,
                                        )
                                    }
                                    placeholder="123456789:AA..."
                                    type="password"
                                />
                            </div>
                            <Link
                                to="https://t.me/BotFather"
                                target="_blank"
                                className="rounded-md p-2 text-white bg-indigo-700 hover:bg-indigo-800 transition-colors"
                            >
                                <Icon
                                    icon="mdi:open-in-new"
                                    width={18}
                                    height={18}
                                />
                            </Link>
                        </div>
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
