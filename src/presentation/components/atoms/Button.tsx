import type { ReactNode } from "react";

type ButtonVariants = "primary" | "secondary";
type ButtonShape = "rounded-md" | "rounded-lg" | "rounded-full";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode;
    label?: string;
    variant?: ButtonVariants;
    shape?: ButtonShape;
    className?: string;
}

const variants: Record<ButtonVariants, string> = {
    primary:
        "bg-white hover:opacity-80 border-transparent text-black transition-opacity",
    secondary:
        "bg-neutral-700 hover:bg-neutral-600 border-transparent text-white",
};

export function Button({
    children,
    label,
    variant = "secondary",
    shape = "rounded-full",
    className,
    ...props
}: ButtonProps) {
    return (
        <button
            type="button"
            aria-label={label}
            className={`inline-flex items-center justify-center rounded-full transition-colors border cursor-pointer ${variant ? variants[variant] : ""} ${className} ${shape}`}
            {...props}
        >
            {children}
        </button>
    );
}
