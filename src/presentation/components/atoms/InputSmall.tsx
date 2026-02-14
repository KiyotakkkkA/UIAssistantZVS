import { forwardRef, type InputHTMLAttributes } from "react";

type InputSmallProps = InputHTMLAttributes<HTMLInputElement>;

export const InputSmall = forwardRef<HTMLInputElement, InputSmallProps>(
    function InputSmall({ className = "", ...props }, ref) {
        return (
            <input
                ref={ref}
                className={`h-9 w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 text-sm text-neutral-100 outline-none transition-all duration-200 placeholder:text-neutral-500 focus-visible:border-neutral-500/70 focus-visible:ring-2 focus-visible:ring-neutral-500/25 ${className}`}
                {...props}
            />
        );
    },
);
