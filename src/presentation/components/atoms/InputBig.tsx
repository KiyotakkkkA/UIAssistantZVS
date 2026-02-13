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
                className={`h-12 w-full px-14 resize-none rounded-full py-3 text-md ${className}`}
                {...props}
            />
        );
    },
);
