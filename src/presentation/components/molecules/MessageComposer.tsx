import { Icon } from "@iconify/react";
import { Button } from "../atoms";

export function MessageComposer() {
    return (
        <footer className="rounded-2xl bg-neutral-900/90 ring-neutral-300/20 backdrop-blur-sm">
            <div className="relative items-center gap-3">
                <textarea
                    placeholder="Напишите сообщение модели..."
                    className="h-12 w-full px-14 resize-none rounded-full bg-neutral-800/70 py-3 text-md text-neutral-100 placeholder:text-neutral-400 ring-neutral-300/20 outline-none focus:ring-neutral-300/40"
                />
                <Button label="Attach" className="absolute left-2 top-1.5 p-2">
                    <Icon icon={"mdi:paperclip"} />
                </Button>
                <Button
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
