import { useRef, useState } from "react";
import { Icon } from "@iconify/react";
import { Button, InputBig } from "../atoms";

interface MessageComposerProps {
    onMessageSend: (content: string) => void;
    onCancelGeneration: () => void;
    isStreaming?: boolean;
}

export function MessageComposer({
    onMessageSend,
    onCancelGeneration,
    isStreaming = false,
}: MessageComposerProps) {
    const [msgContent, setMsgContent] = useState("");
    const areaRef = useRef<HTMLTextAreaElement>(null);

    const handleSend = () => {
        const payload = msgContent.trim();

        if (!payload || isStreaming) {
            return;
        }

        onMessageSend(payload);
        setMsgContent("");
        requestAnimationFrame(() => {
            areaRef.current?.focus();
        });
    };

    return (
        <footer className="rounded-2xl bg-main-900/90 ring-main-300/20 backdrop-blur-sm">
            <div className="relative items-center gap-3">
                <InputBig
                    ref={areaRef}
                    value={msgContent}
                    onChange={setMsgContent}
                    placeholder="Напишите сообщение модели..."
                    className="bg-main-800/70 text-main-100 placeholder:text-main-400 ring-main-300/20 outline-none focus:ring-main-300/40"
                    onKeyDown={(event) => {
                        if (
                            event.key === "Enter" &&
                            !event.shiftKey &&
                            !isStreaming
                        ) {
                            event.preventDefault();
                            handleSend();
                        }
                    }}
                />
                <Button label="Attach" className="absolute left-2 top-1.5 p-2">
                    <Icon icon={"mdi:paperclip"} />
                </Button>
                <Button
                    onClick={isStreaming ? onCancelGeneration : handleSend}
                    label={isStreaming ? "Cancel" : "Send"}
                    className="absolute right-2 top-1.5 p-2"
                    variant="primary"
                    disabled={!isStreaming && !msgContent.trim()}
                >
                    <Icon icon={isStreaming ? "mdi:stop" : "mdi:send"} />
                </Button>
            </div>
        </footer>
    );
}
