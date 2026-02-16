import fs from "node:fs";
import { defaultProfile } from "../../static/data";
import type { ChatDriver, UserProfile } from "../../../src/types/App";

const isChatDriver = (value: unknown): value is ChatDriver => {
    return value === "ollama" || value === "";
};

export class UserProfileService {
    constructor(private readonly profilePath: string) {}

    getUserProfile(): UserProfile {
        if (!fs.existsSync(this.profilePath)) {
            return defaultProfile;
        }

        try {
            const rawProfile = fs.readFileSync(this.profilePath, "utf-8");
            const parsed = JSON.parse(rawProfile) as Partial<UserProfile>;

            const normalized: UserProfile = {
                ...defaultProfile,
                ...(typeof parsed.themePreference === "string"
                    ? { themePreference: parsed.themePreference }
                    : {}),
                ...(typeof parsed.ollamaModel === "string"
                    ? { ollamaModel: parsed.ollamaModel }
                    : {}),
                ...(typeof parsed.ollamaToken === "string"
                    ? { ollamaToken: parsed.ollamaToken }
                    : {}),
                ...(isChatDriver(parsed.chatDriver)
                    ? { chatDriver: parsed.chatDriver }
                    : {}),
                ...(typeof parsed.assistantName === "string"
                    ? { assistantName: parsed.assistantName }
                    : {}),
                ...(typeof parsed.maxToolCallsPerResponse === "number" &&
                Number.isFinite(parsed.maxToolCallsPerResponse)
                    ? {
                          maxToolCallsPerResponse:
                              parsed.maxToolCallsPerResponse,
                      }
                    : {}),
                ...(typeof parsed.userName === "string"
                    ? { userName: parsed.userName }
                    : {}),
                ...(typeof parsed.userPrompt === "string"
                    ? { userPrompt: parsed.userPrompt }
                    : {}),
                ...(typeof parsed.userLanguage === "string"
                    ? { userLanguage: parsed.userLanguage }
                    : {}),
                ...(typeof parsed.activeDialogId === "string"
                    ? { activeDialogId: parsed.activeDialogId }
                    : {}),
                ...(typeof parsed.activeProjectId === "string" ||
                parsed.activeProjectId === null
                    ? {
                          activeProjectId:
                              typeof parsed.activeProjectId === "string" &&
                              parsed.activeProjectId.trim().length > 0
                                  ? parsed.activeProjectId
                                  : null,
                      }
                    : {}),
            };

            return normalized;
        } catch {
            return defaultProfile;
        }
    }

    updateUserProfile(nextProfile: Partial<UserProfile>): UserProfile {
        const currentProfile = this.getUserProfile();
        const mergedProfile: UserProfile = {
            ...currentProfile,
            ...nextProfile,
        };

        fs.writeFileSync(
            this.profilePath,
            JSON.stringify(mergedProfile, null, 2),
        );
        return mergedProfile;
    }
}
