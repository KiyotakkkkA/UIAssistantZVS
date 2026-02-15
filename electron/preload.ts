import { ipcRenderer, contextBridge } from "electron";
import type {
    BootData,
    ThemeData,
    ThemeListItem,
    UserProfile,
} from "../src/types/App";

// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld("ipcRenderer", {
    on(...args: Parameters<typeof ipcRenderer.on>) {
        const [channel, listener] = args;
        return ipcRenderer.on(channel, (event, ...nextArgs) =>
            listener(event, ...nextArgs),
        );
    },
    off(...args: Parameters<typeof ipcRenderer.off>) {
        const [channel, ...nextArgs] = args;
        return ipcRenderer.off(channel, ...nextArgs);
    },
    send(...args: Parameters<typeof ipcRenderer.send>) {
        const [channel, ...nextArgs] = args;
        return ipcRenderer.send(channel, ...nextArgs);
    },
    invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
        const [channel, ...nextArgs] = args;
        return ipcRenderer.invoke(channel, ...nextArgs);
    },
});

contextBridge.exposeInMainWorld("appApi", {
    getBootData: (): Promise<BootData> =>
        ipcRenderer.invoke("app:get-boot-data"),
    getThemesList: (): Promise<ThemeListItem[]> =>
        ipcRenderer.invoke("app:get-themes-list"),
    getThemeData: (themeId: string): Promise<ThemeData> =>
        ipcRenderer.invoke("app:get-theme-data", themeId),
    updateUserProfile: (
        nextProfile: Partial<UserProfile>,
    ): Promise<UserProfile> =>
        ipcRenderer.invoke("app:update-user-profile", nextProfile),
});
