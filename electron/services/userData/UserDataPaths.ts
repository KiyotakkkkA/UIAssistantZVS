import path from "node:path";

export type UserDataPaths = {
    resourcesPath: string;
    themesPath: string;
    dialogsPath: string;
    projectsPath: string;
    filesPath: string;
    storageManifestPath: string;
    profilePath: string;
};

export const createUserDataPaths = (basePath: string): UserDataPaths => {
    const resourcesPath = path.join(basePath, "resources");

    return {
        resourcesPath,
        themesPath: path.join(resourcesPath, "themes"),
        dialogsPath: path.join(resourcesPath, "chats", "dialogs"),
        projectsPath: path.join(resourcesPath, "chats", "projects"),
        filesPath: path.join(resourcesPath, "files"),
        storageManifestPath: path.join(resourcesPath, "storage.json"),
        profilePath: path.join(resourcesPath, "profile.json"),
    };
};
