import path from "node:path";
import fs$1, { readFile } from "node:fs/promises";
import { app, BrowserWindow, ipcMain, shell, dialog } from "electron";
import { fileURLToPath } from "node:url";
import fs from "node:fs";
import { randomUUID } from "node:crypto";
import { spawn } from "node:child_process";
const defaultProfile = {
  themePreference: "dark-main",
  ollamaModel: "gpt-oss:20b",
  ollamaToken: "",
  telegramId: "",
  telegramBotToken: "",
  chatDriver: "ollama",
  assistantName: "Чарли",
  maxToolCallsPerResponse: 10,
  userName: "Пользователь",
  userPrompt: "",
  userLanguage: "Русский",
  activeDialogId: "",
  activeProjectId: null
};
const createPrefixedId = (prefix) => `${prefix}_${randomUUID().replace(/-/g, "")}`;
const createDialogId = () => createPrefixedId("dialog");
const createBaseDialog = (forProjectId = null) => {
  const now = (/* @__PURE__ */ new Date()).toISOString();
  return {
    id: createDialogId(),
    title: "Новый диалог",
    messages: [],
    forProjectId,
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
  projectsPath;
  filesPath;
  storageManifestPath;
  profilePath;
  constructor(basePath) {
    this.basePath = basePath;
    this.resourcesPath = path.join(this.basePath, "resources");
    this.themesPath = path.join(this.resourcesPath, "themes");
    this.chatsPath = path.join(this.resourcesPath, "chats");
    this.dialogsPath = path.join(this.chatsPath, "dialogs");
    this.projectsPath = path.join(this.chatsPath, "projects");
    this.filesPath = path.join(this.resourcesPath, "files");
    this.storageManifestPath = path.join(
      this.resourcesPath,
      "storage.json"
    );
    this.profilePath = path.join(this.resourcesPath, "profile.json");
  }
  initialize() {
    this.ensureDirectory(this.resourcesPath);
    this.ensureDirectory(this.themesPath);
    this.ensureProfile();
    this.ensureThemes();
    this.ensureChatsDirectory();
    this.ensureFilesStorage();
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
    this.ensureDirectory(this.projectsPath);
    const dialogFiles = fs.readdirSync(this.dialogsPath).filter((fileName) => fileName.endsWith(".json"));
    if (dialogFiles.length > 0) {
      return;
    }
    const baseDialog = createBaseDialog();
    const baseDialogPath = path.join(
      this.dialogsPath,
      `${baseDialog.id}.json`
    );
    fs.writeFileSync(baseDialogPath, JSON.stringify(baseDialog, null, 2));
  }
  ensureFilesStorage() {
    this.ensureDirectory(this.filesPath);
    if (!fs.existsSync(this.storageManifestPath)) {
      fs.writeFileSync(
        this.storageManifestPath,
        JSON.stringify({}, null, 2)
      );
    }
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
const createUserDataPaths = (basePath) => {
  const resourcesPath = path.join(basePath, "resources");
  return {
    resourcesPath,
    themesPath: path.join(resourcesPath, "themes"),
    dialogsPath: path.join(resourcesPath, "chats", "dialogs"),
    projectsPath: path.join(resourcesPath, "chats", "projects"),
    filesPath: path.join(resourcesPath, "files"),
    storageManifestPath: path.join(resourcesPath, "storage.json"),
    profilePath: path.join(resourcesPath, "profile.json")
  };
};
const isChatDriver = (value) => {
  return value === "ollama" || value === "";
};
class UserProfileService {
  constructor(profilePath) {
    this.profilePath = profilePath;
  }
  getUserProfile() {
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
        ...typeof parsed.telegramId === "string" ? { telegramId: parsed.telegramId } : {},
        ...typeof parsed.telegramBotToken === "string" ? { telegramBotToken: parsed.telegramBotToken } : {},
        ...isChatDriver(parsed.chatDriver) ? { chatDriver: parsed.chatDriver } : {},
        ...typeof parsed.assistantName === "string" ? { assistantName: parsed.assistantName } : {},
        ...typeof parsed.maxToolCallsPerResponse === "number" && Number.isFinite(parsed.maxToolCallsPerResponse) ? {
          maxToolCallsPerResponse: parsed.maxToolCallsPerResponse
        } : {},
        ...typeof parsed.userName === "string" ? { userName: parsed.userName } : {},
        ...typeof parsed.userPrompt === "string" ? { userPrompt: parsed.userPrompt } : {},
        ...typeof parsed.userLanguage === "string" ? { userLanguage: parsed.userLanguage } : {},
        ...typeof parsed.activeDialogId === "string" ? { activeDialogId: parsed.activeDialogId } : {},
        ...typeof parsed.activeProjectId === "string" || parsed.activeProjectId === null ? {
          activeProjectId: typeof parsed.activeProjectId === "string" && parsed.activeProjectId.trim().length > 0 ? parsed.activeProjectId : null
        } : {}
      };
      return normalized;
    } catch {
      return defaultProfile;
    }
  }
  updateUserProfile(nextProfile) {
    const currentProfile = this.getUserProfile();
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
}
class ThemesService {
  constructor(themesPath) {
    this.themesPath = themesPath;
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
  resolveThemePalette(themeId) {
    const themes = this.readThemes();
    const preferredTheme = themes.find((theme) => theme.id === themeId);
    if (preferredTheme) {
      return preferredTheme.palette;
    }
    return staticThemesMap[defaultProfile.themePreference].palette;
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
}
class DialogsService {
  constructor(dialogsPath, onActiveDialogContextUpdate) {
    this.dialogsPath = dialogsPath;
    this.onActiveDialogContextUpdate = onActiveDialogContextUpdate;
  }
  getActiveDialog(activeDialogId) {
    const dialogs = this.readDialogs();
    if (activeDialogId) {
      const activeDialog = dialogs.find(
        (dialog2) => dialog2.id === activeDialogId
      );
      if (activeDialog) {
        return activeDialog;
      }
    }
    const availableDialogs = dialogs.filter(
      (dialog2) => dialog2.forProjectId === null
    );
    if (availableDialogs.length > 0) {
      const fallbackActiveDialog = availableDialogs[0];
      this.onActiveDialogContextUpdate({
        activeDialogId: fallbackActiveDialog.id,
        activeProjectId: fallbackActiveDialog.forProjectId
      });
      return fallbackActiveDialog;
    }
    const baseDialog = createBaseDialog();
    this.writeDialog(baseDialog);
    this.onActiveDialogContextUpdate({
      activeDialogId: baseDialog.id,
      activeProjectId: baseDialog.forProjectId
    });
    return baseDialog;
  }
  getDialogsList() {
    return this.readDialogs().filter((dialog2) => dialog2.forProjectId === null).map((dialog2) => this.toDialogListItem(dialog2));
  }
  getDialogById(dialogId, activeDialogId) {
    const dialogs = this.readDialogs();
    const dialog2 = dialogs.find((item) => item.id === dialogId);
    if (dialog2) {
      this.onActiveDialogContextUpdate({
        activeDialogId: dialog2.id,
        activeProjectId: dialog2.forProjectId
      });
      return dialog2;
    }
    return this.getActiveDialog(activeDialogId);
  }
  createDialog(forProjectId = null) {
    const baseDialog = createBaseDialog(forProjectId);
    this.writeDialog(baseDialog);
    this.onActiveDialogContextUpdate({
      activeDialogId: baseDialog.id,
      activeProjectId: baseDialog.forProjectId
    });
    return baseDialog;
  }
  linkDialogToProject(dialogId, projectId) {
    const dialogs = this.readDialogs();
    const targetDialog = dialogs.find((dialog2) => dialog2.id === dialogId);
    if (!targetDialog || targetDialog.forProjectId === projectId) {
      return;
    }
    this.writeDialog({
      ...targetDialog,
      forProjectId: projectId,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    });
  }
  renameDialog(dialogId, nextTitle, activeDialogId) {
    const dialog2 = this.getDialogById(dialogId, activeDialogId);
    const trimmedTitle = nextTitle.trim();
    const updatedDialog = {
      ...dialog2,
      title: trimmedTitle || dialog2.title,
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
      const fallbackDialog2 = createBaseDialog();
      this.writeDialog(fallbackDialog2);
      dialogs = [fallbackDialog2];
    }
    const fallbackDialog = dialogs.find((dialog2) => dialog2.forProjectId === null) || dialogs[0];
    this.onActiveDialogContextUpdate({
      activeDialogId: fallbackDialog.id,
      activeProjectId: fallbackDialog.forProjectId
    });
    return {
      dialogs: dialogs.filter((dialog2) => dialog2.forProjectId === null).map((dialog2) => this.toDialogListItem(dialog2)),
      activeDialog: fallbackDialog
    };
  }
  deleteMessageFromDialog(dialogId, messageId, activeDialogId) {
    const dialog2 = this.getDialogById(dialogId, activeDialogId);
    const targetMessage = dialog2.messages.find(
      (message) => message.id === messageId
    );
    if (!targetMessage) {
      return dialog2;
    }
    const nextMessages = dialog2.messages.filter(
      (message) => message.id !== messageId && message.answeringAt !== messageId
    );
    const updatedDialog = {
      ...dialog2,
      messages: nextMessages,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.writeDialog(updatedDialog);
    return updatedDialog;
  }
  truncateDialogFromMessage(dialogId, messageId, activeDialogId) {
    const dialog2 = this.getDialogById(dialogId, activeDialogId);
    const messageIndex = dialog2.messages.findIndex(
      (message) => message.id === messageId
    );
    if (messageIndex === -1) {
      return dialog2;
    }
    const updatedDialog = {
      ...dialog2,
      messages: dialog2.messages.slice(0, messageIndex),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.writeDialog(updatedDialog);
    return updatedDialog;
  }
  saveDialogSnapshot(dialog2) {
    const normalizedMessages = dialog2.messages.map(
      (message) => this.normalizeMessage(message)
    );
    const normalizedDialog = {
      id: this.normalizeDialogId(dialog2.id),
      title: typeof dialog2.title === "string" && dialog2.title.trim() ? dialog2.title : "Новый диалог",
      messages: normalizedMessages,
      forProjectId: this.normalizeForProjectId(dialog2.forProjectId),
      createdAt: typeof dialog2.createdAt === "string" && dialog2.createdAt ? dialog2.createdAt : (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.writeDialog(normalizedDialog);
    this.onActiveDialogContextUpdate({
      activeDialogId: normalizedDialog.id,
      activeProjectId: normalizedDialog.forProjectId
    });
    return normalizedDialog;
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
          forProjectId: this.normalizeForProjectId(
            parsed.forProjectId
          ),
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
  writeDialog(dialog2) {
    if (!fs.existsSync(this.dialogsPath)) {
      fs.mkdirSync(this.dialogsPath, { recursive: true });
    }
    const dialogPath = path.join(this.dialogsPath, `${dialog2.id}.json`);
    fs.writeFileSync(dialogPath, JSON.stringify(dialog2, null, 2));
  }
  normalizeDialogId(id) {
    if (typeof id === "string" && id.startsWith("dialog_")) {
      return id;
    }
    return `dialog_${randomUUID().replace(/-/g, "")}`;
  }
  normalizeForProjectId(forProjectId) {
    if (typeof forProjectId === "string" && forProjectId.startsWith("project_")) {
      return forProjectId;
    }
    return null;
  }
  normalizeMessage(message) {
    const rawAuthor = message.author;
    const role = rawAuthor === "assistant" || rawAuthor === "user" || rawAuthor === "system" ? rawAuthor : "assistant";
    const migratedStage = rawAuthor === "tool" ? "tool" : rawAuthor === "thinking" ? "thinking" : void 0;
    const assistantStage = role === "assistant" ? message.assistantStage === "tool" || message.assistantStage === "thinking" || message.assistantStage === "answer" ? message.assistantStage : migratedStage || "answer" : void 0;
    const toolTrace = role === "assistant" && assistantStage === "tool" ? message.toolTrace && typeof message.toolTrace.callId === "string" && typeof message.toolTrace.toolName === "string" && typeof message.toolTrace.args === "object" && message.toolTrace.args !== null ? message.toolTrace : void 0 : void 0;
    return {
      id: typeof message.id === "string" && message.id.startsWith("msg_") ? message.id : `msg_${randomUUID().replace(/-/g, "")}`,
      author: role,
      content: typeof message.content === "string" ? message.content : "",
      timestamp: typeof message.timestamp === "string" && message.timestamp ? message.timestamp : (/* @__PURE__ */ new Date()).toLocaleTimeString("ru-RU", {
        hour: "2-digit",
        minute: "2-digit"
      }),
      ...typeof message.answeringAt === "string" ? { answeringAt: message.answeringAt } : {},
      ...assistantStage ? { assistantStage } : {},
      ...toolTrace ? { toolTrace } : {}
    };
  }
  toDialogListItem(dialog2) {
    const lastMessage = dialog2.messages.length > 0 ? dialog2.messages[dialog2.messages.length - 1] : null;
    return {
      id: dialog2.id,
      title: dialog2.title,
      preview: lastMessage?.content?.trim() || "Пустой диалог — отправьте первое сообщение",
      time: new Date(dialog2.updatedAt).toLocaleTimeString("ru-RU", {
        hour: "2-digit",
        minute: "2-digit"
      }),
      updatedAt: dialog2.updatedAt
    };
  }
}
class ProjectsService {
  constructor(projectsPath) {
    this.projectsPath = projectsPath;
  }
  getProjectsList() {
    return this.readProjects().map(
      (project) => this.toProjectListItem(project)
    );
  }
  getProjectById(projectId) {
    const projects = this.readProjects();
    return projects.find((project) => project.id === projectId) ?? null;
  }
  createProject(payload) {
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const projectDirectoryPath = this.createProjectDirectory(
      payload.directoryPath
    );
    const project = {
      id: this.normalizeProjectId(payload.projectId),
      name: payload.name.trim() || "Новый проект",
      description: payload.description.trim(),
      directoryPath: projectDirectoryPath,
      dialogId: payload.dialogId,
      fileUUIDs: this.normalizeFileIds(payload.fileUUIDs),
      requiredTools: this.normalizeRequiredTools(payload.requiredTools),
      createdAt: now,
      updatedAt: now
    };
    this.writeProject(project);
    return project;
  }
  deleteProject(projectId) {
    const project = this.getProjectById(projectId);
    if (!project) {
      return null;
    }
    const projectPath = path.join(this.projectsPath, `${project.id}.json`);
    if (fs.existsSync(projectPath)) {
      fs.unlinkSync(projectPath);
    }
    return project;
  }
  normalizeProjectId(id) {
    if (typeof id === "string" && id.startsWith("project_")) {
      return id;
    }
    return `project_${randomUUID().replace(/-/g, "")}`;
  }
  normalizeFileIds(fileIds) {
    if (!Array.isArray(fileIds)) {
      return [];
    }
    return fileIds.filter(
      (item) => typeof item === "string"
    );
  }
  normalizeRequiredTools(requiredTools) {
    if (!Array.isArray(requiredTools)) {
      return [];
    }
    return requiredTools.filter(
      (item) => typeof item === "string" && item.trim().length > 0
    );
  }
  normalizeDirectoryPath(directoryPath) {
    if (typeof directoryPath !== "string") {
      return "";
    }
    return directoryPath.trim();
  }
  createProjectDirectory(baseDirectoryPath) {
    const normalizedBaseDirectory = this.normalizeDirectoryPath(baseDirectoryPath);
    if (!normalizedBaseDirectory) {
      return "";
    }
    if (!fs.existsSync(normalizedBaseDirectory)) {
      fs.mkdirSync(normalizedBaseDirectory, { recursive: true });
    }
    const folderUuid = randomUUID().replace(/-/g, "");
    const projectDirectoryPath = path.join(
      normalizedBaseDirectory,
      folderUuid
    );
    if (!fs.existsSync(projectDirectoryPath)) {
      fs.mkdirSync(projectDirectoryPath, { recursive: true });
    }
    return projectDirectoryPath;
  }
  readProjects() {
    if (!fs.existsSync(this.projectsPath)) {
      return [];
    }
    const files = fs.readdirSync(this.projectsPath).filter((fileName) => fileName.endsWith(".json"));
    const projects = [];
    for (const fileName of files) {
      const filePath = path.join(this.projectsPath, fileName);
      try {
        const raw = fs.readFileSync(filePath, "utf-8");
        const parsed = JSON.parse(raw);
        const now = (/* @__PURE__ */ new Date()).toISOString();
        if (typeof parsed.name !== "string" || typeof parsed.description !== "string" || typeof parsed.dialogId !== "string") {
          continue;
        }
        projects.push({
          id: this.normalizeProjectId(parsed.id),
          name: parsed.name.trim() || "Новый проект",
          description: parsed.description,
          directoryPath: this.normalizeDirectoryPath(
            parsed.directoryPath ?? parsed.projectDirectoryPath ?? parsed.projectPath
          ),
          dialogId: parsed.dialogId,
          fileUUIDs: this.normalizeFileIds(
            parsed.fileUUIDs ?? parsed.fileUuids ?? parsed.fileIds
          ),
          requiredTools: this.normalizeRequiredTools(
            parsed.requiredTools
          ),
          createdAt: typeof parsed.createdAt === "string" && parsed.createdAt ? parsed.createdAt : now,
          updatedAt: typeof parsed.updatedAt === "string" && parsed.updatedAt ? parsed.updatedAt : now
        });
      } catch {
        continue;
      }
    }
    projects.sort(
      (left, right) => right.updatedAt.localeCompare(left.updatedAt)
    );
    return projects;
  }
  writeProject(project) {
    if (!fs.existsSync(this.projectsPath)) {
      fs.mkdirSync(this.projectsPath, { recursive: true });
    }
    const projectPath = path.join(this.projectsPath, `${project.id}.json`);
    fs.writeFileSync(projectPath, JSON.stringify(project, null, 2));
  }
  toProjectListItem(project) {
    return {
      id: project.id,
      title: project.name,
      preview: project.description.trim() || "Проект без описания",
      time: new Date(project.updatedAt).toLocaleTimeString("ru-RU", {
        hour: "2-digit",
        minute: "2-digit"
      }),
      updatedAt: project.updatedAt,
      dialogId: project.dialogId
    };
  }
}
class FileStorageService {
  constructor(filesPath, manifestPath) {
    this.filesPath = filesPath;
    this.manifestPath = manifestPath;
  }
  saveFiles(files) {
    const manifest = this.readManifest();
    const saved = [];
    for (const file of files) {
      const fileId = randomUUID().replace(/-/g, "");
      const fileExt = path.extname(file.name || "");
      const encryptedName = `${fileId}${fileExt}`;
      const absolutePath = path.join(this.filesPath, encryptedName);
      const buffer = this.parseDataUrl(file.dataUrl);
      fs.writeFileSync(absolutePath, buffer);
      manifest[fileId] = {
        path: absolutePath,
        originalName: file.name,
        size: Number.isFinite(file.size) ? file.size : buffer.byteLength,
        savedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      saved.push({
        id: fileId,
        ...manifest[fileId]
      });
    }
    this.writeManifest(manifest);
    return saved;
  }
  getFilesByIds(fileIds) {
    const manifest = this.readManifest();
    return fileIds.map((fileId) => {
      const entry = manifest[fileId];
      if (!entry) {
        return null;
      }
      return {
        id: fileId,
        ...entry
      };
    }).filter(Boolean);
  }
  getFileById(fileId) {
    const manifest = this.readManifest();
    const entry = manifest[fileId];
    if (!entry) {
      return null;
    }
    return {
      id: fileId,
      ...entry
    };
  }
  deleteFilesByIds(fileIds) {
    if (!fileIds.length) {
      return;
    }
    const manifest = this.readManifest();
    for (const fileId of fileIds) {
      const entry = manifest[fileId];
      if (!entry) {
        continue;
      }
      if (fs.existsSync(entry.path)) {
        fs.unlinkSync(entry.path);
      }
      delete manifest[fileId];
    }
    this.writeManifest(manifest);
  }
  parseDataUrl(dataUrl) {
    if (typeof dataUrl !== "string") {
      return Buffer.from("");
    }
    const marker = ";base64,";
    const markerIndex = dataUrl.indexOf(marker);
    if (markerIndex === -1) {
      return Buffer.from(dataUrl);
    }
    const base64 = dataUrl.slice(markerIndex + marker.length);
    return Buffer.from(base64, "base64");
  }
  ensureStorage() {
    if (!fs.existsSync(this.filesPath)) {
      fs.mkdirSync(this.filesPath, { recursive: true });
    }
    if (!fs.existsSync(this.manifestPath)) {
      fs.writeFileSync(this.manifestPath, JSON.stringify({}, null, 2));
    }
  }
  readManifest() {
    this.ensureStorage();
    try {
      const rawManifest = fs.readFileSync(this.manifestPath, "utf-8");
      const parsed = JSON.parse(rawManifest);
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        return {};
      }
      return parsed;
    } catch {
      return {};
    }
  }
  writeManifest(manifest) {
    this.ensureStorage();
    fs.writeFileSync(this.manifestPath, JSON.stringify(manifest, null, 2));
  }
}
class UserDataService {
  userProfileService;
  themesService;
  dialogsService;
  projectsService;
  fileStorageService;
  defaultProjectsDirectory;
  constructor(basePath) {
    const paths = createUserDataPaths(basePath);
    this.defaultProjectsDirectory = path.join(
      basePath,
      "resources",
      "projects"
    );
    this.userProfileService = new UserProfileService(paths.profilePath);
    this.themesService = new ThemesService(paths.themesPath);
    this.dialogsService = new DialogsService(
      paths.dialogsPath,
      ({ activeDialogId, activeProjectId }) => {
        this.userProfileService.updateUserProfile({
          activeDialogId,
          activeProjectId
        });
      }
    );
    this.projectsService = new ProjectsService(paths.projectsPath);
    this.fileStorageService = new FileStorageService(
      paths.filesPath,
      paths.storageManifestPath
    );
    this.syncProjectDialogs();
  }
  getActiveDialog() {
    const profile = this.userProfileService.getUserProfile();
    return this.dialogsService.getActiveDialog(profile.activeDialogId);
  }
  getDialogsList() {
    return this.dialogsService.getDialogsList();
  }
  getDialogById(dialogId) {
    const profile = this.userProfileService.getUserProfile();
    return this.dialogsService.getDialogById(
      dialogId,
      profile.activeDialogId
    );
  }
  createDialog() {
    return this.dialogsService.createDialog();
  }
  renameDialog(dialogId, nextTitle) {
    const profile = this.userProfileService.getUserProfile();
    return this.dialogsService.renameDialog(
      dialogId,
      nextTitle,
      profile.activeDialogId
    );
  }
  deleteDialog(dialogId) {
    return this.dialogsService.deleteDialog(dialogId);
  }
  deleteMessageFromDialog(dialogId, messageId) {
    const profile = this.userProfileService.getUserProfile();
    return this.dialogsService.deleteMessageFromDialog(
      dialogId,
      messageId,
      profile.activeDialogId
    );
  }
  truncateDialogFromMessage(dialogId, messageId) {
    const profile = this.userProfileService.getUserProfile();
    return this.dialogsService.truncateDialogFromMessage(
      dialogId,
      messageId,
      profile.activeDialogId
    );
  }
  saveDialogSnapshot(dialog2) {
    return this.dialogsService.saveDialogSnapshot(dialog2);
  }
  getProjectsList() {
    return this.projectsService.getProjectsList();
  }
  getProjectById(projectId) {
    const project = this.projectsService.getProjectById(projectId);
    if (project) {
      this.userProfileService.updateUserProfile({
        activeProjectId: project.id
      });
    } else {
      this.userProfileService.updateUserProfile({
        activeProjectId: null
      });
    }
    return project;
  }
  getDefaultProjectsDirectory() {
    return this.defaultProjectsDirectory;
  }
  createProject(payload) {
    const projectId = `project_${randomUUID().replace(/-/g, "")}`;
    const dialog2 = this.dialogsService.createDialog(projectId);
    const nextTitle = payload.name.trim();
    const selectedBaseDirectory = payload.directoryPath?.trim() || this.defaultProjectsDirectory;
    if (nextTitle) {
      this.dialogsService.renameDialog(dialog2.id, nextTitle);
    }
    return this.projectsService.createProject({
      ...payload,
      directoryPath: selectedBaseDirectory,
      dialogId: dialog2.id,
      projectId
    });
  }
  deleteProject(projectId) {
    const deletedProject = this.projectsService.deleteProject(projectId);
    if (deletedProject) {
      this.fileStorageService.deleteFilesByIds(deletedProject.fileUUIDs);
      this.dialogsService.deleteDialog(deletedProject.dialogId);
      const profile = this.userProfileService.getUserProfile();
      if (profile.activeProjectId === projectId) {
        this.userProfileService.updateUserProfile({
          activeProjectId: null
        });
      }
    }
    return {
      projects: this.projectsService.getProjectsList(),
      deletedProjectId: projectId
    };
  }
  saveFiles(files) {
    return this.fileStorageService.saveFiles(files);
  }
  getFilesByIds(fileIds) {
    return this.fileStorageService.getFilesByIds(fileIds);
  }
  getFileById(fileId) {
    return this.fileStorageService.getFileById(fileId);
  }
  getBootData() {
    const userProfile = this.userProfileService.getUserProfile();
    const preferredThemeData = this.themesService.resolveThemePalette(
      userProfile.themePreference
    );
    return {
      userProfile,
      preferredThemeData
    };
  }
  getThemesList() {
    return this.themesService.getThemesList();
  }
  getThemeData(themeId) {
    return this.themesService.getThemeData(themeId);
  }
  updateUserProfile(nextProfile) {
    return this.userProfileService.updateUserProfile(nextProfile);
  }
  syncProjectDialogs() {
    const projects = this.projectsService.getProjectsList();
    for (const project of projects) {
      this.dialogsService.linkDialogToProject(
        project.dialogId,
        project.id
      );
    }
  }
}
const decodeOutput = (buffer) => {
  const utf8 = buffer.toString("utf8");
  if (process.platform !== "win32") {
    return utf8;
  }
  try {
    const cp866 = new TextDecoder("ibm866").decode(buffer);
    const utf8ReplacementCount = (utf8.match(/�/g) || []).length;
    const cp866ReplacementCount = (cp866.match(/�/g) || []).length;
    return cp866ReplacementCount < utf8ReplacementCount ? cp866 : utf8;
  } catch {
    return utf8;
  }
};
class CommandExecService {
  async execute(command, cwd) {
    const trimmedCommand = command.trim();
    if (!trimmedCommand) {
      throw new Error("Команда для выполнения не указана");
    }
    const resolvedCwd = cwd?.trim() ? path.resolve(cwd) : process.cwd();
    if (!fs.existsSync(resolvedCwd)) {
      throw new Error(`Рабочая директория не существует: ${resolvedCwd}`);
    }
    const executableCommand = process.platform === "win32" ? `chcp 65001>nul & ${trimmedCommand}` : trimmedCommand;
    return await new Promise((resolve, reject) => {
      const child = spawn(executableCommand, {
        cwd: resolvedCwd,
        shell: true,
        windowsHide: true
      });
      const stdoutChunks = [];
      const stderrChunks = [];
      child.stdout.on("data", (chunk) => {
        stdoutChunks.push(
          Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk))
        );
      });
      child.stderr.on("data", (chunk) => {
        stderrChunks.push(
          Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk))
        );
      });
      child.on("error", (error) => {
        reject(error);
      });
      child.on("close", (code) => {
        const stdout = decodeOutput(Buffer.concat(stdoutChunks));
        const stderr = decodeOutput(Buffer.concat(stderrChunks));
        resolve({
          command: trimmedCommand,
          cwd: resolvedCwd,
          isAdmin: false,
          exitCode: typeof code === "number" ? code : -1,
          stdout,
          stderr
        });
      });
    });
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
let commandExecService;
const getMimeTypeByExtension = (filePath) => {
  const extension = path.extname(filePath).toLowerCase();
  const mimeByExtension = {
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".bmp": "image/bmp",
    ".svg": "image/svg+xml",
    ".avif": "image/avif"
  };
  return mimeByExtension[extension] || "application/octet-stream";
};
const imageExtensions = [
  "png",
  "jpg",
  "jpeg",
  "gif",
  "webp",
  "bmp",
  "svg",
  "avif"
];
const extensionByMime = {
  "image/png": ".png",
  "image/jpeg": ".jpg",
  "image/gif": ".gif",
  "image/webp": ".webp",
  "image/bmp": ".bmp",
  "image/svg+xml": ".svg",
  "image/avif": ".avif"
};
const isRemoteUrl = (value) => /^https?:\/\//i.test(value);
const isDataUrl = (value) => /^data:/i.test(value);
const isFileUrl = (value) => /^file:\/\//i.test(value);
const ensureImageExt = (fileName, mimeType) => {
  const ext = path.extname(fileName).toLowerCase();
  if (ext) {
    return fileName;
  }
  return `${fileName}${extensionByMime[mimeType] || ".png"}`;
};
const parseDataUrl = (src) => {
  const marker = ";base64,";
  const markerIndex = src.indexOf(marker);
  if (markerIndex === -1) {
    throw new Error("Invalid data URL");
  }
  const header = src.slice(0, markerIndex);
  const mimeType = header.slice(5) || "application/octet-stream";
  const base64 = src.slice(markerIndex + marker.length);
  return {
    mimeType,
    buffer: Buffer.from(base64, "base64")
  };
};
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
  commandExecService = new CommandExecService();
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
  ipcMain.handle(
    "app:get-dialogs-list",
    () => userDataService.getDialogsList()
  );
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
    (_event, dialog2) => userDataService.saveDialogSnapshot(dialog2)
  );
  ipcMain.handle(
    "app:get-projects-list",
    () => userDataService.getProjectsList()
  );
  ipcMain.handle(
    "app:get-default-projects-directory",
    () => userDataService.getDefaultProjectsDirectory()
  );
  ipcMain.handle(
    "app:get-project-by-id",
    (_event, projectId) => userDataService.getProjectById(projectId)
  );
  ipcMain.handle(
    "app:create-project",
    (_event, payload) => userDataService.createProject(payload)
  );
  ipcMain.handle(
    "app:delete-project",
    (_event, projectId) => userDataService.deleteProject(projectId)
  );
  ipcMain.handle(
    "app:save-files",
    (_event, files) => userDataService.saveFiles(files)
  );
  ipcMain.handle(
    "app:get-files-by-ids",
    (_event, fileIds) => userDataService.getFilesByIds(fileIds)
  );
  ipcMain.handle("app:open-saved-file", async (_event, fileId) => {
    const file = userDataService.getFileById(fileId);
    if (!file) {
      return false;
    }
    const openResult = await shell.openPath(file.path);
    return openResult === "";
  });
  ipcMain.handle("app:open-path", async (_event, targetPath) => {
    if (!targetPath || typeof targetPath !== "string") {
      return false;
    }
    const openResult = await shell.openPath(targetPath);
    return openResult === "";
  });
  ipcMain.handle("app:open-external-url", async (_event, url) => {
    if (!url || typeof url !== "string") {
      return false;
    }
    try {
      await shell.openExternal(url);
      return true;
    } catch {
      return false;
    }
  });
  ipcMain.handle(
    "app:save-image-from-source",
    async (event, payload) => {
      const source = typeof payload?.src === "string" ? payload.src.trim() : "";
      if (!source) {
        return null;
      }
      const preferredFileName = typeof payload.preferredFileName === "string" ? payload.preferredFileName.trim() : "";
      let sourceKind = "local";
      let buffer;
      let mimeType = "application/octet-stream";
      let fileName = preferredFileName || "image";
      if (isDataUrl(source)) {
        sourceKind = "data-url";
        const parsed = parseDataUrl(source);
        buffer = parsed.buffer;
        mimeType = parsed.mimeType;
        fileName = ensureImageExt(fileName, mimeType);
      } else if (isRemoteUrl(source)) {
        sourceKind = "remote";
        const response = await fetch(source);
        if (!response.ok) {
          throw new Error(
            `Failed to fetch image (${response.status})`
          );
        }
        const arrayBuffer = await response.arrayBuffer();
        buffer = Buffer.from(arrayBuffer);
        mimeType = response.headers.get("content-type") || mimeType;
        const remoteName = path.basename(
          new URL(source).pathname || "image"
        );
        fileName = preferredFileName || remoteName || "image";
        fileName = ensureImageExt(fileName, mimeType);
      } else {
        sourceKind = "local";
        const localPath = isFileUrl(source) ? fileURLToPath(source) : source;
        buffer = await fs$1.readFile(localPath);
        mimeType = getMimeTypeByExtension(localPath);
        fileName = preferredFileName || path.basename(localPath);
        fileName = ensureImageExt(fileName, mimeType);
      }
      const currentWindow = BrowserWindow.fromWebContents(event.sender);
      const defaultPath = app.getPath("downloads");
      const targetPathByDialog = currentWindow ? await dialog.showSaveDialog(currentWindow, {
        title: "Сохранить изображение",
        defaultPath: path.join(defaultPath, fileName),
        filters: [
          {
            name: "Images",
            extensions: imageExtensions
          }
        ]
      }) : await dialog.showSaveDialog({
        title: "Сохранить изображение",
        defaultPath: path.join(defaultPath, fileName),
        filters: [
          {
            name: "Images",
            extensions: imageExtensions
          }
        ]
      });
      if (targetPathByDialog.canceled || !targetPathByDialog.filePath) {
        return null;
      }
      await fs$1.writeFile(targetPathByDialog.filePath, buffer);
      return {
        savedPath: targetPathByDialog.filePath,
        fileName: path.basename(targetPathByDialog.filePath),
        mimeType,
        size: buffer.byteLength,
        sourceKind
      };
    }
  );
  ipcMain.handle(
    "app:exec-shell-command",
    (_event, command, cwd) => commandExecService.execute(command, cwd)
  );
  ipcMain.handle(
    "app:pick-files",
    async (event, options) => {
      const currentWindow = BrowserWindow.fromWebContents(event.sender);
      const accept = options?.accept ?? [];
      const filters = accept.length > 0 ? [
        {
          name: "Allowed files",
          extensions: accept.flatMap(
            (item) => item.split(",").map(
              (part) => part.trim().toLowerCase()
            )
          ).flatMap(
            (item) => item === "image/*" ? imageExtensions : [item]
          ).map(
            (item) => item.startsWith(".") ? item.slice(1) : item.replace(/^[*]/, "").replace(/^[.]/, "")
          ).filter((item) => item && item !== "*")
        }
      ] : [];
      const dialogProperties = [
        "openFile"
      ];
      if (options?.multiple) {
        dialogProperties.push("multiSelections");
      }
      const openDialogOptions = {
        properties: dialogProperties,
        filters
      };
      const selection = currentWindow ? await dialog.showOpenDialog(currentWindow, openDialogOptions) : await dialog.showOpenDialog(openDialogOptions);
      if (selection.canceled || selection.filePaths.length === 0) {
        return [];
      }
      const files = await Promise.all(
        selection.filePaths.map(
          async (filePath) => {
            const buffer = await readFile(filePath);
            const mimeType = getMimeTypeByExtension(filePath);
            return {
              name: path.basename(filePath),
              mimeType,
              size: buffer.byteLength,
              dataUrl: `data:${mimeType};base64,${buffer.toString("base64")}`
            };
          }
        )
      );
      return files;
    }
  );
  ipcMain.handle(
    "app:pick-path",
    async (event, options) => {
      const currentWindow = BrowserWindow.fromWebContents(event.sender);
      const dialogProperties = [
        options?.forFolders ? "openDirectory" : "openFile"
      ];
      const openDialogOptions = {
        properties: dialogProperties
      };
      const selection = currentWindow ? await dialog.showOpenDialog(currentWindow, openDialogOptions) : await dialog.showOpenDialog(openDialogOptions);
      if (selection.canceled || selection.filePaths.length === 0) {
        return null;
      }
      return selection.filePaths[0] ?? null;
    }
  );
  createWindow();
});
export {
  MAIN_DIST,
  RENDERER_DIST,
  VITE_DEV_SERVER_URL
};
