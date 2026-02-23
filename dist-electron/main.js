import path from "node:path";
import fs$1, { readFile } from "node:fs/promises";
import { BrowserWindow, app, ipcMain, shell, dialog } from "electron";
import { fileURLToPath } from "node:url";
import fs from "node:fs";
import { randomUUID, randomBytes } from "node:crypto";
import Database from "better-sqlite3";
import { spawn } from "node:child_process";
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
  resourcesPath;
  themesPath;
  filesPath;
  metaPath;
  databasePath;
  constructor(paths) {
    this.resourcesPath = paths.resourcesPath;
    this.themesPath = paths.themesPath;
    this.filesPath = paths.filesPath;
    this.metaPath = paths.metaPath;
    this.databasePath = paths.databasePath;
  }
  initialize() {
    this.ensureDirectory(this.resourcesPath);
    this.ensureDirectory(this.themesPath);
    this.ensureDirectory(this.filesPath);
    this.ensureDatabase(this.databasePath);
    this.ensureMeta();
    this.ensureThemes();
  }
  ensureDirectory(targetPath) {
    if (!fs.existsSync(targetPath)) {
      fs.mkdirSync(targetPath, { recursive: true });
    }
  }
  ensureDatabase(databasePath) {
    if (!fs.existsSync(databasePath)) {
      fs.writeFileSync(databasePath, "");
    }
  }
  ensureMeta() {
    if (!fs.existsSync(this.metaPath)) {
      fs.writeFileSync(
        this.metaPath,
        JSON.stringify({ currentUserId: "" }, null, 2)
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
  activeDialogId: null,
  activeProjectId: null,
  activeScenarioId: null,
  lastActiveTab: "dialogs"
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
const isChatDriver = (value) => {
  return value === "ollama" || value === "";
};
const isWorkspaceTab = (value) => {
  return value === "dialogs" || value === "projects" || value === "scenario";
};
const normalizeNullableId = (value) => {
  if (typeof value !== "string") {
    return null;
  }
  const trimmedValue = value.trim();
  return trimmedValue.length > 0 ? trimmedValue : null;
};
const normalizeWorkspaceContext = (profile) => {
  const inferredTab = profile.activeScenarioId ? "scenario" : profile.activeProjectId ? "projects" : "dialogs";
  const lastActiveTab = profile.lastActiveTab || inferredTab;
  if (lastActiveTab === "dialogs") {
    return {
      ...profile,
      activeProjectId: null,
      activeScenarioId: null,
      lastActiveTab
    };
  }
  if (lastActiveTab === "projects") {
    return {
      ...profile,
      activeProjectId: normalizeNullableId(profile.activeProjectId),
      activeScenarioId: null,
      lastActiveTab
    };
  }
  return {
    ...profile,
    activeDialogId: null,
    activeProjectId: null,
    activeScenarioId: normalizeNullableId(profile.activeScenarioId),
    lastActiveTab
  };
};
class UserProfileService {
  constructor(databaseService, metaService) {
    this.databaseService = databaseService;
    this.metaService = metaService;
    this.currentUserId = this.ensureCurrentUserProfile();
  }
  currentUserId;
  getCurrentUserId() {
    return this.currentUserId;
  }
  getUserProfile() {
    const parsed = this.databaseService.getProfileRaw(
      this.currentUserId
    );
    if (!parsed || typeof parsed !== "object") {
      return defaultProfile;
    }
    try {
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
        activeDialogId: normalizeNullableId(parsed.activeDialogId),
        activeProjectId: normalizeNullableId(parsed.activeProjectId),
        activeScenarioId: normalizeNullableId(parsed.activeScenarioId),
        lastActiveTab: isWorkspaceTab(parsed.lastActiveTab) ? parsed.lastActiveTab : defaultProfile.lastActiveTab
      };
      return normalizeWorkspaceContext(normalized);
    } catch {
      return defaultProfile;
    }
  }
  updateUserProfile(nextProfile) {
    const currentProfile = this.getUserProfile();
    const mergedProfile = normalizeWorkspaceContext({
      ...currentProfile,
      ...nextProfile
    });
    this.databaseService.updateProfileRaw(
      this.currentUserId,
      mergedProfile
    );
    return mergedProfile;
  }
  ensureCurrentUserProfile() {
    const currentUserIdFromMeta = this.metaService.getCurrentUserId();
    if (currentUserIdFromMeta && this.databaseService.hasProfile(currentUserIdFromMeta)) {
      return currentUserIdFromMeta;
    }
    const profileId = randomUUID();
    const secretKey = randomBytes(32).toString("hex");
    this.databaseService.createProfile(
      profileId,
      defaultProfile,
      secretKey
    );
    this.metaService.setCurrentUserId(profileId);
    return profileId;
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
  constructor(databaseService, onActiveDialogContextUpdate, createdBy) {
    this.databaseService = databaseService;
    this.onActiveDialogContextUpdate = onActiveDialogContextUpdate;
    this.createdBy = createdBy;
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
    const standaloneDialogs = this.readDialogs().filter(
      (dialog2) => dialog2.forProjectId === null
    );
    if (standaloneDialogs.length === 0) {
      const baseDialog = createBaseDialog();
      this.writeDialog(baseDialog);
      this.onActiveDialogContextUpdate({
        activeDialogId: baseDialog.id,
        activeProjectId: baseDialog.forProjectId
      });
      return [this.toDialogListItem(baseDialog)];
    }
    return standaloneDialogs.map((dialog2) => this.toDialogListItem(dialog2));
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
    this.databaseService.deleteDialog(dialogId, this.createdBy);
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
    const dialogs = [];
    for (const rawItem of this.databaseService.getDialogsRaw(
      this.createdBy
    )) {
      const parsed = rawItem;
      if (!Array.isArray(parsed.messages)) {
        continue;
      }
      const normalizedMessages = parsed.messages.map((message) => this.normalizeMessage(message)).filter(Boolean);
      dialogs.push({
        id: this.normalizeDialogId(parsed.id),
        title: typeof parsed.title === "string" && parsed.title.trim() ? parsed.title : "Новый диалог",
        messages: normalizedMessages,
        forProjectId: this.normalizeForProjectId(parsed.forProjectId),
        createdAt: typeof parsed.createdAt === "string" && parsed.createdAt ? parsed.createdAt : (/* @__PURE__ */ new Date()).toISOString(),
        updatedAt: typeof parsed.updatedAt === "string" && parsed.updatedAt ? parsed.updatedAt : (/* @__PURE__ */ new Date()).toISOString()
      });
    }
    dialogs.sort(
      (left, right) => right.updatedAt.localeCompare(left.updatedAt)
    );
    return dialogs;
  }
  writeDialog(dialog2) {
    this.databaseService.upsertDialogRaw(dialog2.id, dialog2, this.createdBy);
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
  constructor(databaseService, createdBy) {
    this.databaseService = databaseService;
    this.createdBy = createdBy;
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
    this.databaseService.deleteProject(project.id, this.createdBy);
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
    const projects = [];
    for (const rawItem of this.databaseService.getProjectsRaw(
      this.createdBy
    )) {
      const parsed = rawItem;
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
    }
    projects.sort(
      (left, right) => right.updatedAt.localeCompare(left.updatedAt)
    );
    return projects;
  }
  writeProject(project) {
    this.databaseService.upsertProjectRaw(
      project.id,
      project,
      this.createdBy
    );
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
class ScenariosService {
  constructor(databaseService, createdBy) {
    this.databaseService = databaseService;
    this.createdBy = createdBy;
  }
  getScenariosList() {
    return this.readScenarios().map(
      (scenario) => this.toScenarioListItem(scenario)
    );
  }
  getScenarioById(scenarioId) {
    const scenarios = this.readScenarios();
    return scenarios.find((scenario) => scenario.id === scenarioId) ?? null;
  }
  createScenario(payload) {
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const scenario = {
      id: this.normalizeScenarioId(void 0),
      name: payload.name.trim() || "Новый сценарий",
      description: payload.description.trim(),
      content: this.normalizeContent(payload.content),
      cachedModelScenarioHash: "",
      cachedModelScenario: "",
      createdAt: now,
      updatedAt: now
    };
    this.writeScenario(scenario);
    return scenario;
  }
  updateScenario(scenarioId, payload) {
    const current = this.getScenarioById(scenarioId);
    if (!current) {
      return null;
    }
    const next = {
      ...current,
      name: payload.name.trim() || current.name,
      description: payload.description.trim(),
      content: this.normalizeContent(payload.content ?? current.content),
      cachedModelScenarioHash: typeof payload.cachedModelScenarioHash === "string" ? payload.cachedModelScenarioHash : current.cachedModelScenarioHash ?? "",
      cachedModelScenario: typeof payload.cachedModelScenario === "string" ? payload.cachedModelScenario : current.cachedModelScenario ?? "",
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.writeScenario(next);
    return next;
  }
  deleteScenario(scenarioId) {
    const scenario = this.getScenarioById(scenarioId);
    if (!scenario) {
      return null;
    }
    this.databaseService.deleteScenario(scenario.id, this.createdBy);
    return scenario;
  }
  readScenarios() {
    const scenarios = [];
    for (const rawItem of this.databaseService.getScenariosRaw(
      this.createdBy
    )) {
      const parsed = rawItem;
      const now = (/* @__PURE__ */ new Date()).toISOString();
      if (typeof parsed.name !== "string" || typeof parsed.description !== "string") {
        continue;
      }
      scenarios.push({
        id: this.normalizeScenarioId(parsed.id),
        name: parsed.name.trim() || "Новый сценарий",
        description: parsed.description,
        content: this.normalizeContent(parsed.content),
        cachedModelScenarioHash: typeof parsed.cachedModelScenarioHash === "string" ? parsed.cachedModelScenarioHash : "",
        cachedModelScenario: typeof parsed.cachedModelScenario === "string" ? parsed.cachedModelScenario : "",
        createdAt: typeof parsed.createdAt === "string" && parsed.createdAt ? parsed.createdAt : now,
        updatedAt: typeof parsed.updatedAt === "string" && parsed.updatedAt ? parsed.updatedAt : now
      });
    }
    scenarios.sort(
      (left, right) => right.updatedAt.localeCompare(left.updatedAt)
    );
    return scenarios;
  }
  writeScenario(scenario) {
    this.databaseService.upsertScenarioRaw(
      scenario.id,
      scenario,
      this.createdBy
    );
  }
  normalizeScenarioId(id) {
    if (typeof id === "string" && id.startsWith("scenario_")) {
      return id;
    }
    return `scenario_${randomUUID().replace(/-/g, "")}`;
  }
  normalizeContent(content) {
    if (content && typeof content === "object" && !Array.isArray(content)) {
      return content;
    }
    return {};
  }
  toScenarioListItem(scenario) {
    return {
      id: scenario.id,
      title: scenario.name,
      preview: scenario.description.trim() || "Сценарий без описания",
      time: new Date(scenario.updatedAt).toLocaleTimeString("ru-RU", {
        hour: "2-digit",
        minute: "2-digit"
      }),
      updatedAt: scenario.updatedAt
    };
  }
}
const defaultMeta = {
  currentUserId: ""
};
class MetaService {
  constructor(metaPath) {
    this.metaPath = metaPath;
  }
  getCurrentUserId() {
    const parsed = this.readMeta();
    const userId = typeof parsed.currentUserId === "string" ? parsed.currentUserId.trim() : "";
    return userId || null;
  }
  setCurrentUserId(userId) {
    const normalizedUserId = typeof userId === "string" ? userId.trim() : "";
    fs.writeFileSync(
      this.metaPath,
      JSON.stringify(
        {
          currentUserId: normalizedUserId
        },
        null,
        2
      )
    );
  }
  readMeta() {
    if (!fs.existsSync(this.metaPath)) {
      return defaultMeta;
    }
    try {
      const raw = fs.readFileSync(this.metaPath, "utf-8");
      const parsed = JSON.parse(raw);
      return {
        currentUserId: typeof parsed.currentUserId === "string" ? parsed.currentUserId : ""
      };
    } catch {
      return defaultMeta;
    }
  }
}
class FileStorageService {
  constructor(filesPath, databaseService, createdBy) {
    this.filesPath = filesPath;
    this.databaseService = databaseService;
    this.createdBy = createdBy;
  }
  saveFiles(files) {
    this.ensureStorage();
    const saved = [];
    for (const file of files) {
      const fileId = randomUUID().replace(/-/g, "");
      const fileExt = path.extname(file.name || "");
      const encryptedName = `${fileId}${fileExt}`;
      const absolutePath = path.join(this.filesPath, encryptedName);
      const buffer = this.parseDataUrl(file.dataUrl);
      fs.writeFileSync(absolutePath, buffer);
      const entry = {
        path: absolutePath,
        originalName: file.name,
        size: Number.isFinite(file.size) ? file.size : buffer.byteLength,
        savedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      this.databaseService.upsertFile(fileId, entry, this.createdBy);
      saved.push({
        id: fileId,
        ...entry
      });
    }
    return saved;
  }
  getFilesByIds(fileIds) {
    return this.databaseService.getFilesByIds(fileIds, this.createdBy);
  }
  getFileById(fileId) {
    return this.databaseService.getFileById(fileId, this.createdBy);
  }
  deleteFilesByIds(fileIds) {
    if (!fileIds.length) {
      return;
    }
    const files = this.databaseService.getFilesByIds(
      fileIds,
      this.createdBy
    );
    for (const entry of files) {
      if (fs.existsSync(entry.path)) {
        fs.unlinkSync(entry.path);
      }
    }
    this.databaseService.deleteFilesByIds(fileIds, this.createdBy);
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
  }
}
class DatabaseService {
  constructor(databasePath) {
    this.databasePath = databasePath;
    this.database = new Database(this.databasePath);
    this.database.pragma("journal_mode = WAL");
    this.database.pragma("foreign_keys = ON");
    this.initializeSchema();
  }
  database;
  createProfile(profileId, payload, secretKey) {
    const now = (/* @__PURE__ */ new Date()).toISOString();
    this.database.prepare(
      `
                INSERT INTO profiles (id, data, secret_key, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?)
                `
    ).run(profileId, JSON.stringify(payload), secretKey, now, now);
  }
  hasProfile(profileId) {
    const row = this.database.prepare(`SELECT id FROM profiles WHERE id = ?`).get(profileId);
    return Boolean(row?.id);
  }
  getProfileRaw(profileId) {
    const row = this.database.prepare(`SELECT data FROM profiles WHERE id = ?`).get(profileId);
    if (!row) {
      return null;
    }
    return this.tryParseJson(row.data);
  }
  updateProfileRaw(profileId, payload) {
    this.database.prepare(
      `
                UPDATE profiles
                SET data = ?,
                    updated_at = ?
                WHERE id = ?
                `
    ).run(JSON.stringify(payload), (/* @__PURE__ */ new Date()).toISOString(), profileId);
  }
  upsertDialogRaw(dialogId, payload, createdBy) {
    const payloadRecord = payload && typeof payload === "object" ? payload : {};
    const updatedAt = typeof payloadRecord.updatedAt === "string" && payloadRecord.updatedAt ? payloadRecord.updatedAt : (/* @__PURE__ */ new Date()).toISOString();
    this.database.prepare(
      `
                INSERT INTO dialogs (id, payload_json, updated_at, created_by)
                VALUES (?, ?, ?, ?)
                ON CONFLICT(id) DO UPDATE SET
                    payload_json = excluded.payload_json,
                    updated_at = excluded.updated_at,
                    created_by = excluded.created_by
                `
    ).run(dialogId, JSON.stringify(payload), updatedAt, createdBy);
  }
  getDialogsRaw(createdBy) {
    const rows = this.database.prepare(
      `SELECT payload_json
                 FROM dialogs
                 WHERE created_by = ?
                 ORDER BY updated_at DESC`
    ).all(createdBy);
    return rows.map((row) => this.tryParseJson(row.payload_json)).filter((row) => row !== null);
  }
  deleteDialog(dialogId, createdBy) {
    this.database.prepare(`DELETE FROM dialogs WHERE id = ? AND created_by = ?`).run(dialogId, createdBy);
  }
  upsertProjectRaw(projectId, payload, createdBy) {
    const payloadRecord = payload && typeof payload === "object" ? payload : {};
    const updatedAt = typeof payloadRecord.updatedAt === "string" && payloadRecord.updatedAt ? payloadRecord.updatedAt : (/* @__PURE__ */ new Date()).toISOString();
    this.database.prepare(
      `
                INSERT INTO projects (id, payload_json, updated_at, created_by)
                VALUES (?, ?, ?, ?)
                ON CONFLICT(id) DO UPDATE SET
                    payload_json = excluded.payload_json,
                    updated_at = excluded.updated_at,
                    created_by = excluded.created_by
                `
    ).run(projectId, JSON.stringify(payload), updatedAt, createdBy);
  }
  getProjectsRaw(createdBy) {
    const rows = this.database.prepare(
      `SELECT payload_json
                 FROM projects
                 WHERE created_by = ?
                 ORDER BY updated_at DESC`
    ).all(createdBy);
    return rows.map((row) => this.tryParseJson(row.payload_json)).filter((row) => row !== null);
  }
  deleteProject(projectId, createdBy) {
    this.database.prepare(`DELETE FROM projects WHERE id = ? AND created_by = ?`).run(projectId, createdBy);
  }
  upsertScenarioRaw(scenarioId, payload, createdBy) {
    const payloadRecord = payload && typeof payload === "object" ? payload : {};
    const cachedModelScenarioHash = typeof payloadRecord.cachedModelScenarioHash === "string" ? payloadRecord.cachedModelScenarioHash : typeof payloadRecord.cached_model_scenario_hash === "string" ? payloadRecord.cached_model_scenario_hash : null;
    const cachedModelScenario = typeof payloadRecord.cachedModelScenario === "string" ? payloadRecord.cachedModelScenario : typeof payloadRecord.cached_model_scenario === "string" ? payloadRecord.cached_model_scenario : null;
    const payloadForStorage = this.sanitizeScenarioPayload(payloadRecord);
    const updatedAt = typeof payloadRecord.updatedAt === "string" && payloadRecord.updatedAt ? payloadRecord.updatedAt : (/* @__PURE__ */ new Date()).toISOString();
    this.database.prepare(
      `
                INSERT INTO scenarios (
                    id,
                    payload_json,
                    updated_at,
                    cached_model_scenario_hash,
                    cached_model_scenario,
                    created_by
                )
                VALUES (?, ?, ?, ?, ?, ?)
                ON CONFLICT(id) DO UPDATE SET
                    payload_json = excluded.payload_json,
                    updated_at = excluded.updated_at,
                    cached_model_scenario_hash = excluded.cached_model_scenario_hash,
                    cached_model_scenario = excluded.cached_model_scenario,
                    created_by = excluded.created_by
                `
    ).run(
      scenarioId,
      JSON.stringify(payloadForStorage),
      updatedAt,
      cachedModelScenarioHash,
      cachedModelScenario,
      createdBy
    );
  }
  getScenariosRaw(createdBy) {
    const rows = this.database.prepare(
      `SELECT
                    payload_json,
                    cached_model_scenario_hash,
                    cached_model_scenario
                 FROM scenarios
                 WHERE created_by = ?
                 ORDER BY updated_at DESC`
    ).all(createdBy);
    return rows.map((row) => {
      const parsed = this.tryParseJson(row.payload_json);
      if (!parsed || typeof parsed !== "object") {
        return null;
      }
      return {
        ...parsed,
        ...typeof row.cached_model_scenario_hash === "string" ? {
          cachedModelScenarioHash: row.cached_model_scenario_hash
        } : {},
        ...typeof row.cached_model_scenario === "string" ? {
          cachedModelScenario: row.cached_model_scenario
        } : {}
      };
    }).filter((row) => row !== null);
  }
  deleteScenario(scenarioId, createdBy) {
    this.database.prepare(`DELETE FROM scenarios WHERE id = ? AND created_by = ?`).run(scenarioId, createdBy);
  }
  upsertFile(fileId, entry, createdBy) {
    this.database.prepare(
      `
                INSERT INTO files (id, path, original_name, size, saved_at, created_by)
                VALUES (?, ?, ?, ?, ?, ?)
                ON CONFLICT(id) DO UPDATE SET
                    path = excluded.path,
                    original_name = excluded.original_name,
                    size = excluded.size,
                    saved_at = excluded.saved_at,
                    created_by = excluded.created_by
                `
    ).run(
      fileId,
      entry.path,
      entry.originalName,
      entry.size,
      entry.savedAt,
      createdBy
    );
  }
  getFilesByIds(fileIds, createdBy) {
    if (!fileIds.length) {
      return [];
    }
    const placeholders = fileIds.map(() => "?").join(", ");
    const rows = this.database.prepare(
      `SELECT id, path, original_name, size, saved_at
                 FROM files
                                 WHERE created_by = ?
                                     AND id IN (${placeholders})`
    ).all(createdBy, ...fileIds);
    const byId = new Map(
      rows.map((row) => [
        row.id,
        {
          id: row.id,
          path: row.path,
          originalName: row.original_name,
          size: row.size,
          savedAt: row.saved_at
        }
      ])
    );
    return fileIds.map((fileId) => byId.get(fileId)).filter((file) => Boolean(file));
  }
  getFileById(fileId, createdBy) {
    const row = this.database.prepare(
      `SELECT id, path, original_name, size, saved_at
                 FROM files
                 WHERE id = ?
                   AND created_by = ?`
    ).get(fileId, createdBy);
    if (!row) {
      return null;
    }
    return {
      id: row.id,
      path: row.path,
      originalName: row.original_name,
      size: row.size,
      savedAt: row.saved_at
    };
  }
  deleteFilesByIds(fileIds, createdBy) {
    if (!fileIds.length) {
      return;
    }
    const statement = this.database.prepare(
      `DELETE FROM files WHERE id = ? AND created_by = ?`
    );
    const transaction = this.database.transaction((ids) => {
      for (const fileId of ids) {
        statement.run(fileId, createdBy);
      }
    });
    transaction(fileIds);
  }
  getCacheEntry(key) {
    const row = this.database.prepare(
      `SELECT collected_at, ttl_seconds, expires_at, data_json
                 FROM cache
                 WHERE key = ?`
    ).get(key);
    if (!row) {
      return null;
    }
    const parsedData = this.tryParseJson(row.data_json);
    if (parsedData === null) {
      return null;
    }
    return {
      collectedAt: row.collected_at,
      ttlSeconds: row.ttl_seconds,
      expiresAt: row.expires_at,
      data: parsedData
    };
  }
  setCacheEntry(key, entry) {
    this.database.prepare(
      `
                INSERT INTO cache (key, collected_at, ttl_seconds, expires_at, data_json)
                VALUES (?, ?, ?, ?, ?)
                ON CONFLICT(key) DO UPDATE SET
                    collected_at = excluded.collected_at,
                    ttl_seconds = excluded.ttl_seconds,
                    expires_at = excluded.expires_at,
                    data_json = excluded.data_json
                `
    ).run(
      key,
      entry.collectedAt,
      entry.ttlSeconds,
      entry.expiresAt,
      JSON.stringify(entry.data)
    );
  }
  initializeSchema() {
    this.database.exec(`
            CREATE TABLE IF NOT EXISTS profiles (
                id TEXT PRIMARY KEY,
                data TEXT NOT NULL,
                secret_key TEXT NOT NULL,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS dialogs (
                id TEXT PRIMARY KEY,
                payload_json TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                created_by TEXT NOT NULL,
                FOREIGN KEY(created_by) REFERENCES profiles(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS projects (
                id TEXT PRIMARY KEY,
                payload_json TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                created_by TEXT NOT NULL,
                FOREIGN KEY(created_by) REFERENCES profiles(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS scenarios (
                id TEXT PRIMARY KEY,
                payload_json TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                cached_model_scenario_hash TEXT,
                cached_model_scenario TEXT,
                created_by TEXT NOT NULL,
                FOREIGN KEY(created_by) REFERENCES profiles(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS files (
                id TEXT PRIMARY KEY,
                path TEXT NOT NULL,
                original_name TEXT NOT NULL,
                size INTEGER NOT NULL,
                saved_at TEXT NOT NULL,
                created_by TEXT NOT NULL,
                FOREIGN KEY(created_by) REFERENCES profiles(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS cache (
                key TEXT PRIMARY KEY,
                collected_at INTEGER NOT NULL,
                ttl_seconds INTEGER NOT NULL,
                expires_at INTEGER NOT NULL,
                data_json TEXT NOT NULL
            );

            CREATE INDEX IF NOT EXISTS idx_dialogs_created_by ON dialogs(created_by);
            CREATE INDEX IF NOT EXISTS idx_dialogs_updated_at ON dialogs(updated_at DESC);
            CREATE INDEX IF NOT EXISTS idx_projects_created_by ON projects(created_by);
            CREATE INDEX IF NOT EXISTS idx_projects_updated_at ON projects(updated_at DESC);
            CREATE INDEX IF NOT EXISTS idx_scenarios_created_by ON scenarios(created_by);
            CREATE INDEX IF NOT EXISTS idx_scenarios_updated_at ON scenarios(updated_at DESC);
            CREATE INDEX IF NOT EXISTS idx_files_created_by ON files(created_by);
            CREATE INDEX IF NOT EXISTS idx_cache_expires_at ON cache(expires_at);
        `);
  }
  sanitizeScenarioPayload(payloadRecord) {
    const content = payloadRecord.content && typeof payloadRecord.content === "object" && !Array.isArray(payloadRecord.content) ? {
      ...payloadRecord.content
    } : void 0;
    if (content && "scenarioFlowCache" in content) {
      delete content.scenarioFlowCache;
    }
    return {
      ...payloadRecord,
      ...content ? { content } : {},
      cachedModelScenarioHash: void 0,
      cachedModelScenario: void 0,
      cached_model_scenario_hash: void 0,
      cached_model_scenario: void 0
    };
  }
  tryParseJson(raw) {
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }
}
class UserDataService {
  userProfileService;
  themesService;
  dialogsService;
  projectsService;
  scenariosService;
  fileStorageService;
  databaseService;
  defaultProjectsDirectory;
  constructor(paths) {
    this.defaultProjectsDirectory = paths.defaultProjectsDirectory;
    this.databaseService = new DatabaseService(paths.databasePath);
    const metaService = new MetaService(paths.metaPath);
    this.userProfileService = new UserProfileService(
      this.databaseService,
      metaService
    );
    const currentUserId = this.userProfileService.getCurrentUserId();
    this.themesService = new ThemesService(paths.themesPath);
    this.dialogsService = new DialogsService(
      this.databaseService,
      ({ activeDialogId, activeProjectId }) => {
        this.userProfileService.updateUserProfile({
          activeDialogId,
          activeProjectId,
          activeScenarioId: null,
          lastActiveTab: activeProjectId ? "projects" : "dialogs"
        });
      },
      currentUserId
    );
    this.projectsService = new ProjectsService(
      this.databaseService,
      currentUserId
    );
    this.scenariosService = new ScenariosService(
      this.databaseService,
      currentUserId
    );
    this.fileStorageService = new FileStorageService(
      paths.filesPath,
      this.databaseService,
      currentUserId
    );
    this.syncProjectDialogs();
  }
  getActiveDialog() {
    const profile = this.userProfileService.getUserProfile();
    return this.dialogsService.getActiveDialog(
      profile.activeDialogId ?? void 0
    );
  }
  getDialogsList() {
    return this.dialogsService.getDialogsList();
  }
  getDialogById(dialogId) {
    const profile = this.userProfileService.getUserProfile();
    return this.dialogsService.getDialogById(
      dialogId,
      profile.activeDialogId ?? void 0
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
      profile.activeDialogId ?? void 0
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
      profile.activeDialogId ?? void 0
    );
  }
  truncateDialogFromMessage(dialogId, messageId) {
    const profile = this.userProfileService.getUserProfile();
    return this.dialogsService.truncateDialogFromMessage(
      dialogId,
      messageId,
      profile.activeDialogId ?? void 0
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
        activeProjectId: project.id,
        activeScenarioId: null,
        lastActiveTab: "projects"
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
    const project = this.projectsService.createProject({
      ...payload,
      directoryPath: selectedBaseDirectory,
      dialogId: dialog2.id,
      projectId
    });
    this.userProfileService.updateUserProfile({
      activeScenarioId: null,
      lastActiveTab: "projects"
    });
    return project;
  }
  deleteProject(projectId) {
    const deletedProject = this.projectsService.deleteProject(projectId);
    if (deletedProject) {
      this.fileStorageService.deleteFilesByIds(deletedProject.fileUUIDs);
      this.dialogsService.deleteDialog(deletedProject.dialogId);
      const profile = this.userProfileService.getUserProfile();
      if (profile.activeProjectId === projectId) {
        this.userProfileService.updateUserProfile({
          activeProjectId: null,
          activeScenarioId: null,
          lastActiveTab: "dialogs"
        });
      }
    }
    return {
      projects: this.projectsService.getProjectsList(),
      deletedProjectId: projectId
    };
  }
  getScenariosList() {
    return this.scenariosService.getScenariosList();
  }
  getScenarioById(scenarioId) {
    const scenario = this.scenariosService.getScenarioById(scenarioId);
    if (scenario) {
      this.userProfileService.updateUserProfile({
        activeScenarioId: scenario.id,
        lastActiveTab: "scenario",
        activeDialogId: null,
        activeProjectId: null
      });
    } else {
      this.userProfileService.updateUserProfile({
        activeScenarioId: null
      });
    }
    return scenario;
  }
  createScenario(payload) {
    const scenario = this.scenariosService.createScenario(payload);
    this.userProfileService.updateUserProfile({
      activeScenarioId: scenario.id,
      lastActiveTab: "scenario",
      activeDialogId: null,
      activeProjectId: null
    });
    return scenario;
  }
  updateScenario(scenarioId, payload) {
    const scenario = this.scenariosService.updateScenario(
      scenarioId,
      payload
    );
    if (scenario) {
      this.userProfileService.updateUserProfile({
        activeScenarioId: scenario.id,
        lastActiveTab: "scenario",
        activeDialogId: null,
        activeProjectId: null
      });
    }
    return scenario;
  }
  deleteScenario(scenarioId) {
    const deletedScenario = this.scenariosService.deleteScenario(scenarioId);
    if (deletedScenario) {
      const profile = this.userProfileService.getUserProfile();
      if (profile.activeScenarioId === deletedScenario.id) {
        this.userProfileService.updateUserProfile({
          activeScenarioId: null,
          lastActiveTab: "dialogs"
        });
      }
    }
    return {
      scenarios: this.scenariosService.getScenariosList(),
      deletedScenarioId: scenarioId
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
  getCacheEntry(key) {
    return this.databaseService.getCacheEntry(key);
  }
  setCacheEntry(key, entry) {
    this.databaseService.setCacheEntry(key, entry);
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
class BrowserService {
  browserWindow = null;
  closeSession() {
    const hadSession = this.browserWindow !== null && !this.browserWindow.isDestroyed();
    if (hadSession && this.browserWindow) {
      this.browserWindow.destroy();
    }
    this.browserWindow = null;
    return {
      success: true,
      hadSession
    };
  }
  ensureWindow() {
    if (this.browserWindow && !this.browserWindow.isDestroyed()) {
      return this.browserWindow;
    }
    this.browserWindow = new BrowserWindow({
      show: false,
      webPreferences: {
        sandbox: true,
        contextIsolation: true,
        nodeIntegration: false
      }
    });
    this.browserWindow.webContents.setWindowOpenHandler(() => ({
      action: "deny"
    }));
    return this.browserWindow;
  }
  normalizeHttpUrl(rawUrl) {
    const url = typeof rawUrl === "string" ? rawUrl.trim() : "";
    if (!url) {
      throw new Error("URL не указан");
    }
    let parsed;
    try {
      parsed = new URL(url);
    } catch {
      throw new Error("Некорректный URL");
    }
    const protocol = parsed.protocol.toLowerCase();
    if (protocol !== "http:" && protocol !== "https:") {
      throw new Error("Поддерживаются только http и https URL");
    }
    return parsed.toString();
  }
  async openUrl(rawUrl, timeoutMs = 3e4) {
    const requestedUrl = this.normalizeHttpUrl(rawUrl);
    const browserWindow = this.ensureWindow();
    const webContents = browserWindow.webContents;
    const webContentsAny = webContents;
    const startedAt = Date.now();
    const redirects = [];
    let statusCode = null;
    let currentUrl = requestedUrl;
    let navigationError = "";
    let didFinishLoad = false;
    const onRedirect = (...args) => {
      const targetUrl = typeof args[1] === "string" ? args[1] : "";
      const isMainFrame = args[3] === true;
      if (!isMainFrame) {
        return;
      }
      redirects.push({
        from: currentUrl,
        to: targetUrl
      });
      currentUrl = targetUrl;
    };
    const onFailLoad = (...args) => {
      const errorCode = typeof args[1] === "number" ? args[1] : -1;
      const errorDescription = typeof args[2] === "string" ? args[2] : "Navigation failed";
      const validatedURL = typeof args[3] === "string" ? args[3] : "";
      const isMainFrame = args[4] === true;
      if (!isMainFrame) {
        return;
      }
      currentUrl = validatedURL || currentUrl;
      if (errorCode === -3) {
        return;
      }
      navigationError = `[${errorCode}] ${errorDescription}`;
    };
    const onDidFinishLoad = () => {
      didFinishLoad = true;
    };
    const onCompleted = (details) => {
      if (details.webContentsId === webContents.id && details.resourceType === "mainFrame") {
        statusCode = typeof details.statusCode === "number" ? details.statusCode : null;
        currentUrl = details.url || currentUrl;
      }
    };
    webContentsAny.on("did-redirect-navigation", onRedirect);
    webContentsAny.on("did-fail-load", onFailLoad);
    webContentsAny.on("did-finish-load", onDidFinishLoad);
    webContents.session.webRequest.onCompleted(
      { urls: ["*://*/*"] },
      onCompleted
    );
    try {
      await Promise.race([
        webContents.loadURL(requestedUrl),
        new Promise((_, reject) => {
          setTimeout(
            () => reject(
              new Error(
                `Таймаут загрузки страницы (${timeoutMs}ms)`
              )
            ),
            timeoutMs
          );
        })
      ]);
      const finalUrl = webContents.getURL() || currentUrl || requestedUrl;
      const title = webContents.getTitle();
      return {
        success: true,
        requestedUrl,
        finalUrl,
        title,
        redirected: redirects.length > 0 || finalUrl.replace(/\/$/, "") !== requestedUrl.replace(/\/$/, ""),
        redirects,
        statusCode,
        loadTimeMs: Date.now() - startedAt
      };
    } catch (error) {
      const finalUrl = webContents.getURL() || currentUrl || requestedUrl;
      const title = webContents.getTitle();
      const errorMessage = navigationError || (error instanceof Error ? error.message : String(error));
      const isAbortedError = errorMessage.includes("ERR_ABORTED") || errorMessage.includes("[-3]");
      const hasLoadedPage = didFinishLoad || Boolean((webContents.getURL() || currentUrl) && title);
      if (isAbortedError && hasLoadedPage) {
        return {
          success: true,
          requestedUrl,
          finalUrl,
          title,
          redirected: redirects.length > 0 || finalUrl.replace(/\/$/, "") !== requestedUrl.replace(/\/$/, ""),
          redirects,
          statusCode,
          loadTimeMs: Date.now() - startedAt
        };
      }
      return {
        success: false,
        requestedUrl,
        finalUrl,
        title,
        redirected: redirects.length > 0 || finalUrl.replace(/\/$/, "") !== requestedUrl.replace(/\/$/, ""),
        redirects,
        statusCode,
        loadTimeMs: Date.now() - startedAt,
        error: errorMessage
      };
    } finally {
      webContentsAny.removeListener(
        "did-redirect-navigation",
        onRedirect
      );
      webContentsAny.removeListener("did-fail-load", onFailLoad);
      webContentsAny.removeListener("did-finish-load", onDidFinishLoad);
      webContents.session.webRequest.onCompleted(
        { urls: ["*://*/*"] },
        null
      );
    }
  }
  async getPageSnapshot(maxElements = 60) {
    const browserWindow = this.ensureWindow();
    const webContents = browserWindow.webContents;
    const normalizedMaxElements = Number.isFinite(maxElements) ? Math.max(10, Math.min(200, Math.floor(maxElements))) : 60;
    const snapshot = await webContents.executeJavaScript(
      `(() => {
                const toText = (value) =>
                    typeof value === "string"
                        ? value.replace(/\\s+/g, " ").trim()
                        : "";

                const buildSelector = (element) => {
                    if (!element || !(element instanceof Element)) {
                        return "";
                    }

                    if (element.id) {
                        return "#" + CSS.escape(element.id);
                    }

                    const parts = [];
                    let cursor = element;

                    while (cursor && cursor.nodeType === Node.ELEMENT_NODE && parts.length < 4) {
                        const tag = cursor.tagName.toLowerCase();
                        const parent = cursor.parentElement;
                        if (!parent) {
                            parts.unshift(tag);
                            break;
                        }

                        const siblings = Array.from(parent.children).filter((child) => child.tagName === cursor.tagName);
                        const index = siblings.indexOf(cursor) + 1;
                        parts.unshift(tag + ":nth-of-type(" + index + ")");
                        cursor = parent;
                    }

                    return parts.join(" > ");
                };

                const headingNodes = Array.from(document.querySelectorAll("h1, h2, h3"));
                const headings = headingNodes
                    .map((node) => toText(node.textContent || ""))
                    .filter(Boolean)
                    .slice(0, 20);

                const candidates = Array.from(
                    document.querySelectorAll(
                        "a, button, input, textarea, select, [role='button'], [role='link'], [tabindex]",
                    ),
                );

                const unique = [];
                const seen = new Set();

                for (const element of candidates) {
                    const selector = buildSelector(element);
                    const key = element.tagName + "::" + selector;

                    if (!selector || seen.has(key)) {
                        continue;
                    }

                    seen.add(key);

                    unique.push({
                        tag: element.tagName.toLowerCase(),
                        role: toText(element.getAttribute("role") || ""),
                        text: toText(
                            element.textContent ||
                                element.getAttribute("aria-label") ||
                                element.getAttribute("title") ||
                                "",
                        ),
                        href: toText(
                            element instanceof HTMLAnchorElement
                                ? element.href
                                : element.getAttribute("href") || "",
                        ),
                        type: toText(
                            "type" in element && typeof element.type === "string"
                                ? element.type
                                : element.getAttribute("type") || "",
                        ),
                        placeholder: toText(element.getAttribute("placeholder") || ""),
                        selector,
                    });

                    if (unique.length >= ${normalizedMaxElements}) {
                        break;
                    }
                }

                const elements = unique.map((item, index) => ({
                    id: "el_" + (index + 1),
                    ...item,
                }));

                return {
                    url: location.href,
                    title: document.title || "",
                    headings,
                    elements,
                    textPreview: toText(document.body?.innerText || "").slice(0, 4000),
                    capturedAt: new Date().toISOString(),
                };
            })();`,
      true
    );
    return snapshot;
  }
  async interactWith(params) {
    const browserWindow = this.ensureWindow();
    const webContents = browserWindow.webContents;
    const action = params.action;
    const selector = typeof params.selector === "string" ? params.selector.trim() : "";
    const text = typeof params.text === "string" ? params.text : "";
    const submit = params.submit === true;
    const waitedMs = Number.isFinite(params.waitForNavigationMs) ? Math.max(
      0,
      Math.min(1e4, Math.floor(params.waitForNavigationMs))
    ) : 400;
    if (action !== "click" && action !== "type") {
      throw new Error("Поддерживаются только действия click и type");
    }
    if (!selector) {
      throw new Error("Не указан selector");
    }
    if (action === "type" && !text) {
      throw new Error("Для действия type необходимо указать text");
    }
    const scriptPayload = {
      action,
      selector,
      text,
      submit
    };
    const interaction = await webContents.executeJavaScript(
      `(() => {
                const payload = ${JSON.stringify(scriptPayload)};
                let element;

                try {
                    element = document.querySelector(payload.selector);
                } catch {
                    return {
                        success: false,
                        error: "Некорректный CSS selector",
                    };
                }

                if (!element) {
                    return {
                        success: false,
                        error: "Элемент не найден",
                    };
                }

                if (payload.action === "click") {
                    if (element instanceof HTMLElement) {
                        element.focus();
                        element.click();
                    } else {
                        return {
                            success: false,
                            error: "Элемент не поддерживает click",
                        };
                    }
                }

                if (payload.action === "type") {
                    const value = typeof payload.text === "string" ? payload.text : "";

                    if (
                        element instanceof HTMLInputElement ||
                        element instanceof HTMLTextAreaElement
                    ) {
                        element.focus();
                        element.value = value;
                        element.dispatchEvent(new Event("input", { bubbles: true }));
                        element.dispatchEvent(new Event("change", { bubbles: true }));

                        if (payload.submit) {
                            element.dispatchEvent(
                                new KeyboardEvent("keydown", {
                                    key: "Enter",
                                    code: "Enter",
                                    bubbles: true,
                                }),
                            );
                            element.dispatchEvent(
                                new KeyboardEvent("keyup", {
                                    key: "Enter",
                                    code: "Enter",
                                    bubbles: true,
                                }),
                            );
                            if (element.form && typeof element.form.requestSubmit === "function") {
                                element.form.requestSubmit();
                            }
                        }
                    } else if (element instanceof HTMLElement && element.isContentEditable) {
                        element.focus();
                        element.textContent = value;
                        element.dispatchEvent(new Event("input", { bubbles: true }));
                    } else {
                        return {
                            success: false,
                            error: "Элемент не поддерживает ввод текста",
                        };
                    }
                }

                return {
                    success: true,
                    elementTag:
                        element instanceof Element
                            ? element.tagName.toLowerCase()
                            : "",
                };
            })();`,
      true
    );
    if (waitedMs > 0) {
      await new Promise((resolve) => {
        setTimeout(resolve, waitedMs);
      });
    }
    const finalUrl = webContents.getURL() || "";
    const title = webContents.getTitle() || "";
    const success = Boolean(interaction?.success);
    return {
      success,
      action,
      selector,
      elementTag: typeof interaction?.elementTag === "string" ? interaction.elementTag : void 0,
      url: finalUrl,
      title,
      waitedMs,
      ...success ? {} : {
        error: typeof interaction?.error === "string" ? interaction.error : "Не удалось выполнить действие"
      }
    };
  }
}
const createElectronPaths = (basePath) => {
  const resourcesPath = path.join(basePath, "resources");
  return {
    basePath,
    resourcesPath,
    themesPath: path.join(resourcesPath, "themes"),
    filesPath: path.join(resourcesPath, "files"),
    metaPath: path.join(resourcesPath, "meta.json"),
    databasePath: path.join(resourcesPath, "db.zvsdatabase"),
    defaultProjectsDirectory: path.join(resourcesPath, "projects")
  };
};
const __dirname$1 = path.dirname(fileURLToPath(import.meta.url));
process.env.APP_ROOT = path.join(__dirname$1, "..");
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, "public") : RENDERER_DIST;
let win;
let userDataService;
let commandExecService;
let browserService;
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
const getMimeTypeByExtension = (filePath) => {
  const extension = path.extname(filePath).toLowerCase();
  return mimeByExtension[extension] || "application/octet-stream";
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
  const appPaths = createElectronPaths(app.getPath("userData"));
  const initDirectoriesService = new InitService(appPaths);
  initDirectoriesService.initialize();
  userDataService = new UserDataService(appPaths);
  commandExecService = new CommandExecService();
  browserService = new BrowserService();
  ipcMain.handle(
    "app:get-boot-data",
    () => userDataService.getBootData()
  );
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
  ipcMain.handle(
    "app:create-dialog",
    () => userDataService.createDialog()
  );
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
    "app:get-scenarios-list",
    () => userDataService.getScenariosList()
  );
  ipcMain.handle(
    "app:get-scenario-by-id",
    (_event, scenarioId) => userDataService.getScenarioById(scenarioId)
  );
  ipcMain.handle(
    "app:create-scenario",
    (_event, payload) => userDataService.createScenario(payload)
  );
  ipcMain.handle(
    "app:update-scenario",
    (_event, scenarioId, payload) => userDataService.updateScenario(scenarioId, payload)
  );
  ipcMain.handle(
    "app:delete-scenario",
    (_event, scenarioId) => userDataService.deleteScenario(scenarioId)
  );
  ipcMain.handle(
    "app:save-files",
    (_event, files) => userDataService.saveFiles(files)
  );
  ipcMain.handle(
    "app:get-files-by-ids",
    (_event, fileIds) => userDataService.getFilesByIds(fileIds)
  );
  ipcMain.handle(
    "app:get-cache-entry",
    (_event, key) => userDataService.getCacheEntry(key)
  );
  ipcMain.handle(
    "app:set-cache-entry",
    (_event, key, entry) => {
      userDataService.setCacheEntry(key, entry);
    }
  );
  ipcMain.handle(
    "app:proxy-http-request",
    async (_event, payload) => {
      const url = typeof payload?.url === "string" ? payload.url.trim() : "";
      const method = typeof payload?.method === "string" ? payload.method.trim().toUpperCase() : "GET";
      const headers = payload && typeof payload.headers === "object" ? payload.headers : void 0;
      const requestBodyText = typeof payload?.bodyText === "string" ? payload.bodyText : void 0;
      if (!url) {
        return {
          ok: false,
          status: 0,
          statusText: "URL is required",
          bodyText: ""
        };
      }
      try {
        const response = await fetch(url, {
          method,
          headers: {
            Accept: "application/json, text/plain, */*",
            ...headers || {}
          },
          ...requestBodyText && method !== "GET" && method !== "HEAD" ? { body: requestBodyText } : {}
        });
        const responseBodyText = await response.text();
        return {
          ok: response.ok,
          status: response.status,
          statusText: response.statusText,
          bodyText: responseBodyText
        };
      } catch (error) {
        return {
          ok: false,
          status: 0,
          statusText: error instanceof Error ? error.message : "Network request failed",
          bodyText: ""
        };
      }
    }
  );
  ipcMain.handle(
    "app:open-saved-file",
    async (_event, fileId) => {
      const file = userDataService.getFileById(fileId);
      if (!file) {
        return false;
      }
      const openResult = await shell.openPath(file.path);
      return openResult === "";
    }
  );
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
      const currentWindow = BrowserWindow.fromWebContents(
        event.sender
      );
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
    "app:browser-open-url",
    (_event, url, timeoutMs) => browserService.openUrl(url, timeoutMs)
  );
  ipcMain.handle(
    "app:browser-get-page-snapshot",
    (_event, maxElements) => browserService.getPageSnapshot(maxElements)
  );
  ipcMain.handle(
    "app:browser-interact-with",
    (_event, params) => browserService.interactWith(params)
  );
  ipcMain.handle(
    "app:browser-close-session",
    () => browserService.closeSession()
  );
  ipcMain.handle(
    "app:pick-files",
    async (event, options) => {
      const currentWindow = BrowserWindow.fromWebContents(
        event.sender
      );
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
      const dialogProperties = ["openFile"];
      if (options?.multiple) {
        dialogProperties.push("multiSelections");
      }
      const openDialogOptions = {
        properties: dialogProperties,
        filters
      };
      const selection = currentWindow ? await dialog.showOpenDialog(
        currentWindow,
        openDialogOptions
      ) : await dialog.showOpenDialog(openDialogOptions);
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
      const currentWindow = BrowserWindow.fromWebContents(
        event.sender
      );
      const dialogProperties = [
        options?.forFolders ? "openDirectory" : "openFile"
      ];
      const openDialogOptions = {
        properties: dialogProperties
      };
      const selection = currentWindow ? await dialog.showOpenDialog(
        currentWindow,
        openDialogOptions
      ) : await dialog.showOpenDialog(openDialogOptions);
      if (selection.canceled || selection.filePaths.length === 0) {
        return null;
      }
      return selection.filePaths[0] ?? null;
    }
  );
  ipcMain.handle("app:fs-list-directory", async (_event, cwd) => {
    const entries = await fs$1.readdir(cwd, { withFileTypes: true });
    const result = await Promise.all(
      entries.map(async (entry) => {
        const entryPath = path.join(cwd, entry.name);
        const stat = await fs$1.stat(entryPath);
        return {
          name: entry.name,
          type: entry.isDirectory() ? "directory" : "file",
          size: stat.size,
          modifiedAt: stat.mtime.toISOString()
        };
      })
    );
    return { path: cwd, entries: result };
  });
  ipcMain.handle(
    "app:fs-create-file",
    async (_event, cwd, filename, content = "") => {
      const filePath = path.join(cwd, filename);
      await fs$1.mkdir(path.dirname(filePath), { recursive: true });
      await fs$1.writeFile(filePath, content, "utf-8");
      return { success: true, path: filePath };
    }
  );
  ipcMain.handle(
    "app:fs-create-dir",
    async (_event, cwd, dirname) => {
      const dirPath = path.join(cwd, dirname);
      await fs$1.mkdir(dirPath, { recursive: true });
      return { success: true, path: dirPath };
    }
  );
  ipcMain.handle(
    "app:fs-read-file",
    async (_event, filePath, readAll, fromLine, toLine) => {
      const raw = await fs$1.readFile(filePath, "utf-8");
      const lines = raw.split("\n");
      const totalLines = lines.length;
      if (readAll) {
        return {
          path: filePath,
          content: raw,
          totalLines,
          fromLine: 1,
          toLine: totalLines
        };
      }
      const from = Math.max(1, fromLine ?? 1);
      const to = Math.min(totalLines, toLine ?? totalLines);
      const content = lines.slice(from - 1, to).join("\n");
      return {
        path: filePath,
        content,
        totalLines,
        fromLine: from,
        toLine: to
      };
    }
  );
  createWindow();
}).catch((error) => {
  console.error("Failed to initialize Electron app", error);
  app.quit();
});
export {
  MAIN_DIST,
  RENDERER_DIST,
  VITE_DEV_SERVER_URL
};
