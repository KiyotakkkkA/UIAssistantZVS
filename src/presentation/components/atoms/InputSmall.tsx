import { forwardRef, type InputHTMLAttributes } from "react";

type InputSmallProps = InputHTMLAttributes<HTMLInputElement>;

export const InputSmall = forwardRef<HTMLInputElement, InputSmallProps>(
    function InputSmall({ className = "", ...props }, ref) {
        return (
            <input
                ref={ref}
                className={`h-9 w-full rounded-lg border border-main-700 bg-main-800 px-3 text-sm text-main-100 outline-none transition-colors duration-200 placeholder:text-main-500 focus-visible:border-main-500/70 focus-visible:ring-2 focus-visible:ring-main-500/25 ${className}`}
                {...props}
            />
        );
    },
);
