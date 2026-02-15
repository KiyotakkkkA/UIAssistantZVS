import { Select } from "../../atoms";
import type { ThemePreference } from "../../../../hooks";

interface SettingsInterfacePanelProps {
    themePreference: ThemePreference;
    themeOptions: { value: ThemePreference; label: string }[];
    setTheme: (theme: ThemePreference) => void;
}

export const SettingsInterfacePanel = ({
    themePreference,
    themeOptions,
    setTheme,
}: SettingsInterfacePanelProps) => {
    return (
        <div className="py-3 flex items-center justify-between border-b border-neutral-700/80">
            <span className="text-sm font-medium text-neutral-200">Тема</span>

            <Select
                value={themePreference}
                onChange={(nextValue) => setTheme(nextValue as ThemePreference)}
                options={themeOptions}
                placeholder="Выберите тему"
                className="rounded-xl bg-neutral-800/70 hover:bg-neutral-700/70 px-3 py-2 text-neutral-100"
                wrapperClassName="text-neutral-200"
            />
        </div>
    );
};
