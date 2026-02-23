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
  shell: {
    execShellCommand: (command, cwd) => electron.ipcRenderer.invoke("app:exec-shell-command", command, cwd)
  },
  browser: {
    openUrl: (url, timeoutMs) => electron.ipcRenderer.invoke("app:browser-open-url", url, timeoutMs),
    getPageSnapshot: (maxElements) => electron.ipcRenderer.invoke("app:browser-get-page-snapshot", maxElements),
    interactWith: (params) => electron.ipcRenderer.invoke("app:browser-interact-with", params),
    closeSession: () => electron.ipcRenderer.invoke("app:browser-close-session")
  },
  upload: {
    pickFiles: (options) => electron.ipcRenderer.invoke("app:pick-files", options),
    pickPath: (options) => electron.ipcRenderer.invoke("app:pick-path", options)
  },
  files: {
    saveFiles: (files) => electron.ipcRenderer.invoke("app:save-files", files),
    saveImageFromSource: (payload) => electron.ipcRenderer.invoke("app:save-image-from-source", payload),
    getFilesByIds: (fileIds) => electron.ipcRenderer.invoke("app:get-files-by-ids", fileIds),
    openFile: (fileId) => electron.ipcRenderer.invoke("app:open-saved-file", fileId),
    openPath: (targetPath) => electron.ipcRenderer.invoke("app:open-path", targetPath),
    openExternalUrl: (url) => electron.ipcRenderer.invoke("app:open-external-url", url)
  },
  projects: {
    getProjectsList: () => electron.ipcRenderer.invoke("app:get-projects-list"),
    getDefaultProjectsDirectory: () => electron.ipcRenderer.invoke("app:get-default-projects-directory"),
    getProjectById: (projectId) => electron.ipcRenderer.invoke("app:get-project-by-id", projectId),
    createProject: (payload) => electron.ipcRenderer.invoke("app:create-project", payload),
    deleteProject: (projectId) => electron.ipcRenderer.invoke("app:delete-project", projectId)
  },
  scenarios: {
    getScenariosList: () => electron.ipcRenderer.invoke("app:get-scenarios-list"),
    getScenarioById: (scenarioId) => electron.ipcRenderer.invoke("app:get-scenario-by-id", scenarioId),
    createScenario: (payload) => electron.ipcRenderer.invoke("app:create-scenario", payload),
    updateScenario: (scenarioId, payload) => electron.ipcRenderer.invoke("app:update-scenario", scenarioId, payload),
    deleteScenario: (scenarioId) => electron.ipcRenderer.invoke("app:delete-scenario", scenarioId)
  },
  cache: {
    getCacheEntry: (key) => electron.ipcRenderer.invoke("app:get-cache-entry", key),
    setCacheEntry: (key, entry) => electron.ipcRenderer.invoke("app:set-cache-entry", key, entry)
  },
  network: {
    proxyHttpRequest: (payload) => electron.ipcRenderer.invoke("app:proxy-http-request", payload)
  },
  fs: {
    listDirectory: (cwd) => electron.ipcRenderer.invoke("app:fs-list-directory", cwd),
    createFile: (cwd, filename, content) => electron.ipcRenderer.invoke("app:fs-create-file", cwd, filename, content),
    createDir: (cwd, dirname) => electron.ipcRenderer.invoke("app:fs-create-dir", cwd, dirname),
    readFile: (filePath, readAll, fromLine, toLine) => electron.ipcRenderer.invoke(
      "app:fs-read-file",
      filePath,
      readAll,
      fromLine,
      toLine
    )
  }
};
electron.contextBridge.exposeInMainWorld("appApi", appApi);
