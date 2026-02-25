import { Select } from "../../atoms";
import type { UserProfile } from "../../../../types/App";

interface SettingsInterfacePanelProps {
    userProfile: Pick<UserProfile, "themePreference">;
    themeOptions: { value: string; label: string }[];
    updateUserProfile: (
        nextProfile: Partial<Pick<UserProfile, "themePreference">>,
    ) => void;
}

export const SettingsInterfacePanel = ({
    userProfile,
    themeOptions,
    updateUserProfile,
}: SettingsInterfacePanelProps) => {
    return (
        <div className="py-3 flex items-center justify-between border-b border-main-700/80">
            <span className="text-sm font-medium text-main-200">Тема</span>

            <Select
                value={userProfile.themePreference}
                onChange={(nextValue) =>
                    updateUserProfile({ themePreference: nextValue })
                }
                options={themeOptions}
                placeholder="Выберите тему"
                className="rounded-xl bg-main-800/70 hover:bg-main-700/70 px-3 py-2 text-main-100"
                wrapperClassName="text-main-200"
            />
        </div>
    );
};
