import { forwardRef, type ReactNode } from "react";

type ButtonVariants = "primary" | "secondary";
type ButtonShape =
    | "rounded-none"
    | "rounded-sm"
    | "rounded-md"
    | "rounded-lg"
    | "rounded-full"
    | "rounded-l-full"
    | "rounded-r-full";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode;
    label?: string;
    variant?: ButtonVariants | "";
    shape?: ButtonShape | "";
    className?: string;
}

const variants: Record<ButtonVariants, string> = {
    primary:
        "bg-white hover:opacity-80 border-transparent text-black transition-opacity",
    secondary: "bg-main-700 hover:bg-main-600 border-transparent text-white",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    function Button(
        {
            children,
            label,
            variant = "secondary",
            shape = "rounded-full",
            className,
            ...props
        }: ButtonProps,
        ref,
    ) {
        return (
            <button
                ref={ref}
                type="button"
                aria-label={label}
                className={`inline-flex disabled:opacity-70 disabled:cursor-not-allowed ${shape} items-center justify-center transition-colors border cursor-pointer ${variant ? variants[variant] : ""} ${className}`}
                {...props}
            >
                {children}
            </button>
        );
    },
);
