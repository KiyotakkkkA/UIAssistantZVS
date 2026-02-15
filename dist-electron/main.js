import path from "node:path";
import { app, BrowserWindow, ipcMain } from "electron";
import { fileURLToPath } from "node:url";
import fs from "node:fs";
import { randomUUID } from "node:crypto";
const defaultProfile = {
  themePreference: "dark-main",
  ollamaModel: "gpt-oss:20b",
  ollamaToken: "",
  chatDriver: "ollama",
  userName: "Пользователь",
  userPrompt: "",
  activeDialogId: ""
};
const createPrefixedId = (prefix) => `${prefix}_${randomUUID().replace(/-/g, "")}`;
const createDialogId = () => createPrefixedId("dialog");
const createBaseDialog = () => {
  const now = (/* @__PURE__ */ new Date()).toISOString();
  return {
    id: createDialogId(),
    title: "Новый диалог",
    messages: [],
    createdAt: now,
    updatedAt: now
  };
};
const baseDarkDracula = {
  id: "dark-dracula",
  name: "Dracula",
  palette: {
    "--color-main-50": "rgb(248 248 242)",
    "--color-main-100": "rgb(235 236 241)",
    "--color-main-200": "rgb(211 214 229)",
    "--color-main-300": "rgb(168 174 199)",
    "--color-main-400": "rgb(125 133 171)",
    "--color-main-500": "rgb(98 114 164)",
    "--color-main-600": "rgb(74 84 120)",
    "--color-main-700": "rgb(54 60 88)",
    "--color-main-800": "rgb(40 42 54)",
    "--color-main-900": "rgb(24 26 36)"
  }
};
const baseDarkGithub = {
  id: "dark-github",
  name: "GitHub Dark",
  palette: {
    "--color-main-50": "rgb(240 246 252)",
    "--color-main-100": "rgb(201 209 217)",
    "--color-main-200": "rgb(161 171 178)",
    "--color-main-300": "rgb(139 148 158)",
    "--color-main-400": "rgb(110 118 129)",
    "--color-main-500": "rgb(72 80 89)",
    "--color-main-600": "rgb(48 54 61)",
    "--color-main-700": "rgb(33 38 45)",
    "--color-main-800": "rgb(22 27 34)",
    "--color-main-900": "rgb(13 17 23)"
  }
};
const baseDarkGruvbox = {
  id: "dark-gruvbox",
  name: "Gruvbox",
  palette: {
    "--color-main-50": "rgb(251 241 199)",
    "--color-main-100": "rgb(235 219 178)",
    "--color-main-200": "rgb(213 196 161)",
    "--color-main-300": "rgb(189 174 147)",
    "--color-main-400": "rgb(168 153 132)",
    "--color-main-500": "rgb(146 131 116)",
    "--color-main-600": "rgb(124 111 100)",
    "--color-main-700": "rgb(102 92 84)",
    "--color-main-800": "rgb(60 56 54)",
    "--color-main-900": "rgb(40 40 40)"
  }
};
const baseDarkMain = {
  id: "dark-main",
  name: "Основная",
  palette: {
    "--color-main-50": "rgb(250 250 250)",
    "--color-main-100": "rgb(245 245 245)",
    "--color-main-200": "rgb(229 229 229)",
    "--color-main-300": "rgb(212 212 212)",
    "--color-main-400": "rgb(163 163 163)",
    "--color-main-500": "rgb(115 115 115)",
    "--color-main-600": "rgb(82 82 82)",
    "--color-main-700": "rgb(64 64 64)",
    "--color-main-800": "rgb(38 38 38)",
    "--color-main-900": "rgb(23 23 23)"
  }
};
const baseDarkNord = {
  id: "dark-nord",
  name: "Nord",
  palette: {
    "--color-main-50": "rgb(236 239 244)",
    "--color-main-100": "rgb(229 233 240)",
    "--color-main-200": "rgb(216 222 233)",
    "--color-main-300": "rgb(196 204 218)",
    "--color-main-400": "rgb(143 162 190)",
    "--color-main-500": "rgb(129 161 193)",
    "--color-main-600": "rgb(94 129 172)",
    "--color-main-700": "rgb(76 97 132)",
    "--color-main-800": "rgb(59 66 82)",
    "--color-main-900": "rgb(46 52 64)"
  }
};
const baseDarkOneDark = {
  id: "dark-one-dark",
  name: "One Dark",
  palette: {
    "--color-main-50": "rgb(220 223 228)",
    "--color-main-100": "rgb(204 210 219)",
    "--color-main-200": "rgb(179 189 204)",
    "--color-main-300": "rgb(137 152 173)",
    "--color-main-400": "rgb(97 118 147)",
    "--color-main-500": "rgb(73 90 118)",
    "--color-main-600": "rgb(56 69 92)",
    "--color-main-700": "rgb(40 48 65)",
    "--color-main-800": "rgb(33 39 54)",
    "--color-main-900": "rgb(22 27 34)"
  }
};
const staticThemeEntries = [
  { fileName: "baseDarkMain.json", data: baseDarkMain },
  { fileName: "baseDarkDracula.json", data: baseDarkDracula },
  { fileName: "baseDarkNord.json", data: baseDarkNord },
  { fileName: "baseDarkOneDark.json", data: baseDarkOneDark },
  { fileName: "baseDarkGruvbox.json", data: baseDarkGruvbox },
  { fileName: "baseDarkGithub.json", data: baseDarkGithub }
];
const staticThemes = staticThemeEntries.map(
  (entry) => entry.data
);
const staticThemesMap = Object.fromEntries(
  staticThemes.map((theme) => [theme.id, theme])
);
const staticThemesList = staticThemes.map((theme) => ({
  id: theme.id,
  name: theme.name
}));
class InitService {
  basePath;
  resourcesPath;
  themesPath;
  chatsPath;
  dialogsPath;
  profilePath;
  constructor(basePath) {
    this.basePath = basePath;
    this.resourcesPath = path.join(this.basePath, "resources");
    this.themesPath = path.join(this.resourcesPath, "themes");
    this.chatsPath = path.join(this.resourcesPath, "chats");
    this.dialogsPath = path.join(this.chatsPath, "dialogs");
    this.profilePath = path.join(this.resourcesPath, "profile.json");
  }
  initialize() {
    this.ensureDirectory(this.resourcesPath);
    this.ensureDirectory(this.themesPath);
    this.ensureProfile();
    this.ensureThemes();
    this.ensureChatsDirectory();
  }
  ensureDirectory(targetPath) {
    if (!fs.existsSync(targetPath)) {
      fs.mkdirSync(targetPath, { recursive: true });
    }
  }
  ensureProfile() {
    if (!fs.existsSync(this.profilePath)) {
      fs.writeFileSync(
        this.profilePath,
        JSON.stringify(defaultProfile, null, 2)
      );
    }
  }
  ensureChatsDirectory() {
    this.ensureDirectory(this.chatsPath);
    this.ensureDirectory(this.dialogsPath);
    const dialogFiles = fs.readdirSync(this.dialogsPath).filter((fileName) => fileName.endsWith(".json"));
    if (dialogFiles.length > 0) {
      return;
    }
    const baseDialog = createBaseDialog();
    const baseDialogPath = path.join(this.dialogsPath, `${baseDialog.id}.json`);
    fs.writeFileSync(baseDialogPath, JSON.stringify(baseDialog, null, 2));
  }
  ensureThemes() {
    for (const entry of staticThemeEntries) {
      const themeFilePath = path.join(this.themesPath, entry.fileName);
      if (!fs.existsSync(themeFilePath)) {
        fs.writeFileSync(
          themeFilePath,
          JSON.stringify(entry.data, null, 2)
        );
      }
    }
  }
}
const isChatDriver = (value) => {
  return value === "ollama" || value === "";
};
class UserDataService {
  resourcesPath;
  themesPath;
  dialogsPath;
  profilePath;
  constructor(basePath) {
    this.resourcesPath = path.join(basePath, "resources");
    this.themesPath = path.join(this.resourcesPath, "themes");
    this.dialogsPath = path.join(this.resourcesPath, "chats", "dialogs");
    this.profilePath = path.join(this.resourcesPath, "profile.json");
  }
  getActiveDialog() {
    const profile = this.readUserProfile();
    const dialogs = this.readDialogs();
    if (profile.activeDialogId && dialogs.some((dialog) => dialog.id === profile.activeDialogId)) {
      const activeDialog = dialogs.find((dialog) => dialog.id === profile.activeDialogId) ?? dialogs[0];
      return activeDialog;
    }
    if (dialogs.length > 0) {
      const fallbackActiveDialog = dialogs[0];
      this.updateUserProfile({ activeDialogId: fallbackActiveDialog.id });
      return fallbackActiveDialog;
    }
    const baseDialog = createBaseDialog();
    this.writeDialog(baseDialog);
    this.updateUserProfile({ activeDialogId: baseDialog.id });
    return baseDialog;
  }
  getDialogsList() {
    return this.readDialogs().map(
      (dialog) => this.toDialogListItem(dialog)
    );
  }
  getDialogById(dialogId) {
    const dialogs = this.readDialogs();
    const dialog = dialogs.find((item) => item.id === dialogId);
    if (dialog) {
      this.updateUserProfile({ activeDialogId: dialog.id });
      return dialog;
    }
    return this.getActiveDialog();
  }
  createDialog() {
    const baseDialog = createBaseDialog();
    this.writeDialog(baseDialog);
    this.updateUserProfile({ activeDialogId: baseDialog.id });
    return baseDialog;
  }
  renameDialog(dialogId, nextTitle) {
    const dialog = this.getDialogById(dialogId);
    const trimmedTitle = nextTitle.trim();
    const updatedDialog = {
      ...dialog,
      title: trimmedTitle || dialog.title,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.writeDialog(updatedDialog);
    return updatedDialog;
  }
  deleteDialog(dialogId) {
    const dialogPath = path.join(this.dialogsPath, `${dialogId}.json`);
    if (fs.existsSync(dialogPath)) {
      fs.unlinkSync(dialogPath);
    }
    let dialogs = this.readDialogs();
    if (dialogs.length === 0) {
      const fallbackDialog = createBaseDialog();
      this.writeDialog(fallbackDialog);
      dialogs = [fallbackDialog];
    }
    this.updateUserProfile({ activeDialogId: dialogs[0].id });
    return {
      dialogs: dialogs.map((dialog) => this.toDialogListItem(dialog)),
      activeDialog: dialogs[0]
    };
  }
  deleteMessageFromDialog(dialogId, messageId) {
    const dialog = this.getDialogById(dialogId);
    const nextMessages = dialog.messages.filter(
      (message) => message.id !== messageId
    );
    const updatedDialog = {
      ...dialog,
      messages: nextMessages,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.writeDialog(updatedDialog);
    return updatedDialog;
  }
  truncateDialogFromMessage(dialogId, messageId) {
    const dialog = this.getDialogById(dialogId);
    const messageIndex = dialog.messages.findIndex(
      (message) => message.id === messageId
    );
    if (messageIndex === -1) {
      return dialog;
    }
    const updatedDialog = {
      ...dialog,
      messages: dialog.messages.slice(0, messageIndex),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.writeDialog(updatedDialog);
    return updatedDialog;
  }
  saveDialogSnapshot(dialog) {
    const normalizedMessages = dialog.messages.map(
      (message) => this.normalizeMessage(message)
    );
    const normalizedDialog = {
      id: this.normalizeDialogId(dialog.id),
      title: typeof dialog.title === "string" && dialog.title.trim() ? dialog.title : "Новый диалог",
      messages: normalizedMessages,
      createdAt: typeof dialog.createdAt === "string" && dialog.createdAt ? dialog.createdAt : (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.writeDialog(normalizedDialog);
    this.updateUserProfile({ activeDialogId: normalizedDialog.id });
    return normalizedDialog;
  }
  getBootData() {
    const userProfile = this.readUserProfile();
    const preferredThemeData = this.resolveThemePalette(
      userProfile.themePreference
    );
    return {
      userProfile,
      preferredThemeData
    };
  }
  getThemesList() {
    const themes = this.readThemes();
    if (themes.length === 0) {
      return staticThemesList;
    }
    return themes.map((theme) => ({
      id: theme.id,
      name: theme.name
    }));
  }
  getThemeData(themeId) {
    const themes = this.readThemes();
    const preferredTheme = themes.find((theme) => theme.id === themeId);
    if (preferredTheme) {
      return preferredTheme;
    }
    const fallbackTheme = staticThemesMap[themeId];
    if (fallbackTheme) {
      return fallbackTheme;
    }
    return staticThemesMap[defaultProfile.themePreference];
  }
  updateUserProfile(nextProfile) {
    const currentProfile = this.readUserProfile();
    const mergedProfile = {
      ...currentProfile,
      ...nextProfile
    };
    fs.writeFileSync(
      this.profilePath,
      JSON.stringify(mergedProfile, null, 2)
    );
    return mergedProfile;
  }
  readUserProfile() {
    if (!fs.existsSync(this.profilePath)) {
      return defaultProfile;
    }
    try {
      const rawProfile = fs.readFileSync(this.profilePath, "utf-8");
      const parsed = JSON.parse(rawProfile);
      const normalized = {
        ...defaultProfile,
        ...typeof parsed.themePreference === "string" ? { themePreference: parsed.themePreference } : {},
        ...typeof parsed.ollamaModel === "string" ? { ollamaModel: parsed.ollamaModel } : {},
        ...typeof parsed.ollamaToken === "string" ? { ollamaToken: parsed.ollamaToken } : {},
        ...isChatDriver(parsed.chatDriver) ? { chatDriver: parsed.chatDriver } : {},
        ...typeof parsed.userName === "string" ? { userName: parsed.userName } : {},
        ...typeof parsed.userPrompt === "string" ? { userPrompt: parsed.userPrompt } : {},
        ...typeof parsed.activeDialogId === "string" ? { activeDialogId: parsed.activeDialogId } : {}
      };
      return normalized;
    } catch {
      return defaultProfile;
    }
  }
  readThemes() {
    if (!fs.existsSync(this.themesPath)) {
      return [];
    }
    const files = fs.readdirSync(this.themesPath).filter((fileName) => fileName.endsWith(".json"));
    const result = [];
    for (const fileName of files) {
      const filePath = path.join(this.themesPath, fileName);
      try {
        const rawTheme = fs.readFileSync(filePath, "utf-8");
        const parsed = JSON.parse(rawTheme);
        if (typeof parsed.id === "string" && typeof parsed.name === "string" && typeof parsed.palette === "object" && parsed.palette !== null) {
          result.push(parsed);
        }
      } catch {
        continue;
      }
    }
    return result;
  }
  readDialogs() {
    if (!fs.existsSync(this.dialogsPath)) {
      return [];
    }
    const files = fs.readdirSync(this.dialogsPath).filter((fileName) => fileName.endsWith(".json"));
    const dialogs = [];
    for (const fileName of files) {
      const filePath = path.join(this.dialogsPath, fileName);
      try {
        const rawDialog = fs.readFileSync(filePath, "utf-8");
        const parsed = JSON.parse(rawDialog);
        if (!Array.isArray(parsed.messages)) {
          continue;
        }
        const normalizedMessages = parsed.messages.map(
          (message) => this.normalizeMessage(message)
        ).filter(Boolean);
        dialogs.push({
          id: this.normalizeDialogId(parsed.id),
          title: typeof parsed.title === "string" && parsed.title.trim() ? parsed.title : "Новый диалог",
          messages: normalizedMessages,
          createdAt: typeof parsed.createdAt === "string" && parsed.createdAt ? parsed.createdAt : (/* @__PURE__ */ new Date()).toISOString(),
          updatedAt: typeof parsed.updatedAt === "string" && parsed.updatedAt ? parsed.updatedAt : (/* @__PURE__ */ new Date()).toISOString()
        });
      } catch {
        continue;
      }
    }
    dialogs.sort(
      (left, right) => right.updatedAt.localeCompare(left.updatedAt)
    );
    return dialogs;
  }
  writeDialog(dialog) {
    if (!fs.existsSync(this.dialogsPath)) {
      fs.mkdirSync(this.dialogsPath, { recursive: true });
    }
    const dialogPath = path.join(this.dialogsPath, `${dialog.id}.json`);
    fs.writeFileSync(dialogPath, JSON.stringify(dialog, null, 2));
  }
  normalizeDialogId(id) {
    if (typeof id === "string" && id.startsWith("dialog_")) {
      return id;
    }
    return `dialog_${randomUUID().replace(/-/g, "")}`;
  }
  normalizeMessage(message) {
    const role = message.author === "assistant" || message.author === "user" || message.author === "system" || message.author === "tool" ? message.author : "assistant";
    return {
      id: typeof message.id === "string" && message.id.startsWith("msg_") ? message.id : `msg_${randomUUID().replace(/-/g, "")}`,
      author: role,
      content: typeof message.content === "string" ? message.content : "",
      timestamp: typeof message.timestamp === "string" && message.timestamp ? message.timestamp : (/* @__PURE__ */ new Date()).toLocaleTimeString("ru-RU", {
        hour: "2-digit",
        minute: "2-digit"
      })
    };
  }
  resolveThemePalette(themeId) {
    const themes = this.readThemes();
    const preferredTheme = themes.find((theme) => theme.id === themeId);
    if (preferredTheme) {
      return preferredTheme.palette;
    }
    return staticThemesMap[defaultProfile.themePreference].palette;
  }
  toDialogListItem(dialog) {
    const lastMessage = dialog.messages.length > 0 ? dialog.messages[dialog.messages.length - 1] : null;
    return {
      id: dialog.id,
      title: dialog.title,
      preview: lastMessage?.content?.trim() || "Пустой диалог — отправьте первое сообщение",
      time: new Date(dialog.updatedAt).toLocaleTimeString("ru-RU", {
        hour: "2-digit",
        minute: "2-digit"
      }),
      updatedAt: dialog.updatedAt
    };
  }
}
const __dirname$1 = path.dirname(fileURLToPath(import.meta.url));
process.env.APP_ROOT = path.join(__dirname$1, "..");
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, "public") : RENDERER_DIST;
let win;
let userDataService;
function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    webPreferences: {
      preload: path.join(__dirname$1, "preload.mjs")
    }
  });
  win.webContents.on("did-finish-load", () => {
    win?.webContents.send(
      "main-process-message",
      (/* @__PURE__ */ new Date()).toLocaleString()
    );
  });
  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(RENDERER_DIST, "index.html"));
  }
  win.maximize();
}
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    win = null;
  }
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
app.whenReady().then(() => {
  const initDirectoriesService = new InitService(app.getPath("userData"));
  initDirectoriesService.initialize();
  userDataService = new UserDataService(app.getPath("userData"));
  ipcMain.handle("app:get-boot-data", () => userDataService.getBootData());
  ipcMain.handle(
    "app:get-themes-list",
    () => userDataService.getThemesList()
  );
  ipcMain.handle(
    "app:get-theme-data",
    (_event, themeId) => userDataService.getThemeData(themeId)
  );
  ipcMain.handle(
    "app:update-user-profile",
    (_event, nextProfile) => userDataService.updateUserProfile(nextProfile)
  );
  ipcMain.handle(
    "app:get-active-dialog",
    () => userDataService.getActiveDialog()
  );
  ipcMain.handle("app:get-dialogs-list", () => userDataService.getDialogsList());
  ipcMain.handle(
    "app:get-dialog-by-id",
    (_event, dialogId) => userDataService.getDialogById(dialogId)
  );
  ipcMain.handle("app:create-dialog", () => userDataService.createDialog());
  ipcMain.handle(
    "app:rename-dialog",
    (_event, dialogId, title) => userDataService.renameDialog(dialogId, title)
  );
  ipcMain.handle(
    "app:delete-dialog",
    (_event, dialogId) => userDataService.deleteDialog(dialogId)
  );
  ipcMain.handle(
    "app:delete-message-from-dialog",
    (_event, dialogId, messageId) => userDataService.deleteMessageFromDialog(dialogId, messageId)
  );
  ipcMain.handle(
    "app:truncate-dialog-from-message",
    (_event, dialogId, messageId) => userDataService.truncateDialogFromMessage(dialogId, messageId)
  );
  ipcMain.handle(
    "app:save-dialog-snapshot",
    (_event, dialog) => userDataService.saveDialogSnapshot(dialog)
  );
  createWindow();
});
export {
  MAIN_DIST,
  RENDERER_DIST,
  VITE_DEV_SERVER_URL
};
