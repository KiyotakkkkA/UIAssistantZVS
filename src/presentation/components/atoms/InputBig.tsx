import React, { forwardRef } from "react";

interface InputBigProps extends Omit<
    React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    "onChange" | "value"
> {
    value: string;
    onChange: (value: string) => void;
    className?: string;
}

export const InputBig = forwardRef<HTMLTextAreaElement, InputBigProps>(
    ({ value, onChange, className, ...props }, ref) => {
        return (
            <textarea
                ref={ref}
                value={value}
                onChange={(event) => onChange(event.target.value)}
                className={`h-12 w-full resize-none rounded-full py-3 text-md outline-none transition-colors  focus-visible:border-main-500/70 focus-visible:ring-2 focus-visible:ring-main-500/25 ${className}`}
                {...props}
            />
        );
    },
);
