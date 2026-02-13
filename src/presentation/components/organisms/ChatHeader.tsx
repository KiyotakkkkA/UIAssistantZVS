import { Button } from "../atoms";

function SearchIcon() {
    return (
        <svg
            viewBox="0 0 20 20"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
        >
            <circle cx="9" cy="9" r="5.5" />
            <path d="M13 13l4 4" />
        </svg>
    );
}

function MenuIcon() {
    return (
        <svg
            viewBox="0 0 20 20"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
        >
            <path d="M4 6h12M4 10h12M4 14h12" />
        </svg>
    );
}

export function ChatHeader() {
    return (
        <header className="flex items-center justify-between rounded-2xl bg-neutral-900/90 px-4 py-3 backdrop-blur-md">
            <div>
                <h1 className="text-base font-semibold text-neutral-100">
                    Диалог с AI
                </h1>
                <p className="mt-1 text-xs text-neutral-400">
                    Только вёрстка • без реального API
                </p>
            </div>
            <div className="flex items-center gap-2">
                <Button label="Search" className="p-2">
                    <SearchIcon />
                </Button>
                <Button label="Menu" className="p-2">
                    <MenuIcon />
                </Button>
            </div>
        </header>
    );
}
