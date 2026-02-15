import { makeAutoObservable, runInAction } from "mobx";
import type { UserProfile } from "../types/App";

const DEFAULT_THEME_ID = "dark-main";

class UserProfileStore {
    isReady = false;
    userProfile: UserProfile = {
        themePreference: DEFAULT_THEME_ID,
    };

    private isInitializing = false;

    constructor() {
        makeAutoObservable(this, {}, { autoBind: true });
    }

    async initialize(): Promise<void> {
        if (this.isReady || this.isInitializing) {
            return;
        }

        this.isInitializing = true;

        try {
            const api = window.appApi;

            if (!api) {
                runInAction(() => {
                    this.isReady = true;
                });
                return;
            }

            const bootData = await api.getBootData();

            runInAction(() => {
                this.userProfile = bootData.userProfile;
                this.isReady = true;
            });
        } finally {
            runInAction(() => {
                this.isInitializing = false;
            });
        }
    }

    async updateUserProfile(
        nextProfile: Partial<UserProfile>,
    ): Promise<UserProfile> {
        const api = window.appApi;

        if (!api) {
            runInAction(() => {
                this.userProfile = {
                    ...this.userProfile,
                    ...nextProfile,
                };
            });

            return this.userProfile;
        }

        const updatedProfile = await api.updateUserProfile(nextProfile);

        runInAction(() => {
            this.userProfile = updatedProfile;
        });

        return updatedProfile;
    }
}

export const userProfileStore = new UserProfileStore();
