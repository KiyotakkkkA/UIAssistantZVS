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
  updateUserProfile: (nextProfile) => electron.ipcRenderer.invoke("app:update-user-profile", nextProfile),
  getActiveDialog: () => electron.ipcRenderer.invoke("app:get-active-dialog"),
  getDialogsList: () => electron.ipcRenderer.invoke("app:get-dialogs-list"),
  getDialogById: (dialogId) => electron.ipcRenderer.invoke("app:get-dialog-by-id", dialogId),
  createDialog: () => electron.ipcRenderer.invoke("app:create-dialog"),
  renameDialog: (dialogId, title) => electron.ipcRenderer.invoke("app:rename-dialog", dialogId, title),
  deleteDialog: (dialogId) => electron.ipcRenderer.invoke("app:delete-dialog", dialogId),
  saveDialogSnapshot: (dialog) => electron.ipcRenderer.invoke("app:save-dialog-snapshot", dialog)
});
