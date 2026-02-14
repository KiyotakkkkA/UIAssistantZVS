interface LoaderProps {
    className?: string;
}

export function Loader({ className }: LoaderProps) {
    return (
        <div
            className={`inline-block h-5 w-5 animate-spin rounded-full border-2 border-neutral-300/30 border-t-neutral-100 ${className || ""}`}
            role="status"
            aria-label="Loading"
        />
    );
}
