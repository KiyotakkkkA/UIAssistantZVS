import { useRef, useState } from "react";
import { Icon } from "@iconify/react";
import { Button, InputBig } from "../atoms";

interface MessageComposerProps {
    onMessageSend: (content: string) => void;
    disabled?: boolean;
}

export function MessageComposer({
    onMessageSend,
    disabled = false,
}: MessageComposerProps) {
    const [msgContent, setMsgContent] = useState("");
    const areaRef = useRef<HTMLTextAreaElement>(null);

    const handleSend = () => {
        const payload = msgContent.trim();

        if (!payload || disabled) {
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
                            !disabled
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
                    onClick={handleSend}
                    label="Send"
                    className="absolute right-2 top-1.5 p-2"
                    variant="primary"
                    disabled={disabled || !msgContent.trim()}
                >
                    <Icon icon={"mdi:send"} />
                </Button>
            </div>
        </footer>
    );
}
