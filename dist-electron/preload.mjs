"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("ipcRenderer", {
  on(...args) {
    const [channel, listener] = args;
    return electron.ipcRenderer.on(
      channel,
      (event, ...nextArgs) => listener(event, ...nextArgs)
    );
  },
  off(...args) {
    const [channel, ...nextArgs] = args;
    return electron.ipcRenderer.off(channel, ...nextArgs);
  },
  send(...args) {
    const [channel, ...nextArgs] = args;
    return electron.ipcRenderer.send(channel, ...nextArgs);
  },
  invoke(...args) {
    const [channel, ...nextArgs] = args;
    return electron.ipcRenderer.invoke(channel, ...nextArgs);
  }
});
electron.contextBridge.exposeInMainWorld("appApi", {
  getBootData: () => electron.ipcRenderer.invoke("app:get-boot-data"),
  getThemesList: () => electron.ipcRenderer.invoke("app:get-themes-list"),
  getThemeData: (themeId) => electron.ipcRenderer.invoke("app:get-theme-data", themeId),
  updateUserProfile: (nextProfile) => electron.ipcRenderer.invoke("app:update-user-profile", nextProfile)
});
