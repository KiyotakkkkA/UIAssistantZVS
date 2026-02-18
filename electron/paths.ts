import path from "node:path";

export type ElectronPaths = {
    basePath: string;
    resourcesPath: string;
    themesPath: string;
    filesPath: string;
    profilePath: string;
    databasePath: string;
    defaultProjectsDirectory: string;
};

export const createElectronPaths = (basePath: string): ElectronPaths => {
    const resourcesPath = path.join(basePath, "resources");

    return {
        basePath,
        resourcesPath,
        themesPath: path.join(resourcesPath, "themes"),
        filesPath: path.join(resourcesPath, "files"),
        profilePath: path.join(resourcesPath, "profile.json"),
        databasePath: path.join(resourcesPath, "db.zvsdatabase"),
        defaultProjectsDirectory: path.join(resourcesPath, "projects"),
    };
};
