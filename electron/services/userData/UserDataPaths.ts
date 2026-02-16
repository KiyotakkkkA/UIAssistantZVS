import path from "node:path";

export type UserDataPaths = {
    resourcesPath: string;
    themesPath: string;
    dialogsPath: string;
    profilePath: string;
};

export const createUserDataPaths = (basePath: string): UserDataPaths => {
    const resourcesPath = path.join(basePath, "resources");

    return {
        resourcesPath,
        themesPath: path.join(resourcesPath, "themes"),
        dialogsPath: path.join(resourcesPath, "chats", "dialogs"),
        profilePath: path.join(resourcesPath, "profile.json"),
    };
};
