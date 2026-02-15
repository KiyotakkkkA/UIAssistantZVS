import { useObserver } from "mobx-react-lite";
import { userProfileStore } from "../stores/userProfileStore";

export const useUserProfile = () => {
    return useObserver(() => ({
        isReady: userProfileStore.isReady,
        userProfile: userProfileStore.userProfile,
        updateUserProfile: userProfileStore.updateUserProfile,
    }));
};
