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
const appApi = {
  boot: {
    getBootData: () => electron.ipcRenderer.invoke("app:get-boot-data")
  },
  themes: {
    getThemesList: () => electron.ipcRenderer.invoke("app:get-themes-list"),
    getThemeData: (themeId) => electron.ipcRenderer.invoke("app:get-theme-data", themeId)
  },
  profile: {
    updateUserProfile: (nextProfile) => electron.ipcRenderer.invoke("app:update-user-profile", nextProfile)
  },
  dialogs: {
    getActiveDialog: () => electron.ipcRenderer.invoke("app:get-active-dialog"),
    getDialogsList: () => electron.ipcRenderer.invoke("app:get-dialogs-list"),
    getDialogById: (dialogId) => electron.ipcRenderer.invoke("app:get-dialog-by-id", dialogId),
    createDialog: () => electron.ipcRenderer.invoke("app:create-dialog"),
    renameDialog: (dialogId, title) => electron.ipcRenderer.invoke("app:rename-dialog", dialogId, title),
    deleteDialog: (dialogId) => electron.ipcRenderer.invoke("app:delete-dialog", dialogId),
    deleteMessageFromDialog: (dialogId, messageId) => electron.ipcRenderer.invoke(
      "app:delete-message-from-dialog",
      dialogId,
      messageId
    ),
    truncateDialogFromMessage: (dialogId, messageId) => electron.ipcRenderer.invoke(
      "app:truncate-dialog-from-message",
      dialogId,
      messageId
    ),
    saveDialogSnapshot: (dialog) => electron.ipcRenderer.invoke("app:save-dialog-snapshot", dialog)
  },
  tools: {
    webSearchTool: (request, ollamaToken) => electron.ipcRenderer.invoke("app:web-search-tool", request, ollamaToken),
    webFetchTool: (url, ollamaToken) => electron.ipcRenderer.invoke("app:web-fetch-tool", url, ollamaToken)
  },
  shell: {
    execShellCommand: (command, cwd) => electron.ipcRenderer.invoke("app:exec-shell-command", command, cwd)
  },
  upload: {
    pickFiles: (options) => electron.ipcRenderer.invoke("app:pick-files", options),
    pickPath: (options) => electron.ipcRenderer.invoke("app:pick-path", options)
  },
  files: {
    saveFiles: (files) => electron.ipcRenderer.invoke("app:save-files", files),
    getFilesByIds: (fileIds) => electron.ipcRenderer.invoke("app:get-files-by-ids", fileIds),
    openFile: (fileId) => electron.ipcRenderer.invoke("app:open-saved-file", fileId)
  },
  projects: {
    getProjectsList: () => electron.ipcRenderer.invoke("app:get-projects-list"),
    getDefaultProjectsDirectory: () => electron.ipcRenderer.invoke("app:get-default-projects-directory"),
    getProjectById: (projectId) => electron.ipcRenderer.invoke("app:get-project-by-id", projectId),
    createProject: (payload) => electron.ipcRenderer.invoke("app:create-project", payload),
    deleteProject: (projectId) => electron.ipcRenderer.invoke("app:delete-project", projectId)
  }
};
electron.contextBridge.exposeInMainWorld("appApi", appApi);
