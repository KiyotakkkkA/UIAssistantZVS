import { Icon } from "@iconify/react";
import { forwardRef, useState, type InputHTMLAttributes } from "react";

type InputSmallProps = InputHTMLAttributes<HTMLInputElement>;

export const InputSmall = forwardRef<HTMLInputElement, InputSmallProps>(
    function InputSmall({ className = "", type, ...props }, ref) {
        const isPassword = type === "password";
        const [passwordVisible, setPasswordVisible] = useState(false);

        const togglePasswordVisibility = () => {
            setPasswordVisible((prev) => !prev);
        };

        const inputType = isPassword
            ? passwordVisible
                ? "text"
                : "password"
            : type;

        return (
            <div className="relative">
                <input
                    ref={ref}
                    type={inputType}
                    className={`h-9 w-full ${isPassword ? "pr-10" : ""} rounded-lg border border-main-700 bg-main-800 px-3 text-sm text-main-100 outline-none transition-colors duration-200 placeholder:text-main-500 focus-visible:border-main-500/70 focus-visible:ring-2 focus-visible:ring-main-500/25 ${className}`}
                    {...props}
                />
                {isPassword && (
                    <Icon
                        icon={passwordVisible ? "mdi:eye-off" : "mdi:eye"}
                        className="absolute top-2.5 right-3 text-main-200 cursor-pointer hover:opacity-50 transition-opacity"
                        onClick={togglePasswordVisibility}
                    />
                )}
            </div>
        );
    },
);
