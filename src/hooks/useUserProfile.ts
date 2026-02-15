import { useThemeContext } from "../providers";

export const useUserProfile = () => {
    const { userProfile, updateUserProfile } = useThemeContext();

    return {
        userProfile,
        updateUserProfile,
    };
};
