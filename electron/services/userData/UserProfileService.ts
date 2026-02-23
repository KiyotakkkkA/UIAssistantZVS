import { randomBytes, randomUUID } from "node:crypto";
import { defaultProfile } from "../../static/data";
import type {
    ChatDriver,
    UserProfile,
    WorkspaceTab,
} from "../../../src/types/App";
import { DatabaseService } from "../DatabaseService";
import { MetaService } from "./MetaService";

const isChatDriver = (value: unknown): value is ChatDriver => {
    return value === "ollama" || value === "";
};

const isWorkspaceTab = (value: unknown): value is WorkspaceTab => {
    return value === "dialogs" || value === "projects" || value === "scenario";
};

const normalizeNullableId = (value: unknown): string | null => {
    if (typeof value !== "string") {
        return null;
    }

    const trimmedValue = value.trim();
    return trimmedValue.length > 0 ? trimmedValue : null;
};

const normalizeWorkspaceContext = (profile: UserProfile): UserProfile => {
    const inferredTab: WorkspaceTab = profile.activeScenarioId
        ? "scenario"
        : profile.activeProjectId
          ? "projects"
          : "dialogs";
    const lastActiveTab = profile.lastActiveTab || inferredTab;

    if (lastActiveTab === "dialogs") {
        return {
            ...profile,
            activeProjectId: null,
            activeScenarioId: null,
            lastActiveTab,
        };
    }

    if (lastActiveTab === "projects") {
        return {
            ...profile,
            activeProjectId: normalizeNullableId(profile.activeProjectId),
            activeScenarioId: null,
            lastActiveTab,
        };
    }

    return {
        ...profile,
        activeDialogId: null,
        activeProjectId: null,
        activeScenarioId: normalizeNullableId(profile.activeScenarioId),
        lastActiveTab,
    };
};

export class UserProfileService {
    private readonly currentUserId: string;

    constructor(
        private readonly databaseService: DatabaseService,
        private readonly metaService: MetaService,
    ) {
        this.currentUserId = this.ensureCurrentUserProfile();
    }

    getCurrentUserId(): string {
        return this.currentUserId;
    }

    getUserProfile(): UserProfile {
        const parsed = this.databaseService.getProfileRaw(
            this.currentUserId,
        ) as Partial<UserProfile> | null;

        if (!parsed || typeof parsed !== "object") {
            return defaultProfile;
        }

        try {
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
                ...(typeof parsed.telegramId === "string"
                    ? { telegramId: parsed.telegramId }
                    : {}),
                ...(typeof parsed.telegramBotToken === "string"
                    ? { telegramBotToken: parsed.telegramBotToken }
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
                activeDialogId: normalizeNullableId(parsed.activeDialogId),
                activeProjectId: normalizeNullableId(parsed.activeProjectId),
                activeScenarioId: normalizeNullableId(parsed.activeScenarioId),
                lastActiveTab: isWorkspaceTab(parsed.lastActiveTab)
                    ? parsed.lastActiveTab
                    : defaultProfile.lastActiveTab,
            };

            return normalizeWorkspaceContext(normalized);
        } catch {
            return defaultProfile;
        }
    }

    updateUserProfile(nextProfile: Partial<UserProfile>): UserProfile {
        const currentProfile = this.getUserProfile();
        const mergedProfile = normalizeWorkspaceContext({
            ...currentProfile,
            ...nextProfile,
        });

        this.databaseService.updateProfileRaw(
            this.currentUserId,
            mergedProfile,
        );
        return mergedProfile;
    }

    private ensureCurrentUserProfile(): string {
        const currentUserIdFromMeta = this.metaService.getCurrentUserId();

        if (
            currentUserIdFromMeta &&
            this.databaseService.hasProfile(currentUserIdFromMeta)
        ) {
            return currentUserIdFromMeta;
        }

        const profileId = randomUUID();
        const secretKey = randomBytes(32).toString("hex");

        this.databaseService.createProfile(
            profileId,
            defaultProfile,
            secretKey,
        );
        this.metaService.setCurrentUserId(profileId);

        return profileId;
    }
}
