import { useState, useEffect, useRef, useCallback } from "react";
import { Icon } from "@iconify/react";
import { Button, InputBig } from "../atoms";

interface MessageComposerProps {
    onMessageSend: (content: string) => void;
}

export function MessageComposer({ onMessageSend }: MessageComposerProps) {
    const [msgContent, setMsgContent] = useState("");
    const areaRef = useRef(null);

    const handleShiftDown = useCallback(
        (e: KeyboardEvent) => {
            if (
                e.key === "Enter" &&
                !e.shiftKey &&
                document.activeElement === areaRef.current
            ) {
                e.preventDefault();
                onMessageSend(msgContent);
                setMsgContent("");
            }
        },
        [areaRef, msgContent, onMessageSend],
    );

    useEffect(() => {
        document.addEventListener("keydown", handleShiftDown);

        return () => {
            document.removeEventListener("keydown", handleShiftDown);
        };
    }, [handleShiftDown]);

    return (
        <footer className="rounded-2xl bg-neutral-900/90 ring-neutral-300/20 backdrop-blur-sm">
            <div className="relative items-center gap-3">
                <InputBig
                    ref={areaRef}
                    value={msgContent}
                    onChange={setMsgContent}
                    placeholder="Напишите сообщение модели..."
                    className="bg-neutral-800/70 text-neutral-100 placeholder:text-neutral-400 ring-neutral-300/20 outline-none focus:ring-neutral-300/40"
                />
                <Button label="Attach" className="absolute left-2 top-1.5 p-2">
                    <Icon icon={"mdi:paperclip"} />
                </Button>
                <Button
                    onClick={() => {
                        onMessageSend(msgContent);
                        setMsgContent("");
                    }}
                    label="Send"
                    className="absolute right-2 top-1.5 p-2"
                    variant="primary"
                >
                    <Icon icon={"mdi:send"} />
                </Button>
            </div>
        </footer>
    );
}
