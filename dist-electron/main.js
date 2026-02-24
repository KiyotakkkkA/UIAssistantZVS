import path, { resolve } from "node:path";
import fs$1, { readFile } from "node:fs/promises";
import { BrowserWindow, app, ipcMain, shell, dialog } from "electron";
import { fileURLToPath } from "node:url";
import fs, { promises } from "node:fs";
import { randomUUID, randomBytes } from "node:crypto";
import Database from "better-sqlite3";
import { spawn } from "node:child_process";
import require$$0 from "node:buffer";
import require$$0$5 from "events";
import require$$1$2 from "https";
import require$$2$1 from "http";
import require$$3 from "net";
import require$$4 from "tls";
import require$$1$1 from "crypto";
import require$$0$4 from "stream";
import require$$7 from "url";
import require$$0$2 from "zlib";
import require$$0$1 from "fs";
import require$$1 from "path";
import require$$2 from "os";
import require$$0$3 from "buffer";
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
  mistralVoiceRecModel: "",
  mistralToken: "",
  voiceRecognitionDriver: "",
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
const CHAT_DRIVERS = /* @__PURE__ */ new Set(["ollama", ""]);
const VOICE_RECOGNITION_DRIVERS = /* @__PURE__ */ new Set([
  "mistral",
  ""
]);
const WORKSPACE_TABS = /* @__PURE__ */ new Set([
  "dialogs",
  "projects",
  "scenario"
]);
const isChatDriver = (value) => {
  return typeof value === "string" && CHAT_DRIVERS.has(value);
};
const isWorkspaceTab = (value) => {
  return typeof value === "string" && WORKSPACE_TABS.has(value);
};
const isVoiceRecognitionDriver = (value) => {
  return typeof value === "string" && VOICE_RECOGNITION_DRIVERS.has(value);
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
  const normalizeByTab = {
    dialogs: (next) => ({
      ...next,
      activeProjectId: null,
      activeScenarioId: null,
      lastActiveTab
    }),
    projects: (next) => ({
      ...next,
      activeProjectId: normalizeNullableId(next.activeProjectId),
      activeScenarioId: null,
      lastActiveTab
    }),
    scenario: (next) => ({
      ...next,
      activeDialogId: null,
      activeProjectId: null,
      activeScenarioId: normalizeNullableId(next.activeScenarioId),
      lastActiveTab
    })
  };
  return normalizeByTab[lastActiveTab](profile);
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
        ...typeof parsed.mistralVoiceRecModel === "string" ? { mistralVoiceRecModel: parsed.mistralVoiceRecModel } : {},
        ...typeof parsed.mistralToken === "string" ? { mistralToken: parsed.mistralToken } : {},
        ...isVoiceRecognitionDriver(parsed.voiceRecognitionDriver) ? { voiceRecognitionDriver: parsed.voiceRecognitionDriver } : {},
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
  createThemeMap(themes) {
    return new Map(themes.map((theme) => [theme.id, theme]));
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
    const themeMap = this.createThemeMap(themes);
    const preferredTheme = themeMap.get(themeId);
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
    const themeMap = this.createThemeMap(themes);
    const preferredTheme = themeMap.get(themeId);
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
const ASSISTANT_MESSAGE_AUTHORS = /* @__PURE__ */ new Set(["assistant", "user", "system"]);
const ASSISTANT_STAGES = /* @__PURE__ */ new Set([
  "thinking",
  "planning",
  "questioning",
  "tools_calling",
  "answering"
]);
const TOOL_STAGES = /* @__PURE__ */ new Set(["planning", "questioning", "tools_calling"]);
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
    const targetIndex = dialog2.messages.findIndex(
      (message) => message.id === messageId
    );
    const targetMessage = dialog2.messages.find(
      (message) => message.id === messageId
    );
    if (!targetMessage || targetIndex === -1) {
      return dialog2;
    }
    const deletedIds = /* @__PURE__ */ new Set([messageId]);
    const previousMessage = dialog2.messages[targetIndex - 1];
    if (targetMessage.author === "user" && this.isScenarioLaunchMessage(previousMessage)) {
      deletedIds.add(previousMessage.id);
    }
    const nextMessages = dialog2.messages.filter(
      (message) => !deletedIds.has(message.id) && !(typeof message.answeringAt === "string" && deletedIds.has(message.answeringAt))
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
    const targetMessage = dialog2.messages[messageIndex];
    const previousMessage = dialog2.messages[messageIndex - 1];
    const truncateIndex = targetMessage?.author === "user" && this.isScenarioLaunchMessage(previousMessage) ? messageIndex - 1 : messageIndex;
    const updatedDialog = {
      ...dialog2,
      messages: dialog2.messages.slice(0, truncateIndex),
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
    const role = ASSISTANT_MESSAGE_AUTHORS.has(rawAuthor || "") ? rawAuthor : "assistant";
    const rawAssistantStage = message.assistantStage;
    const assistantStage = role === "assistant" ? ASSISTANT_STAGES.has(rawAssistantStage || "") ? rawAssistantStage : "answering" : void 0;
    const isToolLikeStage = TOOL_STAGES.has(assistantStage || "");
    const toolTrace = role === "assistant" && isToolLikeStage ? message.toolTrace && typeof message.toolTrace.callId === "string" && typeof message.toolTrace.toolName === "string" && typeof message.toolTrace.args === "object" && message.toolTrace.args !== null ? message.toolTrace : void 0 : void 0;
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
      ...toolTrace ? { toolTrace } : {},
      ...typeof message.hidden === "boolean" ? { hidden: message.hidden } : {}
    };
  }
  isScenarioLaunchMessage(message) {
    return message?.author === "system" && typeof message.content === "string" && message.content.startsWith("SCENARIO_LAUNCH:");
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
    const base642 = dataUrl.slice(markerIndex + marker.length);
    return Buffer.from(base642, "base64");
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
    return await new Promise((resolve2, reject) => {
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
        resolve2({
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
const SUPPORTED_PROTOCOLS = /* @__PURE__ */ new Set(["http:", "https:"]);
const BROWSER_ACTIONS = /* @__PURE__ */ new Set(["click", "type"]);
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
    const url2 = typeof rawUrl === "string" ? rawUrl.trim() : "";
    if (!url2) {
      throw new Error("URL не указан");
    }
    let parsed;
    try {
      parsed = new URL(url2);
    } catch {
      throw new Error("Некорректный URL");
    }
    const protocol = parsed.protocol.toLowerCase();
    if (!SUPPORTED_PROTOCOLS.has(protocol)) {
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
    if (!BROWSER_ACTIONS.has(action)) {
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
      await new Promise((resolve2) => {
        setTimeout(resolve2, waitedMs);
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
var g = typeof globalThis !== "undefined" && globalThis || typeof self !== "undefined" && self || // eslint-disable-next-line no-undef
typeof global !== "undefined" && global || {};
var support = {
  searchParams: "URLSearchParams" in g,
  iterable: "Symbol" in g && "iterator" in Symbol,
  blob: "FileReader" in g && "Blob" in g && (function() {
    try {
      new Blob();
      return true;
    } catch (e) {
      return false;
    }
  })(),
  formData: "FormData" in g,
  arrayBuffer: "ArrayBuffer" in g
};
function isDataView(obj) {
  return obj && DataView.prototype.isPrototypeOf(obj);
}
if (support.arrayBuffer) {
  var viewClasses = [
    "[object Int8Array]",
    "[object Uint8Array]",
    "[object Uint8ClampedArray]",
    "[object Int16Array]",
    "[object Uint16Array]",
    "[object Int32Array]",
    "[object Uint32Array]",
    "[object Float32Array]",
    "[object Float64Array]"
  ];
  var isArrayBufferView = ArrayBuffer.isView || function(obj) {
    return obj && viewClasses.indexOf(Object.prototype.toString.call(obj)) > -1;
  };
}
function normalizeName(name) {
  if (typeof name !== "string") {
    name = String(name);
  }
  if (/[^a-z0-9\-#$%&'*+.^_`|~!]/i.test(name) || name === "") {
    throw new TypeError('Invalid character in header field name: "' + name + '"');
  }
  return name.toLowerCase();
}
function normalizeValue(value) {
  if (typeof value !== "string") {
    value = String(value);
  }
  return value;
}
function iteratorFor(items) {
  var iterator = {
    next: function() {
      var value = items.shift();
      return { done: value === void 0, value };
    }
  };
  if (support.iterable) {
    iterator[Symbol.iterator] = function() {
      return iterator;
    };
  }
  return iterator;
}
function Headers$1(headers) {
  this.map = {};
  if (headers instanceof Headers$1) {
    headers.forEach(function(value, name) {
      this.append(name, value);
    }, this);
  } else if (Array.isArray(headers)) {
    headers.forEach(function(header) {
      if (header.length != 2) {
        throw new TypeError("Headers constructor: expected name/value pair to be length 2, found" + header.length);
      }
      this.append(header[0], header[1]);
    }, this);
  } else if (headers) {
    Object.getOwnPropertyNames(headers).forEach(function(name) {
      this.append(name, headers[name]);
    }, this);
  }
}
Headers$1.prototype.append = function(name, value) {
  name = normalizeName(name);
  value = normalizeValue(value);
  var oldValue = this.map[name];
  this.map[name] = oldValue ? oldValue + ", " + value : value;
};
Headers$1.prototype["delete"] = function(name) {
  delete this.map[normalizeName(name)];
};
Headers$1.prototype.get = function(name) {
  name = normalizeName(name);
  return this.has(name) ? this.map[name] : null;
};
Headers$1.prototype.has = function(name) {
  return this.map.hasOwnProperty(normalizeName(name));
};
Headers$1.prototype.set = function(name, value) {
  this.map[normalizeName(name)] = normalizeValue(value);
};
Headers$1.prototype.forEach = function(callback, thisArg) {
  for (var name in this.map) {
    if (this.map.hasOwnProperty(name)) {
      callback.call(thisArg, this.map[name], name, this);
    }
  }
};
Headers$1.prototype.keys = function() {
  var items = [];
  this.forEach(function(value, name) {
    items.push(name);
  });
  return iteratorFor(items);
};
Headers$1.prototype.values = function() {
  var items = [];
  this.forEach(function(value) {
    items.push(value);
  });
  return iteratorFor(items);
};
Headers$1.prototype.entries = function() {
  var items = [];
  this.forEach(function(value, name) {
    items.push([name, value]);
  });
  return iteratorFor(items);
};
if (support.iterable) {
  Headers$1.prototype[Symbol.iterator] = Headers$1.prototype.entries;
}
function consumed(body) {
  if (body._noBody) return;
  if (body.bodyUsed) {
    return Promise.reject(new TypeError("Already read"));
  }
  body.bodyUsed = true;
}
function fileReaderReady(reader) {
  return new Promise(function(resolve2, reject) {
    reader.onload = function() {
      resolve2(reader.result);
    };
    reader.onerror = function() {
      reject(reader.error);
    };
  });
}
function readBlobAsArrayBuffer(blob) {
  var reader = new FileReader();
  var promise = fileReaderReady(reader);
  reader.readAsArrayBuffer(blob);
  return promise;
}
function readBlobAsText(blob) {
  var reader = new FileReader();
  var promise = fileReaderReady(reader);
  var match = /charset=([A-Za-z0-9_-]+)/.exec(blob.type);
  var encoding = match ? match[1] : "utf-8";
  reader.readAsText(blob, encoding);
  return promise;
}
function readArrayBufferAsText(buf) {
  var view = new Uint8Array(buf);
  var chars = new Array(view.length);
  for (var i = 0; i < view.length; i++) {
    chars[i] = String.fromCharCode(view[i]);
  }
  return chars.join("");
}
function bufferClone(buf) {
  if (buf.slice) {
    return buf.slice(0);
  } else {
    var view = new Uint8Array(buf.byteLength);
    view.set(new Uint8Array(buf));
    return view.buffer;
  }
}
function Body() {
  this.bodyUsed = false;
  this._initBody = function(body) {
    this.bodyUsed = this.bodyUsed;
    this._bodyInit = body;
    if (!body) {
      this._noBody = true;
      this._bodyText = "";
    } else if (typeof body === "string") {
      this._bodyText = body;
    } else if (support.blob && Blob.prototype.isPrototypeOf(body)) {
      this._bodyBlob = body;
    } else if (support.formData && FormData.prototype.isPrototypeOf(body)) {
      this._bodyFormData = body;
    } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
      this._bodyText = body.toString();
    } else if (support.arrayBuffer && support.blob && isDataView(body)) {
      this._bodyArrayBuffer = bufferClone(body.buffer);
      this._bodyInit = new Blob([this._bodyArrayBuffer]);
    } else if (support.arrayBuffer && (ArrayBuffer.prototype.isPrototypeOf(body) || isArrayBufferView(body))) {
      this._bodyArrayBuffer = bufferClone(body);
    } else {
      this._bodyText = body = Object.prototype.toString.call(body);
    }
    if (!this.headers.get("content-type")) {
      if (typeof body === "string") {
        this.headers.set("content-type", "text/plain;charset=UTF-8");
      } else if (this._bodyBlob && this._bodyBlob.type) {
        this.headers.set("content-type", this._bodyBlob.type);
      } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
        this.headers.set("content-type", "application/x-www-form-urlencoded;charset=UTF-8");
      }
    }
  };
  if (support.blob) {
    this.blob = function() {
      var rejected = consumed(this);
      if (rejected) {
        return rejected;
      }
      if (this._bodyBlob) {
        return Promise.resolve(this._bodyBlob);
      } else if (this._bodyArrayBuffer) {
        return Promise.resolve(new Blob([this._bodyArrayBuffer]));
      } else if (this._bodyFormData) {
        throw new Error("could not read FormData body as blob");
      } else {
        return Promise.resolve(new Blob([this._bodyText]));
      }
    };
  }
  this.arrayBuffer = function() {
    if (this._bodyArrayBuffer) {
      var isConsumed = consumed(this);
      if (isConsumed) {
        return isConsumed;
      } else if (ArrayBuffer.isView(this._bodyArrayBuffer)) {
        return Promise.resolve(
          this._bodyArrayBuffer.buffer.slice(
            this._bodyArrayBuffer.byteOffset,
            this._bodyArrayBuffer.byteOffset + this._bodyArrayBuffer.byteLength
          )
        );
      } else {
        return Promise.resolve(this._bodyArrayBuffer);
      }
    } else if (support.blob) {
      return this.blob().then(readBlobAsArrayBuffer);
    } else {
      throw new Error("could not read as ArrayBuffer");
    }
  };
  this.text = function() {
    var rejected = consumed(this);
    if (rejected) {
      return rejected;
    }
    if (this._bodyBlob) {
      return readBlobAsText(this._bodyBlob);
    } else if (this._bodyArrayBuffer) {
      return Promise.resolve(readArrayBufferAsText(this._bodyArrayBuffer));
    } else if (this._bodyFormData) {
      throw new Error("could not read FormData body as text");
    } else {
      return Promise.resolve(this._bodyText);
    }
  };
  if (support.formData) {
    this.formData = function() {
      return this.text().then(decode);
    };
  }
  this.json = function() {
    return this.text().then(JSON.parse);
  };
  return this;
}
var methods = ["CONNECT", "DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT", "TRACE"];
function normalizeMethod(method) {
  var upcased = method.toUpperCase();
  return methods.indexOf(upcased) > -1 ? upcased : method;
}
function Request$1(input, options) {
  if (!(this instanceof Request$1)) {
    throw new TypeError('Please use the "new" operator, this DOM object constructor cannot be called as a function.');
  }
  options = options || {};
  var body = options.body;
  if (input instanceof Request$1) {
    if (input.bodyUsed) {
      throw new TypeError("Already read");
    }
    this.url = input.url;
    this.credentials = input.credentials;
    if (!options.headers) {
      this.headers = new Headers$1(input.headers);
    }
    this.method = input.method;
    this.mode = input.mode;
    this.signal = input.signal;
    if (!body && input._bodyInit != null) {
      body = input._bodyInit;
      input.bodyUsed = true;
    }
  } else {
    this.url = String(input);
  }
  this.credentials = options.credentials || this.credentials || "same-origin";
  if (options.headers || !this.headers) {
    this.headers = new Headers$1(options.headers);
  }
  this.method = normalizeMethod(options.method || this.method || "GET");
  this.mode = options.mode || this.mode || null;
  this.signal = options.signal || this.signal || (function() {
    if ("AbortController" in g) {
      var ctrl = new AbortController();
      return ctrl.signal;
    }
  })();
  this.referrer = null;
  if ((this.method === "GET" || this.method === "HEAD") && body) {
    throw new TypeError("Body not allowed for GET or HEAD requests");
  }
  this._initBody(body);
  if (this.method === "GET" || this.method === "HEAD") {
    if (options.cache === "no-store" || options.cache === "no-cache") {
      var reParamSearch = /([?&])_=[^&]*/;
      if (reParamSearch.test(this.url)) {
        this.url = this.url.replace(reParamSearch, "$1_=" + (/* @__PURE__ */ new Date()).getTime());
      } else {
        var reQueryString = /\?/;
        this.url += (reQueryString.test(this.url) ? "&" : "?") + "_=" + (/* @__PURE__ */ new Date()).getTime();
      }
    }
  }
}
Request$1.prototype.clone = function() {
  return new Request$1(this, { body: this._bodyInit });
};
function decode(body) {
  var form = new FormData();
  body.trim().split("&").forEach(function(bytes) {
    if (bytes) {
      var split = bytes.split("=");
      var name = split.shift().replace(/\+/g, " ");
      var value = split.join("=").replace(/\+/g, " ");
      form.append(decodeURIComponent(name), decodeURIComponent(value));
    }
  });
  return form;
}
function parseHeaders(rawHeaders) {
  var headers = new Headers$1();
  var preProcessedHeaders = rawHeaders.replace(/\r?\n[\t ]+/g, " ");
  preProcessedHeaders.split("\r").map(function(header) {
    return header.indexOf("\n") === 0 ? header.substr(1, header.length) : header;
  }).forEach(function(line) {
    var parts = line.split(":");
    var key = parts.shift().trim();
    if (key) {
      var value = parts.join(":").trim();
      try {
        headers.append(key, value);
      } catch (error) {
        console.warn("Response " + error.message);
      }
    }
  });
  return headers;
}
Body.call(Request$1.prototype);
function Response(bodyInit, options) {
  if (!(this instanceof Response)) {
    throw new TypeError('Please use the "new" operator, this DOM object constructor cannot be called as a function.');
  }
  if (!options) {
    options = {};
  }
  this.type = "default";
  this.status = options.status === void 0 ? 200 : options.status;
  if (this.status < 200 || this.status > 599) {
    throw new RangeError("Failed to construct 'Response': The status provided (0) is outside the range [200, 599].");
  }
  this.ok = this.status >= 200 && this.status < 300;
  this.statusText = options.statusText === void 0 ? "" : "" + options.statusText;
  this.headers = new Headers$1(options.headers);
  this.url = options.url || "";
  this._initBody(bodyInit);
}
Body.call(Response.prototype);
Response.prototype.clone = function() {
  return new Response(this._bodyInit, {
    status: this.status,
    statusText: this.statusText,
    headers: new Headers$1(this.headers),
    url: this.url
  });
};
Response.error = function() {
  var response = new Response(null, { status: 200, statusText: "" });
  response.ok = false;
  response.status = 0;
  response.type = "error";
  return response;
};
var redirectStatuses = [301, 302, 303, 307, 308];
Response.redirect = function(url2, status) {
  if (redirectStatuses.indexOf(status) === -1) {
    throw new RangeError("Invalid status code");
  }
  return new Response(null, { status, headers: { location: url2 } });
};
var DOMException = g.DOMException;
try {
  new DOMException();
} catch (err) {
  DOMException = function(message, name) {
    this.message = message;
    this.name = name;
    var error = Error(message);
    this.stack = error.stack;
  };
  DOMException.prototype = Object.create(Error.prototype);
  DOMException.prototype.constructor = DOMException;
}
function fetch$1(input, init) {
  return new Promise(function(resolve2, reject) {
    var request = new Request$1(input, init);
    if (request.signal && request.signal.aborted) {
      return reject(new DOMException("Aborted", "AbortError"));
    }
    var xhr = new XMLHttpRequest();
    function abortXhr() {
      xhr.abort();
    }
    xhr.onload = function() {
      var options = {
        statusText: xhr.statusText,
        headers: parseHeaders(xhr.getAllResponseHeaders() || "")
      };
      if (request.url.indexOf("file://") === 0 && (xhr.status < 200 || xhr.status > 599)) {
        options.status = 200;
      } else {
        options.status = xhr.status;
      }
      options.url = "responseURL" in xhr ? xhr.responseURL : options.headers.get("X-Request-URL");
      var body = "response" in xhr ? xhr.response : xhr.responseText;
      setTimeout(function() {
        resolve2(new Response(body, options));
      }, 0);
    };
    xhr.onerror = function() {
      setTimeout(function() {
        reject(new TypeError("Network request failed"));
      }, 0);
    };
    xhr.ontimeout = function() {
      setTimeout(function() {
        reject(new TypeError("Network request timed out"));
      }, 0);
    };
    xhr.onabort = function() {
      setTimeout(function() {
        reject(new DOMException("Aborted", "AbortError"));
      }, 0);
    };
    function fixUrl(url2) {
      try {
        return url2 === "" && g.location.href ? g.location.href : url2;
      } catch (e) {
        return url2;
      }
    }
    xhr.open(request.method, fixUrl(request.url), true);
    if (request.credentials === "include") {
      xhr.withCredentials = true;
    } else if (request.credentials === "omit") {
      xhr.withCredentials = false;
    }
    if ("responseType" in xhr) {
      if (support.blob) {
        xhr.responseType = "blob";
      } else if (support.arrayBuffer) {
        xhr.responseType = "arraybuffer";
      }
    }
    if (init && typeof init.headers === "object" && !(init.headers instanceof Headers$1 || g.Headers && init.headers instanceof g.Headers)) {
      var names = [];
      Object.getOwnPropertyNames(init.headers).forEach(function(name) {
        names.push(normalizeName(name));
        xhr.setRequestHeader(name, normalizeValue(init.headers[name]));
      });
      request.headers.forEach(function(value, name) {
        if (names.indexOf(name) === -1) {
          xhr.setRequestHeader(name, value);
        }
      });
    } else {
      request.headers.forEach(function(value, name) {
        xhr.setRequestHeader(name, value);
      });
    }
    if (request.signal) {
      request.signal.addEventListener("abort", abortXhr);
      xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
          request.signal.removeEventListener("abort", abortXhr);
        }
      };
    }
    xhr.send(typeof request._bodyInit === "undefined" ? null : request._bodyInit);
  });
}
fetch$1.polyfill = true;
if (!g.fetch) {
  g.fetch = fetch$1;
  g.Headers = Headers$1;
  g.Request = Request$1;
  g.Response = Response;
}
const defaultPort = "11434";
const defaultHost = `http://127.0.0.1:${defaultPort}`;
const version = "0.6.3";
var __defProp$1 = Object.defineProperty;
var __defNormalProp$1 = (obj, key, value) => key in obj ? __defProp$1(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField$1 = (obj, key, value) => {
  __defNormalProp$1(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
class ResponseError extends Error {
  constructor(error, status_code) {
    super(error);
    this.error = error;
    this.status_code = status_code;
    this.name = "ResponseError";
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ResponseError);
    }
  }
}
class AbortableAsyncIterator {
  constructor(abortController, itr, doneCallback) {
    __publicField$1(this, "abortController");
    __publicField$1(this, "itr");
    __publicField$1(this, "doneCallback");
    this.abortController = abortController;
    this.itr = itr;
    this.doneCallback = doneCallback;
  }
  abort() {
    this.abortController.abort();
  }
  async *[Symbol.asyncIterator]() {
    for await (const message of this.itr) {
      if ("error" in message) {
        throw new Error(message.error);
      }
      yield message;
      if (message.done || message.status === "success") {
        this.doneCallback();
        return;
      }
    }
    throw new Error("Did not receive done or success response in stream.");
  }
}
const checkOk = async (response) => {
  if (response.ok) {
    return;
  }
  let message = `Error ${response.status}: ${response.statusText}`;
  let errorData = null;
  if (response.headers.get("content-type")?.includes("application/json")) {
    try {
      errorData = await response.json();
      message = errorData.error || message;
    } catch (error) {
      console.log("Failed to parse error response as JSON");
    }
  } else {
    try {
      console.log("Getting text from response");
      const textResponse = await response.text();
      message = textResponse || message;
    } catch (error) {
      console.log("Failed to get text from error response");
    }
  }
  throw new ResponseError(message, response.status);
};
function getPlatform() {
  if (typeof window !== "undefined" && window.navigator) {
    const nav = navigator;
    if ("userAgentData" in nav && nav.userAgentData?.platform) {
      return `${nav.userAgentData.platform.toLowerCase()} Browser/${navigator.userAgent};`;
    }
    if (navigator.platform) {
      return `${navigator.platform.toLowerCase()} Browser/${navigator.userAgent};`;
    }
    return `unknown Browser/${navigator.userAgent};`;
  } else if (typeof process !== "undefined") {
    return `${process.arch} ${process.platform} Node.js/${process.version}`;
  }
  return "";
}
function normalizeHeaders(headers) {
  if (headers instanceof Headers) {
    const obj = {};
    headers.forEach((value, key) => {
      obj[key] = value;
    });
    return obj;
  } else if (Array.isArray(headers)) {
    return Object.fromEntries(headers);
  } else {
    return headers || {};
  }
}
const readEnvVar = (obj, key) => {
  return obj[key];
};
const fetchWithHeaders = async (fetch2, url2, options = {}) => {
  const defaultHeaders = {
    "Content-Type": "application/json",
    Accept: "application/json",
    "User-Agent": `ollama-js/${version} (${getPlatform()})`
  };
  options.headers = normalizeHeaders(options.headers);
  try {
    const parsed = new URL(url2);
    if (parsed.protocol === "https:" && parsed.hostname === "ollama.com") {
      const apiKey = typeof process === "object" && process !== null && typeof process.env === "object" && process.env !== null ? readEnvVar(process.env, "OLLAMA_API_KEY") : void 0;
      const authorization = options.headers["authorization"] || options.headers["Authorization"];
      if (!authorization && apiKey) {
        options.headers["Authorization"] = `Bearer ${apiKey}`;
      }
    }
  } catch (error) {
    console.error("error parsing url", error);
  }
  const customHeaders = Object.fromEntries(
    Object.entries(options.headers).filter(
      ([key]) => !Object.keys(defaultHeaders).some(
        (defaultKey) => defaultKey.toLowerCase() === key.toLowerCase()
      )
    )
  );
  options.headers = {
    ...defaultHeaders,
    ...customHeaders
  };
  return fetch2(url2, options);
};
const get = async (fetch2, host, options) => {
  const response = await fetchWithHeaders(fetch2, host, {
    headers: options?.headers
  });
  await checkOk(response);
  return response;
};
const post = async (fetch2, host, data, options) => {
  const isRecord = (input) => {
    return input !== null && typeof input === "object" && !Array.isArray(input);
  };
  const formattedData = isRecord(data) ? JSON.stringify(data) : data;
  const response = await fetchWithHeaders(fetch2, host, {
    method: "POST",
    body: formattedData,
    signal: options?.signal,
    headers: options?.headers
  });
  await checkOk(response);
  return response;
};
const del = async (fetch2, host, data, options) => {
  const response = await fetchWithHeaders(fetch2, host, {
    method: "DELETE",
    body: JSON.stringify(data),
    headers: options?.headers
  });
  await checkOk(response);
  return response;
};
const parseJSON = async function* (itr) {
  const decoder = new TextDecoder("utf-8");
  let buffer = "";
  const reader = itr.getReader();
  while (true) {
    const { done, value: chunk } = await reader.read();
    if (done) {
      break;
    }
    buffer += decoder.decode(chunk, { stream: true });
    const parts = buffer.split("\n");
    buffer = parts.pop() ?? "";
    for (const part of parts) {
      try {
        yield JSON.parse(part);
      } catch (error) {
        console.warn("invalid json: ", part);
      }
    }
  }
  buffer += decoder.decode();
  for (const part of buffer.split("\n").filter((p) => p !== "")) {
    try {
      yield JSON.parse(part);
    } catch (error) {
      console.warn("invalid json: ", part);
    }
  }
};
const formatHost = (host) => {
  if (!host) {
    return defaultHost;
  }
  let isExplicitProtocol = host.includes("://");
  if (host.startsWith(":")) {
    host = `http://127.0.0.1${host}`;
    isExplicitProtocol = true;
  }
  if (!isExplicitProtocol) {
    host = `http://${host}`;
  }
  const url2 = new URL(host);
  let port = url2.port;
  if (!port) {
    if (!isExplicitProtocol) {
      port = defaultPort;
    } else {
      port = url2.protocol === "https:" ? "443" : "80";
    }
  }
  let auth = "";
  if (url2.username) {
    auth = url2.username;
    if (url2.password) {
      auth += `:${url2.password}`;
    }
    auth += "@";
  }
  let formattedHost = `${url2.protocol}//${auth}${url2.hostname}:${port}${url2.pathname}`;
  if (formattedHost.endsWith("/")) {
    formattedHost = formattedHost.slice(0, -1);
  }
  return formattedHost;
};
var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
let Ollama$1 = class Ollama {
  constructor(config2) {
    __publicField(this, "config");
    __publicField(this, "fetch");
    __publicField(this, "ongoingStreamedRequests", []);
    this.config = {
      host: "",
      headers: config2?.headers
    };
    if (!config2?.proxy) {
      this.config.host = formatHost(config2?.host ?? defaultHost);
    }
    this.fetch = config2?.fetch ?? fetch;
  }
  // Abort any ongoing streamed requests to Ollama
  abort() {
    for (const request of this.ongoingStreamedRequests) {
      request.abort();
    }
    this.ongoingStreamedRequests.length = 0;
  }
  /**
   * Processes a request to the Ollama server. If the request is streamable, it will return a
   * AbortableAsyncIterator that yields the response messages. Otherwise, it will return the response
   * object.
   * @param endpoint {string} - The endpoint to send the request to.
   * @param request {object} - The request object to send to the endpoint.
   * @protected {T | AbortableAsyncIterator<T>} - The response object or a AbortableAsyncIterator that yields
   * response messages.
   * @throws {Error} - If the response body is missing or if the response is an error.
   * @returns {Promise<T | AbortableAsyncIterator<T>>} - The response object or a AbortableAsyncIterator that yields the streamed response.
   */
  async processStreamableRequest(endpoint, request) {
    request.stream = request.stream ?? false;
    const host = `${this.config.host}/api/${endpoint}`;
    if (request.stream) {
      const abortController = new AbortController();
      const response2 = await post(this.fetch, host, request, {
        signal: abortController.signal,
        headers: this.config.headers
      });
      if (!response2.body) {
        throw new Error("Missing body");
      }
      const itr = parseJSON(response2.body);
      const abortableAsyncIterator = new AbortableAsyncIterator(
        abortController,
        itr,
        () => {
          const i = this.ongoingStreamedRequests.indexOf(abortableAsyncIterator);
          if (i > -1) {
            this.ongoingStreamedRequests.splice(i, 1);
          }
        }
      );
      this.ongoingStreamedRequests.push(abortableAsyncIterator);
      return abortableAsyncIterator;
    }
    const response = await post(this.fetch, host, request, {
      headers: this.config.headers
    });
    return await response.json();
  }
  /**
   * Encodes an image to base64 if it is a Uint8Array.
   * @param image {Uint8Array | string} - The image to encode.
   * @returns {Promise<string>} - The base64 encoded image.
   */
  async encodeImage(image) {
    if (typeof image !== "string") {
      const uint8Array = new Uint8Array(image);
      let byteString = "";
      const len = uint8Array.byteLength;
      for (let i = 0; i < len; i++) {
        byteString += String.fromCharCode(uint8Array[i]);
      }
      return btoa(byteString);
    }
    return image;
  }
  /**
   * Generates a response from a text prompt.
   * @param request {GenerateRequest} - The request object.
   * @returns {Promise<GenerateResponse | AbortableAsyncIterator<GenerateResponse>>} - The response object or
   * an AbortableAsyncIterator that yields response messages.
   */
  async generate(request) {
    if (request.images) {
      request.images = await Promise.all(request.images.map(this.encodeImage.bind(this)));
    }
    return this.processStreamableRequest("generate", request);
  }
  /**
   * Chats with the model. The request object can contain messages with images that are either
   * Uint8Arrays or base64 encoded strings. The images will be base64 encoded before sending the
   * request.
   * @param request {ChatRequest} - The request object.
   * @returns {Promise<ChatResponse | AbortableAsyncIterator<ChatResponse>>} - The response object or an
   * AbortableAsyncIterator that yields response messages.
   */
  async chat(request) {
    if (request.messages) {
      for (const message of request.messages) {
        if (message.images) {
          message.images = await Promise.all(
            message.images.map(this.encodeImage.bind(this))
          );
        }
      }
    }
    return this.processStreamableRequest("chat", request);
  }
  /**
   * Creates a new model from a stream of data.
   * @param request {CreateRequest} - The request object.
   * @returns {Promise<ProgressResponse | AbortableAsyncIterator<ProgressResponse>>} - The response object or a stream of progress responses.
   */
  async create(request) {
    return this.processStreamableRequest("create", {
      ...request
    });
  }
  /**
   * Pulls a model from the Ollama registry. The request object can contain a stream flag to indicate if the
   * response should be streamed.
   * @param request {PullRequest} - The request object.
   * @returns {Promise<ProgressResponse | AbortableAsyncIterator<ProgressResponse>>} - The response object or
   * an AbortableAsyncIterator that yields response messages.
   */
  async pull(request) {
    return this.processStreamableRequest("pull", {
      name: request.model,
      stream: request.stream,
      insecure: request.insecure
    });
  }
  /**
   * Pushes a model to the Ollama registry. The request object can contain a stream flag to indicate if the
   * response should be streamed.
   * @param request {PushRequest} - The request object.
   * @returns {Promise<ProgressResponse | AbortableAsyncIterator<ProgressResponse>>} - The response object or
   * an AbortableAsyncIterator that yields response messages.
   */
  async push(request) {
    return this.processStreamableRequest("push", {
      name: request.model,
      stream: request.stream,
      insecure: request.insecure
    });
  }
  /**
   * Deletes a model from the server. The request object should contain the name of the model to
   * delete.
   * @param request {DeleteRequest} - The request object.
   * @returns {Promise<StatusResponse>} - The response object.
   */
  async delete(request) {
    await del(
      this.fetch,
      `${this.config.host}/api/delete`,
      { name: request.model },
      { headers: this.config.headers }
    );
    return { status: "success" };
  }
  /**
   * Copies a model from one name to another. The request object should contain the name of the
   * model to copy and the new name.
   * @param request {CopyRequest} - The request object.
   * @returns {Promise<StatusResponse>} - The response object.
   */
  async copy(request) {
    await post(this.fetch, `${this.config.host}/api/copy`, { ...request }, {
      headers: this.config.headers
    });
    return { status: "success" };
  }
  /**
   * Lists the models on the server.
   * @returns {Promise<ListResponse>} - The response object.
   * @throws {Error} - If the response body is missing.
   */
  async list() {
    const response = await get(this.fetch, `${this.config.host}/api/tags`, {
      headers: this.config.headers
    });
    return await response.json();
  }
  /**
   * Shows the metadata of a model. The request object should contain the name of the model.
   * @param request {ShowRequest} - The request object.
   * @returns {Promise<ShowResponse>} - The response object.
   */
  async show(request) {
    const response = await post(this.fetch, `${this.config.host}/api/show`, {
      ...request
    }, {
      headers: this.config.headers
    });
    return await response.json();
  }
  /**
   * Embeds text input into vectors.
   * @param request {EmbedRequest} - The request object.
   * @returns {Promise<EmbedResponse>} - The response object.
   */
  async embed(request) {
    const response = await post(this.fetch, `${this.config.host}/api/embed`, {
      ...request
    }, {
      headers: this.config.headers
    });
    return await response.json();
  }
  /**
   * Embeds a text prompt into a vector.
   * @param request {EmbeddingsRequest} - The request object.
   * @returns {Promise<EmbeddingsResponse>} - The response object.
   */
  async embeddings(request) {
    const response = await post(this.fetch, `${this.config.host}/api/embeddings`, {
      ...request
    }, {
      headers: this.config.headers
    });
    return await response.json();
  }
  /**
   * Lists the running models on the server
   * @returns {Promise<ListResponse>} - The response object.
   * @throws {Error} - If the response body is missing.
   */
  async ps() {
    const response = await get(this.fetch, `${this.config.host}/api/ps`, {
      headers: this.config.headers
    });
    return await response.json();
  }
  /**
   * Returns the Ollama server version.
   * @returns {Promise<VersionResponse>} - The server version object.
   */
  async version() {
    const response = await get(this.fetch, `${this.config.host}/api/version`, {
      headers: this.config.headers
    });
    return await response.json();
  }
  /**
   * Performs web search using the Ollama web search API
   * @param request {WebSearchRequest} - The search request containing query and options
   * @returns {Promise<WebSearchResponse>} - The search results
   * @throws {Error} - If the request is invalid or the server returns an error
   */
  async webSearch(request) {
    if (!request.query || request.query.length === 0) {
      throw new Error("Query is required");
    }
    const response = await post(this.fetch, `https://ollama.com/api/web_search`, { ...request }, {
      headers: this.config.headers
    });
    return await response.json();
  }
  /**
   * Fetches a single page using the Ollama web fetch API
   * @param request {WebFetchRequest} - The fetch request containing a URL
   * @returns {Promise<WebFetchResponse>} - The fetch result
   * @throws {Error} - If the request is invalid or the server returns an error
   */
  async webFetch(request) {
    if (!request.url || request.url.length === 0) {
      throw new Error("URL is required");
    }
    const response = await post(this.fetch, `https://ollama.com/api/web_fetch`, { ...request }, { headers: this.config.headers });
    return await response.json();
  }
};
new Ollama$1();
class Ollama2 extends Ollama$1 {
  async encodeImage(image) {
    if (typeof image !== "string") {
      return Buffer.from(image).toString("base64");
    }
    try {
      if (fs.existsSync(image)) {
        const fileBuffer = await promises.readFile(resolve(image));
        return Buffer.from(fileBuffer).toString("base64");
      }
    } catch {
    }
    return image;
  }
  /**
   * checks if a file exists
   * @param path {string} - The path to the file
   * @private @internal
   * @returns {Promise<boolean>} - Whether the file exists or not
   */
  async fileExists(path2) {
    try {
      await promises.access(path2);
      return true;
    } catch {
      return false;
    }
  }
  async create(request) {
    if (request.from && await this.fileExists(resolve(request.from))) {
      throw Error("Creating with a local path is not currently supported from ollama-js");
    }
    if (request.stream) {
      return super.create(request);
    } else {
      return super.create(request);
    }
  }
}
new Ollama2();
class Config {
  OLLAMA_BASE_URL = "https://ollama.com";
  MIREA_BASE_URL = "https://schedule-of.mirea.ru";
  MISTRAL_BASE_URL = "https://api.mistral.ai";
  TELEGRAM_BOT_BASE_URL = "https://api.telegram.org/bot";
}
const Config$1 = new Config();
class OllamaService {
  cachedHost = "";
  cachedToken = "";
  cachedClient = null;
  getClient(token) {
    const host = Config$1.OLLAMA_BASE_URL.trim();
    const normalizedToken = token.trim();
    if (this.cachedClient && this.cachedHost === host && this.cachedToken === normalizedToken) {
      return this.cachedClient;
    }
    this.cachedHost = host;
    this.cachedToken = normalizedToken;
    this.cachedClient = new Ollama2({
      host,
      ...normalizedToken ? {
        headers: {
          Authorization: `Bearer ${normalizedToken}`
        }
      } : {}
    });
    return this.cachedClient;
  }
  async streamChat(payload, token) {
    const client = this.getClient(token);
    const stream2 = await client.chat({
      model: payload.model,
      messages: payload.messages,
      ...payload.tools ? { tools: payload.tools } : {},
      ...payload.format ? { format: payload.format } : {},
      ...payload.think !== void 0 ? { think: payload.think } : {},
      stream: true
    });
    const chunks = [];
    for await (const part of stream2) {
      chunks.push({
        model: part.model,
        created_at: part.created_at instanceof Date ? part.created_at.toISOString() : String(part.created_at),
        message: {
          role: part.message.role,
          content: part.message.content,
          thinking: part.message.thinking,
          tool_calls: part.message.tool_calls
        },
        done: part.done
      });
    }
    return chunks;
  }
}
var realtime = {};
var audioencoding = {};
var enums = {};
var v3 = {};
var external = {};
var errors$1 = {};
var en = { exports: {} };
var ZodError = {};
var util = {};
var hasRequiredUtil;
function requireUtil() {
  if (hasRequiredUtil) return util;
  hasRequiredUtil = 1;
  (function(exports$1) {
    Object.defineProperty(exports$1, "__esModule", { value: true });
    exports$1.getParsedType = exports$1.ZodParsedType = exports$1.objectUtil = exports$1.util = void 0;
    var util2;
    (function(util3) {
      util3.assertEqual = (_) => {
      };
      function assertIs(_arg) {
      }
      util3.assertIs = assertIs;
      function assertNever(_x) {
        throw new Error();
      }
      util3.assertNever = assertNever;
      util3.arrayToEnum = (items) => {
        const obj = {};
        for (const item of items) {
          obj[item] = item;
        }
        return obj;
      };
      util3.getValidEnumValues = (obj) => {
        const validKeys = util3.objectKeys(obj).filter((k) => typeof obj[obj[k]] !== "number");
        const filtered = {};
        for (const k of validKeys) {
          filtered[k] = obj[k];
        }
        return util3.objectValues(filtered);
      };
      util3.objectValues = (obj) => {
        return util3.objectKeys(obj).map(function(e) {
          return obj[e];
        });
      };
      util3.objectKeys = typeof Object.keys === "function" ? (obj) => Object.keys(obj) : (object) => {
        const keys = [];
        for (const key in object) {
          if (Object.prototype.hasOwnProperty.call(object, key)) {
            keys.push(key);
          }
        }
        return keys;
      };
      util3.find = (arr, checker) => {
        for (const item of arr) {
          if (checker(item))
            return item;
        }
        return void 0;
      };
      util3.isInteger = typeof Number.isInteger === "function" ? (val) => Number.isInteger(val) : (val) => typeof val === "number" && Number.isFinite(val) && Math.floor(val) === val;
      function joinValues(array, separator = " | ") {
        return array.map((val) => typeof val === "string" ? `'${val}'` : val).join(separator);
      }
      util3.joinValues = joinValues;
      util3.jsonStringifyReplacer = (_, value) => {
        if (typeof value === "bigint") {
          return value.toString();
        }
        return value;
      };
    })(util2 || (exports$1.util = util2 = {}));
    var objectUtil;
    (function(objectUtil2) {
      objectUtil2.mergeShapes = (first, second) => {
        return {
          ...first,
          ...second
          // second overwrites first
        };
      };
    })(objectUtil || (exports$1.objectUtil = objectUtil = {}));
    exports$1.ZodParsedType = util2.arrayToEnum([
      "string",
      "nan",
      "number",
      "integer",
      "float",
      "boolean",
      "date",
      "bigint",
      "symbol",
      "function",
      "undefined",
      "null",
      "array",
      "object",
      "unknown",
      "promise",
      "void",
      "never",
      "map",
      "set"
    ]);
    const getParsedType = (data) => {
      const t = typeof data;
      switch (t) {
        case "undefined":
          return exports$1.ZodParsedType.undefined;
        case "string":
          return exports$1.ZodParsedType.string;
        case "number":
          return Number.isNaN(data) ? exports$1.ZodParsedType.nan : exports$1.ZodParsedType.number;
        case "boolean":
          return exports$1.ZodParsedType.boolean;
        case "function":
          return exports$1.ZodParsedType.function;
        case "bigint":
          return exports$1.ZodParsedType.bigint;
        case "symbol":
          return exports$1.ZodParsedType.symbol;
        case "object":
          if (Array.isArray(data)) {
            return exports$1.ZodParsedType.array;
          }
          if (data === null) {
            return exports$1.ZodParsedType.null;
          }
          if (data.then && typeof data.then === "function" && data.catch && typeof data.catch === "function") {
            return exports$1.ZodParsedType.promise;
          }
          if (typeof Map !== "undefined" && data instanceof Map) {
            return exports$1.ZodParsedType.map;
          }
          if (typeof Set !== "undefined" && data instanceof Set) {
            return exports$1.ZodParsedType.set;
          }
          if (typeof Date !== "undefined" && data instanceof Date) {
            return exports$1.ZodParsedType.date;
          }
          return exports$1.ZodParsedType.object;
        default:
          return exports$1.ZodParsedType.unknown;
      }
    };
    exports$1.getParsedType = getParsedType;
  })(util);
  return util;
}
var hasRequiredZodError;
function requireZodError() {
  if (hasRequiredZodError) return ZodError;
  hasRequiredZodError = 1;
  Object.defineProperty(ZodError, "__esModule", { value: true });
  ZodError.ZodError = ZodError.quotelessJson = ZodError.ZodIssueCode = void 0;
  const util_js_1 = requireUtil();
  ZodError.ZodIssueCode = util_js_1.util.arrayToEnum([
    "invalid_type",
    "invalid_literal",
    "custom",
    "invalid_union",
    "invalid_union_discriminator",
    "invalid_enum_value",
    "unrecognized_keys",
    "invalid_arguments",
    "invalid_return_type",
    "invalid_date",
    "invalid_string",
    "too_small",
    "too_big",
    "invalid_intersection_types",
    "not_multiple_of",
    "not_finite"
  ]);
  const quotelessJson = (obj) => {
    const json = JSON.stringify(obj, null, 2);
    return json.replace(/"([^"]+)":/g, "$1:");
  };
  ZodError.quotelessJson = quotelessJson;
  let ZodError$1 = class ZodError2 extends Error {
    get errors() {
      return this.issues;
    }
    constructor(issues) {
      super();
      this.issues = [];
      this.addIssue = (sub) => {
        this.issues = [...this.issues, sub];
      };
      this.addIssues = (subs = []) => {
        this.issues = [...this.issues, ...subs];
      };
      const actualProto = new.target.prototype;
      if (Object.setPrototypeOf) {
        Object.setPrototypeOf(this, actualProto);
      } else {
        this.__proto__ = actualProto;
      }
      this.name = "ZodError";
      this.issues = issues;
    }
    format(_mapper) {
      const mapper = _mapper || function(issue) {
        return issue.message;
      };
      const fieldErrors = { _errors: [] };
      const processError = (error) => {
        for (const issue of error.issues) {
          if (issue.code === "invalid_union") {
            issue.unionErrors.map(processError);
          } else if (issue.code === "invalid_return_type") {
            processError(issue.returnTypeError);
          } else if (issue.code === "invalid_arguments") {
            processError(issue.argumentsError);
          } else if (issue.path.length === 0) {
            fieldErrors._errors.push(mapper(issue));
          } else {
            let curr = fieldErrors;
            let i = 0;
            while (i < issue.path.length) {
              const el = issue.path[i];
              const terminal = i === issue.path.length - 1;
              if (!terminal) {
                curr[el] = curr[el] || { _errors: [] };
              } else {
                curr[el] = curr[el] || { _errors: [] };
                curr[el]._errors.push(mapper(issue));
              }
              curr = curr[el];
              i++;
            }
          }
        }
      };
      processError(this);
      return fieldErrors;
    }
    static assert(value) {
      if (!(value instanceof ZodError2)) {
        throw new Error(`Not a ZodError: ${value}`);
      }
    }
    toString() {
      return this.message;
    }
    get message() {
      return JSON.stringify(this.issues, util_js_1.util.jsonStringifyReplacer, 2);
    }
    get isEmpty() {
      return this.issues.length === 0;
    }
    flatten(mapper = (issue) => issue.message) {
      const fieldErrors = /* @__PURE__ */ Object.create(null);
      const formErrors = [];
      for (const sub of this.issues) {
        if (sub.path.length > 0) {
          const firstEl = sub.path[0];
          fieldErrors[firstEl] = fieldErrors[firstEl] || [];
          fieldErrors[firstEl].push(mapper(sub));
        } else {
          formErrors.push(mapper(sub));
        }
      }
      return { formErrors, fieldErrors };
    }
    get formErrors() {
      return this.flatten();
    }
  };
  ZodError.ZodError = ZodError$1;
  ZodError$1.create = (issues) => {
    const error = new ZodError$1(issues);
    return error;
  };
  return ZodError;
}
var hasRequiredEn;
function requireEn() {
  if (hasRequiredEn) return en.exports;
  hasRequiredEn = 1;
  (function(module, exports$1) {
    Object.defineProperty(exports$1, "__esModule", { value: true });
    const ZodError_js_1 = requireZodError();
    const util_js_1 = requireUtil();
    const errorMap = (issue, _ctx) => {
      let message;
      switch (issue.code) {
        case ZodError_js_1.ZodIssueCode.invalid_type:
          if (issue.received === util_js_1.ZodParsedType.undefined) {
            message = "Required";
          } else {
            message = `Expected ${issue.expected}, received ${issue.received}`;
          }
          break;
        case ZodError_js_1.ZodIssueCode.invalid_literal:
          message = `Invalid literal value, expected ${JSON.stringify(issue.expected, util_js_1.util.jsonStringifyReplacer)}`;
          break;
        case ZodError_js_1.ZodIssueCode.unrecognized_keys:
          message = `Unrecognized key(s) in object: ${util_js_1.util.joinValues(issue.keys, ", ")}`;
          break;
        case ZodError_js_1.ZodIssueCode.invalid_union:
          message = `Invalid input`;
          break;
        case ZodError_js_1.ZodIssueCode.invalid_union_discriminator:
          message = `Invalid discriminator value. Expected ${util_js_1.util.joinValues(issue.options)}`;
          break;
        case ZodError_js_1.ZodIssueCode.invalid_enum_value:
          message = `Invalid enum value. Expected ${util_js_1.util.joinValues(issue.options)}, received '${issue.received}'`;
          break;
        case ZodError_js_1.ZodIssueCode.invalid_arguments:
          message = `Invalid function arguments`;
          break;
        case ZodError_js_1.ZodIssueCode.invalid_return_type:
          message = `Invalid function return type`;
          break;
        case ZodError_js_1.ZodIssueCode.invalid_date:
          message = `Invalid date`;
          break;
        case ZodError_js_1.ZodIssueCode.invalid_string:
          if (typeof issue.validation === "object") {
            if ("includes" in issue.validation) {
              message = `Invalid input: must include "${issue.validation.includes}"`;
              if (typeof issue.validation.position === "number") {
                message = `${message} at one or more positions greater than or equal to ${issue.validation.position}`;
              }
            } else if ("startsWith" in issue.validation) {
              message = `Invalid input: must start with "${issue.validation.startsWith}"`;
            } else if ("endsWith" in issue.validation) {
              message = `Invalid input: must end with "${issue.validation.endsWith}"`;
            } else {
              util_js_1.util.assertNever(issue.validation);
            }
          } else if (issue.validation !== "regex") {
            message = `Invalid ${issue.validation}`;
          } else {
            message = "Invalid";
          }
          break;
        case ZodError_js_1.ZodIssueCode.too_small:
          if (issue.type === "array")
            message = `Array must contain ${issue.exact ? "exactly" : issue.inclusive ? `at least` : `more than`} ${issue.minimum} element(s)`;
          else if (issue.type === "string")
            message = `String must contain ${issue.exact ? "exactly" : issue.inclusive ? `at least` : `over`} ${issue.minimum} character(s)`;
          else if (issue.type === "number")
            message = `Number must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${issue.minimum}`;
          else if (issue.type === "bigint")
            message = `Number must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${issue.minimum}`;
          else if (issue.type === "date")
            message = `Date must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${new Date(Number(issue.minimum))}`;
          else
            message = "Invalid input";
          break;
        case ZodError_js_1.ZodIssueCode.too_big:
          if (issue.type === "array")
            message = `Array must contain ${issue.exact ? `exactly` : issue.inclusive ? `at most` : `less than`} ${issue.maximum} element(s)`;
          else if (issue.type === "string")
            message = `String must contain ${issue.exact ? `exactly` : issue.inclusive ? `at most` : `under`} ${issue.maximum} character(s)`;
          else if (issue.type === "number")
            message = `Number must be ${issue.exact ? `exactly` : issue.inclusive ? `less than or equal to` : `less than`} ${issue.maximum}`;
          else if (issue.type === "bigint")
            message = `BigInt must be ${issue.exact ? `exactly` : issue.inclusive ? `less than or equal to` : `less than`} ${issue.maximum}`;
          else if (issue.type === "date")
            message = `Date must be ${issue.exact ? `exactly` : issue.inclusive ? `smaller than or equal to` : `smaller than`} ${new Date(Number(issue.maximum))}`;
          else
            message = "Invalid input";
          break;
        case ZodError_js_1.ZodIssueCode.custom:
          message = `Invalid input`;
          break;
        case ZodError_js_1.ZodIssueCode.invalid_intersection_types:
          message = `Intersection results could not be merged`;
          break;
        case ZodError_js_1.ZodIssueCode.not_multiple_of:
          message = `Number must be a multiple of ${issue.multipleOf}`;
          break;
        case ZodError_js_1.ZodIssueCode.not_finite:
          message = "Number must be finite";
          break;
        default:
          message = _ctx.defaultError;
          util_js_1.util.assertNever(issue);
      }
      return { message };
    };
    exports$1.default = errorMap;
    module.exports = exports$1.default;
  })(en, en.exports);
  return en.exports;
}
var hasRequiredErrors$1;
function requireErrors$1() {
  if (hasRequiredErrors$1) return errors$1;
  hasRequiredErrors$1 = 1;
  var __importDefault = errors$1 && errors$1.__importDefault || function(mod) {
    return mod && mod.__esModule ? mod : { "default": mod };
  };
  Object.defineProperty(errors$1, "__esModule", { value: true });
  errors$1.defaultErrorMap = void 0;
  errors$1.setErrorMap = setErrorMap;
  errors$1.getErrorMap = getErrorMap;
  const en_js_1 = __importDefault(requireEn());
  errors$1.defaultErrorMap = en_js_1.default;
  let overrideErrorMap = en_js_1.default;
  function setErrorMap(map) {
    overrideErrorMap = map;
  }
  function getErrorMap() {
    return overrideErrorMap;
  }
  return errors$1;
}
var parseUtil = {};
var hasRequiredParseUtil;
function requireParseUtil() {
  if (hasRequiredParseUtil) return parseUtil;
  hasRequiredParseUtil = 1;
  (function(exports$1) {
    var __importDefault = parseUtil && parseUtil.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports$1, "__esModule", { value: true });
    exports$1.isAsync = exports$1.isValid = exports$1.isDirty = exports$1.isAborted = exports$1.OK = exports$1.DIRTY = exports$1.INVALID = exports$1.ParseStatus = exports$1.EMPTY_PATH = exports$1.makeIssue = void 0;
    exports$1.addIssueToContext = addIssueToContext;
    const errors_js_1 = requireErrors$1();
    const en_js_1 = __importDefault(requireEn());
    const makeIssue = (params) => {
      const { data, path: path2, errorMaps, issueData } = params;
      const fullPath = [...path2, ...issueData.path || []];
      const fullIssue = {
        ...issueData,
        path: fullPath
      };
      if (issueData.message !== void 0) {
        return {
          ...issueData,
          path: fullPath,
          message: issueData.message
        };
      }
      let errorMessage = "";
      const maps = errorMaps.filter((m) => !!m).slice().reverse();
      for (const map of maps) {
        errorMessage = map(fullIssue, { data, defaultError: errorMessage }).message;
      }
      return {
        ...issueData,
        path: fullPath,
        message: errorMessage
      };
    };
    exports$1.makeIssue = makeIssue;
    exports$1.EMPTY_PATH = [];
    function addIssueToContext(ctx, issueData) {
      const overrideMap = (0, errors_js_1.getErrorMap)();
      const issue = (0, exports$1.makeIssue)({
        issueData,
        data: ctx.data,
        path: ctx.path,
        errorMaps: [
          ctx.common.contextualErrorMap,
          // contextual error map is first priority
          ctx.schemaErrorMap,
          // then schema-bound map if available
          overrideMap,
          // then global override map
          overrideMap === en_js_1.default ? void 0 : en_js_1.default
          // then global default map
        ].filter((x) => !!x)
      });
      ctx.common.issues.push(issue);
    }
    class ParseStatus {
      constructor() {
        this.value = "valid";
      }
      dirty() {
        if (this.value === "valid")
          this.value = "dirty";
      }
      abort() {
        if (this.value !== "aborted")
          this.value = "aborted";
      }
      static mergeArray(status, results) {
        const arrayValue = [];
        for (const s of results) {
          if (s.status === "aborted")
            return exports$1.INVALID;
          if (s.status === "dirty")
            status.dirty();
          arrayValue.push(s.value);
        }
        return { status: status.value, value: arrayValue };
      }
      static async mergeObjectAsync(status, pairs) {
        const syncPairs = [];
        for (const pair of pairs) {
          const key = await pair.key;
          const value = await pair.value;
          syncPairs.push({
            key,
            value
          });
        }
        return ParseStatus.mergeObjectSync(status, syncPairs);
      }
      static mergeObjectSync(status, pairs) {
        const finalObject = {};
        for (const pair of pairs) {
          const { key, value } = pair;
          if (key.status === "aborted")
            return exports$1.INVALID;
          if (value.status === "aborted")
            return exports$1.INVALID;
          if (key.status === "dirty")
            status.dirty();
          if (value.status === "dirty")
            status.dirty();
          if (key.value !== "__proto__" && (typeof value.value !== "undefined" || pair.alwaysSet)) {
            finalObject[key.value] = value.value;
          }
        }
        return { status: status.value, value: finalObject };
      }
    }
    exports$1.ParseStatus = ParseStatus;
    exports$1.INVALID = Object.freeze({
      status: "aborted"
    });
    const DIRTY = (value) => ({ status: "dirty", value });
    exports$1.DIRTY = DIRTY;
    const OK = (value) => ({ status: "valid", value });
    exports$1.OK = OK;
    const isAborted = (x) => x.status === "aborted";
    exports$1.isAborted = isAborted;
    const isDirty = (x) => x.status === "dirty";
    exports$1.isDirty = isDirty;
    const isValid = (x) => x.status === "valid";
    exports$1.isValid = isValid;
    const isAsync = (x) => typeof Promise !== "undefined" && x instanceof Promise;
    exports$1.isAsync = isAsync;
  })(parseUtil);
  return parseUtil;
}
var typeAliases = {};
var hasRequiredTypeAliases;
function requireTypeAliases() {
  if (hasRequiredTypeAliases) return typeAliases;
  hasRequiredTypeAliases = 1;
  Object.defineProperty(typeAliases, "__esModule", { value: true });
  return typeAliases;
}
var types = {};
var errorUtil = {};
var hasRequiredErrorUtil;
function requireErrorUtil() {
  if (hasRequiredErrorUtil) return errorUtil;
  hasRequiredErrorUtil = 1;
  Object.defineProperty(errorUtil, "__esModule", { value: true });
  errorUtil.errorUtil = void 0;
  var errorUtil$1;
  (function(errorUtil2) {
    errorUtil2.errToObj = (message) => typeof message === "string" ? { message } : message || {};
    errorUtil2.toString = (message) => typeof message === "string" ? message : message?.message;
  })(errorUtil$1 || (errorUtil.errorUtil = errorUtil$1 = {}));
  return errorUtil;
}
var hasRequiredTypes;
function requireTypes() {
  if (hasRequiredTypes) return types;
  hasRequiredTypes = 1;
  Object.defineProperty(types, "__esModule", { value: true });
  types.discriminatedUnion = types.date = types.boolean = types.bigint = types.array = types.any = types.coerce = types.ZodFirstPartyTypeKind = types.late = types.ZodSchema = types.Schema = types.ZodReadonly = types.ZodPipeline = types.ZodBranded = types.BRAND = types.ZodNaN = types.ZodCatch = types.ZodDefault = types.ZodNullable = types.ZodOptional = types.ZodTransformer = types.ZodEffects = types.ZodPromise = types.ZodNativeEnum = types.ZodEnum = types.ZodLiteral = types.ZodLazy = types.ZodFunction = types.ZodSet = types.ZodMap = types.ZodRecord = types.ZodTuple = types.ZodIntersection = types.ZodDiscriminatedUnion = types.ZodUnion = types.ZodObject = types.ZodArray = types.ZodVoid = types.ZodNever = types.ZodUnknown = types.ZodAny = types.ZodNull = types.ZodUndefined = types.ZodSymbol = types.ZodDate = types.ZodBoolean = types.ZodBigInt = types.ZodNumber = types.ZodString = types.ZodType = void 0;
  types.NEVER = types.void = types.unknown = types.union = types.undefined = types.tuple = types.transformer = types.symbol = types.string = types.strictObject = types.set = types.record = types.promise = types.preprocess = types.pipeline = types.ostring = types.optional = types.onumber = types.oboolean = types.object = types.number = types.nullable = types.null = types.never = types.nativeEnum = types.nan = types.map = types.literal = types.lazy = types.intersection = types.instanceof = types.function = types.enum = types.effect = void 0;
  types.datetimeRegex = datetimeRegex;
  types.custom = custom;
  const ZodError_js_1 = requireZodError();
  const errors_js_1 = requireErrors$1();
  const errorUtil_js_1 = requireErrorUtil();
  const parseUtil_js_1 = requireParseUtil();
  const util_js_1 = requireUtil();
  class ParseInputLazyPath {
    constructor(parent, value, path2, key) {
      this._cachedPath = [];
      this.parent = parent;
      this.data = value;
      this._path = path2;
      this._key = key;
    }
    get path() {
      if (!this._cachedPath.length) {
        if (Array.isArray(this._key)) {
          this._cachedPath.push(...this._path, ...this._key);
        } else {
          this._cachedPath.push(...this._path, this._key);
        }
      }
      return this._cachedPath;
    }
  }
  const handleResult = (ctx, result) => {
    if ((0, parseUtil_js_1.isValid)(result)) {
      return { success: true, data: result.value };
    } else {
      if (!ctx.common.issues.length) {
        throw new Error("Validation failed but no issues detected.");
      }
      return {
        success: false,
        get error() {
          if (this._error)
            return this._error;
          const error = new ZodError_js_1.ZodError(ctx.common.issues);
          this._error = error;
          return this._error;
        }
      };
    }
  };
  function processCreateParams(params) {
    if (!params)
      return {};
    const { errorMap, invalid_type_error, required_error, description } = params;
    if (errorMap && (invalid_type_error || required_error)) {
      throw new Error(`Can't use "invalid_type_error" or "required_error" in conjunction with custom error map.`);
    }
    if (errorMap)
      return { errorMap, description };
    const customMap = (iss, ctx) => {
      const { message } = params;
      if (iss.code === "invalid_enum_value") {
        return { message: message ?? ctx.defaultError };
      }
      if (typeof ctx.data === "undefined") {
        return { message: message ?? required_error ?? ctx.defaultError };
      }
      if (iss.code !== "invalid_type")
        return { message: ctx.defaultError };
      return { message: message ?? invalid_type_error ?? ctx.defaultError };
    };
    return { errorMap: customMap, description };
  }
  class ZodType {
    get description() {
      return this._def.description;
    }
    _getType(input) {
      return (0, util_js_1.getParsedType)(input.data);
    }
    _getOrReturnCtx(input, ctx) {
      return ctx || {
        common: input.parent.common,
        data: input.data,
        parsedType: (0, util_js_1.getParsedType)(input.data),
        schemaErrorMap: this._def.errorMap,
        path: input.path,
        parent: input.parent
      };
    }
    _processInputParams(input) {
      return {
        status: new parseUtil_js_1.ParseStatus(),
        ctx: {
          common: input.parent.common,
          data: input.data,
          parsedType: (0, util_js_1.getParsedType)(input.data),
          schemaErrorMap: this._def.errorMap,
          path: input.path,
          parent: input.parent
        }
      };
    }
    _parseSync(input) {
      const result = this._parse(input);
      if ((0, parseUtil_js_1.isAsync)(result)) {
        throw new Error("Synchronous parse encountered promise.");
      }
      return result;
    }
    _parseAsync(input) {
      const result = this._parse(input);
      return Promise.resolve(result);
    }
    parse(data, params) {
      const result = this.safeParse(data, params);
      if (result.success)
        return result.data;
      throw result.error;
    }
    safeParse(data, params) {
      const ctx = {
        common: {
          issues: [],
          async: params?.async ?? false,
          contextualErrorMap: params?.errorMap
        },
        path: params?.path || [],
        schemaErrorMap: this._def.errorMap,
        parent: null,
        data,
        parsedType: (0, util_js_1.getParsedType)(data)
      };
      const result = this._parseSync({ data, path: ctx.path, parent: ctx });
      return handleResult(ctx, result);
    }
    "~validate"(data) {
      const ctx = {
        common: {
          issues: [],
          async: !!this["~standard"].async
        },
        path: [],
        schemaErrorMap: this._def.errorMap,
        parent: null,
        data,
        parsedType: (0, util_js_1.getParsedType)(data)
      };
      if (!this["~standard"].async) {
        try {
          const result = this._parseSync({ data, path: [], parent: ctx });
          return (0, parseUtil_js_1.isValid)(result) ? {
            value: result.value
          } : {
            issues: ctx.common.issues
          };
        } catch (err) {
          if (err?.message?.toLowerCase()?.includes("encountered")) {
            this["~standard"].async = true;
          }
          ctx.common = {
            issues: [],
            async: true
          };
        }
      }
      return this._parseAsync({ data, path: [], parent: ctx }).then((result) => (0, parseUtil_js_1.isValid)(result) ? {
        value: result.value
      } : {
        issues: ctx.common.issues
      });
    }
    async parseAsync(data, params) {
      const result = await this.safeParseAsync(data, params);
      if (result.success)
        return result.data;
      throw result.error;
    }
    async safeParseAsync(data, params) {
      const ctx = {
        common: {
          issues: [],
          contextualErrorMap: params?.errorMap,
          async: true
        },
        path: params?.path || [],
        schemaErrorMap: this._def.errorMap,
        parent: null,
        data,
        parsedType: (0, util_js_1.getParsedType)(data)
      };
      const maybeAsyncResult = this._parse({ data, path: ctx.path, parent: ctx });
      const result = await ((0, parseUtil_js_1.isAsync)(maybeAsyncResult) ? maybeAsyncResult : Promise.resolve(maybeAsyncResult));
      return handleResult(ctx, result);
    }
    refine(check, message) {
      const getIssueProperties = (val) => {
        if (typeof message === "string" || typeof message === "undefined") {
          return { message };
        } else if (typeof message === "function") {
          return message(val);
        } else {
          return message;
        }
      };
      return this._refinement((val, ctx) => {
        const result = check(val);
        const setError = () => ctx.addIssue({
          code: ZodError_js_1.ZodIssueCode.custom,
          ...getIssueProperties(val)
        });
        if (typeof Promise !== "undefined" && result instanceof Promise) {
          return result.then((data) => {
            if (!data) {
              setError();
              return false;
            } else {
              return true;
            }
          });
        }
        if (!result) {
          setError();
          return false;
        } else {
          return true;
        }
      });
    }
    refinement(check, refinementData) {
      return this._refinement((val, ctx) => {
        if (!check(val)) {
          ctx.addIssue(typeof refinementData === "function" ? refinementData(val, ctx) : refinementData);
          return false;
        } else {
          return true;
        }
      });
    }
    _refinement(refinement) {
      return new ZodEffects({
        schema: this,
        typeName: ZodFirstPartyTypeKind.ZodEffects,
        effect: { type: "refinement", refinement }
      });
    }
    superRefine(refinement) {
      return this._refinement(refinement);
    }
    constructor(def) {
      this.spa = this.safeParseAsync;
      this._def = def;
      this.parse = this.parse.bind(this);
      this.safeParse = this.safeParse.bind(this);
      this.parseAsync = this.parseAsync.bind(this);
      this.safeParseAsync = this.safeParseAsync.bind(this);
      this.spa = this.spa.bind(this);
      this.refine = this.refine.bind(this);
      this.refinement = this.refinement.bind(this);
      this.superRefine = this.superRefine.bind(this);
      this.optional = this.optional.bind(this);
      this.nullable = this.nullable.bind(this);
      this.nullish = this.nullish.bind(this);
      this.array = this.array.bind(this);
      this.promise = this.promise.bind(this);
      this.or = this.or.bind(this);
      this.and = this.and.bind(this);
      this.transform = this.transform.bind(this);
      this.brand = this.brand.bind(this);
      this.default = this.default.bind(this);
      this.catch = this.catch.bind(this);
      this.describe = this.describe.bind(this);
      this.pipe = this.pipe.bind(this);
      this.readonly = this.readonly.bind(this);
      this.isNullable = this.isNullable.bind(this);
      this.isOptional = this.isOptional.bind(this);
      this["~standard"] = {
        version: 1,
        vendor: "zod",
        validate: (data) => this["~validate"](data)
      };
    }
    optional() {
      return ZodOptional.create(this, this._def);
    }
    nullable() {
      return ZodNullable.create(this, this._def);
    }
    nullish() {
      return this.nullable().optional();
    }
    array() {
      return ZodArray.create(this);
    }
    promise() {
      return ZodPromise.create(this, this._def);
    }
    or(option) {
      return ZodUnion.create([this, option], this._def);
    }
    and(incoming) {
      return ZodIntersection.create(this, incoming, this._def);
    }
    transform(transform) {
      return new ZodEffects({
        ...processCreateParams(this._def),
        schema: this,
        typeName: ZodFirstPartyTypeKind.ZodEffects,
        effect: { type: "transform", transform }
      });
    }
    default(def) {
      const defaultValueFunc = typeof def === "function" ? def : () => def;
      return new ZodDefault({
        ...processCreateParams(this._def),
        innerType: this,
        defaultValue: defaultValueFunc,
        typeName: ZodFirstPartyTypeKind.ZodDefault
      });
    }
    brand() {
      return new ZodBranded({
        typeName: ZodFirstPartyTypeKind.ZodBranded,
        type: this,
        ...processCreateParams(this._def)
      });
    }
    catch(def) {
      const catchValueFunc = typeof def === "function" ? def : () => def;
      return new ZodCatch({
        ...processCreateParams(this._def),
        innerType: this,
        catchValue: catchValueFunc,
        typeName: ZodFirstPartyTypeKind.ZodCatch
      });
    }
    describe(description) {
      const This = this.constructor;
      return new This({
        ...this._def,
        description
      });
    }
    pipe(target) {
      return ZodPipeline.create(this, target);
    }
    readonly() {
      return ZodReadonly.create(this);
    }
    isOptional() {
      return this.safeParse(void 0).success;
    }
    isNullable() {
      return this.safeParse(null).success;
    }
  }
  types.ZodType = ZodType;
  types.Schema = ZodType;
  types.ZodSchema = ZodType;
  const cuidRegex = /^c[^\s-]{8,}$/i;
  const cuid2Regex = /^[0-9a-z]+$/;
  const ulidRegex = /^[0-9A-HJKMNP-TV-Z]{26}$/i;
  const uuidRegex = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/i;
  const nanoidRegex = /^[a-z0-9_-]{21}$/i;
  const jwtRegex = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/;
  const durationRegex = /^[-+]?P(?!$)(?:(?:[-+]?\d+Y)|(?:[-+]?\d+[.,]\d+Y$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:(?:[-+]?\d+W)|(?:[-+]?\d+[.,]\d+W$))?(?:(?:[-+]?\d+D)|(?:[-+]?\d+[.,]\d+D$))?(?:T(?=[\d+-])(?:(?:[-+]?\d+H)|(?:[-+]?\d+[.,]\d+H$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:[-+]?\d+(?:[.,]\d+)?S)?)??$/;
  const emailRegex = /^(?!\.)(?!.*\.\.)([A-Z0-9_'+\-\.]*)[A-Z0-9_+-]@([A-Z0-9][A-Z0-9\-]*\.)+[A-Z]{2,}$/i;
  const _emojiRegex = `^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$`;
  let emojiRegex;
  const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/;
  const ipv4CidrRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/(3[0-2]|[12]?[0-9])$/;
  const ipv6Regex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;
  const ipv6CidrRegex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/;
  const base64Regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
  const base64urlRegex = /^([0-9a-zA-Z-_]{4})*(([0-9a-zA-Z-_]{2}(==)?)|([0-9a-zA-Z-_]{3}(=)?))?$/;
  const dateRegexSource = `((\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-((0[13578]|1[02])-(0[1-9]|[12]\\d|3[01])|(0[469]|11)-(0[1-9]|[12]\\d|30)|(02)-(0[1-9]|1\\d|2[0-8])))`;
  const dateRegex = new RegExp(`^${dateRegexSource}$`);
  function timeRegexSource(args) {
    let secondsRegexSource = `[0-5]\\d`;
    if (args.precision) {
      secondsRegexSource = `${secondsRegexSource}\\.\\d{${args.precision}}`;
    } else if (args.precision == null) {
      secondsRegexSource = `${secondsRegexSource}(\\.\\d+)?`;
    }
    const secondsQuantifier = args.precision ? "+" : "?";
    return `([01]\\d|2[0-3]):[0-5]\\d(:${secondsRegexSource})${secondsQuantifier}`;
  }
  function timeRegex(args) {
    return new RegExp(`^${timeRegexSource(args)}$`);
  }
  function datetimeRegex(args) {
    let regex = `${dateRegexSource}T${timeRegexSource(args)}`;
    const opts = [];
    opts.push(args.local ? `Z?` : `Z`);
    if (args.offset)
      opts.push(`([+-]\\d{2}:?\\d{2})`);
    regex = `${regex}(${opts.join("|")})`;
    return new RegExp(`^${regex}$`);
  }
  function isValidIP(ip, version2) {
    if ((version2 === "v4" || !version2) && ipv4Regex.test(ip)) {
      return true;
    }
    if ((version2 === "v6" || !version2) && ipv6Regex.test(ip)) {
      return true;
    }
    return false;
  }
  function isValidJWT(jwt, alg) {
    if (!jwtRegex.test(jwt))
      return false;
    try {
      const [header] = jwt.split(".");
      if (!header)
        return false;
      const base642 = header.replace(/-/g, "+").replace(/_/g, "/").padEnd(header.length + (4 - header.length % 4) % 4, "=");
      const decoded = JSON.parse(atob(base642));
      if (typeof decoded !== "object" || decoded === null)
        return false;
      if ("typ" in decoded && decoded?.typ !== "JWT")
        return false;
      if (!decoded.alg)
        return false;
      if (alg && decoded.alg !== alg)
        return false;
      return true;
    } catch {
      return false;
    }
  }
  function isValidCidr(ip, version2) {
    if ((version2 === "v4" || !version2) && ipv4CidrRegex.test(ip)) {
      return true;
    }
    if ((version2 === "v6" || !version2) && ipv6CidrRegex.test(ip)) {
      return true;
    }
    return false;
  }
  class ZodString extends ZodType {
    _parse(input) {
      if (this._def.coerce) {
        input.data = String(input.data);
      }
      const parsedType = this._getType(input);
      if (parsedType !== util_js_1.ZodParsedType.string) {
        const ctx2 = this._getOrReturnCtx(input);
        (0, parseUtil_js_1.addIssueToContext)(ctx2, {
          code: ZodError_js_1.ZodIssueCode.invalid_type,
          expected: util_js_1.ZodParsedType.string,
          received: ctx2.parsedType
        });
        return parseUtil_js_1.INVALID;
      }
      const status = new parseUtil_js_1.ParseStatus();
      let ctx = void 0;
      for (const check of this._def.checks) {
        if (check.kind === "min") {
          if (input.data.length < check.value) {
            ctx = this._getOrReturnCtx(input, ctx);
            (0, parseUtil_js_1.addIssueToContext)(ctx, {
              code: ZodError_js_1.ZodIssueCode.too_small,
              minimum: check.value,
              type: "string",
              inclusive: true,
              exact: false,
              message: check.message
            });
            status.dirty();
          }
        } else if (check.kind === "max") {
          if (input.data.length > check.value) {
            ctx = this._getOrReturnCtx(input, ctx);
            (0, parseUtil_js_1.addIssueToContext)(ctx, {
              code: ZodError_js_1.ZodIssueCode.too_big,
              maximum: check.value,
              type: "string",
              inclusive: true,
              exact: false,
              message: check.message
            });
            status.dirty();
          }
        } else if (check.kind === "length") {
          const tooBig = input.data.length > check.value;
          const tooSmall = input.data.length < check.value;
          if (tooBig || tooSmall) {
            ctx = this._getOrReturnCtx(input, ctx);
            if (tooBig) {
              (0, parseUtil_js_1.addIssueToContext)(ctx, {
                code: ZodError_js_1.ZodIssueCode.too_big,
                maximum: check.value,
                type: "string",
                inclusive: true,
                exact: true,
                message: check.message
              });
            } else if (tooSmall) {
              (0, parseUtil_js_1.addIssueToContext)(ctx, {
                code: ZodError_js_1.ZodIssueCode.too_small,
                minimum: check.value,
                type: "string",
                inclusive: true,
                exact: true,
                message: check.message
              });
            }
            status.dirty();
          }
        } else if (check.kind === "email") {
          if (!emailRegex.test(input.data)) {
            ctx = this._getOrReturnCtx(input, ctx);
            (0, parseUtil_js_1.addIssueToContext)(ctx, {
              validation: "email",
              code: ZodError_js_1.ZodIssueCode.invalid_string,
              message: check.message
            });
            status.dirty();
          }
        } else if (check.kind === "emoji") {
          if (!emojiRegex) {
            emojiRegex = new RegExp(_emojiRegex, "u");
          }
          if (!emojiRegex.test(input.data)) {
            ctx = this._getOrReturnCtx(input, ctx);
            (0, parseUtil_js_1.addIssueToContext)(ctx, {
              validation: "emoji",
              code: ZodError_js_1.ZodIssueCode.invalid_string,
              message: check.message
            });
            status.dirty();
          }
        } else if (check.kind === "uuid") {
          if (!uuidRegex.test(input.data)) {
            ctx = this._getOrReturnCtx(input, ctx);
            (0, parseUtil_js_1.addIssueToContext)(ctx, {
              validation: "uuid",
              code: ZodError_js_1.ZodIssueCode.invalid_string,
              message: check.message
            });
            status.dirty();
          }
        } else if (check.kind === "nanoid") {
          if (!nanoidRegex.test(input.data)) {
            ctx = this._getOrReturnCtx(input, ctx);
            (0, parseUtil_js_1.addIssueToContext)(ctx, {
              validation: "nanoid",
              code: ZodError_js_1.ZodIssueCode.invalid_string,
              message: check.message
            });
            status.dirty();
          }
        } else if (check.kind === "cuid") {
          if (!cuidRegex.test(input.data)) {
            ctx = this._getOrReturnCtx(input, ctx);
            (0, parseUtil_js_1.addIssueToContext)(ctx, {
              validation: "cuid",
              code: ZodError_js_1.ZodIssueCode.invalid_string,
              message: check.message
            });
            status.dirty();
          }
        } else if (check.kind === "cuid2") {
          if (!cuid2Regex.test(input.data)) {
            ctx = this._getOrReturnCtx(input, ctx);
            (0, parseUtil_js_1.addIssueToContext)(ctx, {
              validation: "cuid2",
              code: ZodError_js_1.ZodIssueCode.invalid_string,
              message: check.message
            });
            status.dirty();
          }
        } else if (check.kind === "ulid") {
          if (!ulidRegex.test(input.data)) {
            ctx = this._getOrReturnCtx(input, ctx);
            (0, parseUtil_js_1.addIssueToContext)(ctx, {
              validation: "ulid",
              code: ZodError_js_1.ZodIssueCode.invalid_string,
              message: check.message
            });
            status.dirty();
          }
        } else if (check.kind === "url") {
          try {
            new URL(input.data);
          } catch {
            ctx = this._getOrReturnCtx(input, ctx);
            (0, parseUtil_js_1.addIssueToContext)(ctx, {
              validation: "url",
              code: ZodError_js_1.ZodIssueCode.invalid_string,
              message: check.message
            });
            status.dirty();
          }
        } else if (check.kind === "regex") {
          check.regex.lastIndex = 0;
          const testResult = check.regex.test(input.data);
          if (!testResult) {
            ctx = this._getOrReturnCtx(input, ctx);
            (0, parseUtil_js_1.addIssueToContext)(ctx, {
              validation: "regex",
              code: ZodError_js_1.ZodIssueCode.invalid_string,
              message: check.message
            });
            status.dirty();
          }
        } else if (check.kind === "trim") {
          input.data = input.data.trim();
        } else if (check.kind === "includes") {
          if (!input.data.includes(check.value, check.position)) {
            ctx = this._getOrReturnCtx(input, ctx);
            (0, parseUtil_js_1.addIssueToContext)(ctx, {
              code: ZodError_js_1.ZodIssueCode.invalid_string,
              validation: { includes: check.value, position: check.position },
              message: check.message
            });
            status.dirty();
          }
        } else if (check.kind === "toLowerCase") {
          input.data = input.data.toLowerCase();
        } else if (check.kind === "toUpperCase") {
          input.data = input.data.toUpperCase();
        } else if (check.kind === "startsWith") {
          if (!input.data.startsWith(check.value)) {
            ctx = this._getOrReturnCtx(input, ctx);
            (0, parseUtil_js_1.addIssueToContext)(ctx, {
              code: ZodError_js_1.ZodIssueCode.invalid_string,
              validation: { startsWith: check.value },
              message: check.message
            });
            status.dirty();
          }
        } else if (check.kind === "endsWith") {
          if (!input.data.endsWith(check.value)) {
            ctx = this._getOrReturnCtx(input, ctx);
            (0, parseUtil_js_1.addIssueToContext)(ctx, {
              code: ZodError_js_1.ZodIssueCode.invalid_string,
              validation: { endsWith: check.value },
              message: check.message
            });
            status.dirty();
          }
        } else if (check.kind === "datetime") {
          const regex = datetimeRegex(check);
          if (!regex.test(input.data)) {
            ctx = this._getOrReturnCtx(input, ctx);
            (0, parseUtil_js_1.addIssueToContext)(ctx, {
              code: ZodError_js_1.ZodIssueCode.invalid_string,
              validation: "datetime",
              message: check.message
            });
            status.dirty();
          }
        } else if (check.kind === "date") {
          const regex = dateRegex;
          if (!regex.test(input.data)) {
            ctx = this._getOrReturnCtx(input, ctx);
            (0, parseUtil_js_1.addIssueToContext)(ctx, {
              code: ZodError_js_1.ZodIssueCode.invalid_string,
              validation: "date",
              message: check.message
            });
            status.dirty();
          }
        } else if (check.kind === "time") {
          const regex = timeRegex(check);
          if (!regex.test(input.data)) {
            ctx = this._getOrReturnCtx(input, ctx);
            (0, parseUtil_js_1.addIssueToContext)(ctx, {
              code: ZodError_js_1.ZodIssueCode.invalid_string,
              validation: "time",
              message: check.message
            });
            status.dirty();
          }
        } else if (check.kind === "duration") {
          if (!durationRegex.test(input.data)) {
            ctx = this._getOrReturnCtx(input, ctx);
            (0, parseUtil_js_1.addIssueToContext)(ctx, {
              validation: "duration",
              code: ZodError_js_1.ZodIssueCode.invalid_string,
              message: check.message
            });
            status.dirty();
          }
        } else if (check.kind === "ip") {
          if (!isValidIP(input.data, check.version)) {
            ctx = this._getOrReturnCtx(input, ctx);
            (0, parseUtil_js_1.addIssueToContext)(ctx, {
              validation: "ip",
              code: ZodError_js_1.ZodIssueCode.invalid_string,
              message: check.message
            });
            status.dirty();
          }
        } else if (check.kind === "jwt") {
          if (!isValidJWT(input.data, check.alg)) {
            ctx = this._getOrReturnCtx(input, ctx);
            (0, parseUtil_js_1.addIssueToContext)(ctx, {
              validation: "jwt",
              code: ZodError_js_1.ZodIssueCode.invalid_string,
              message: check.message
            });
            status.dirty();
          }
        } else if (check.kind === "cidr") {
          if (!isValidCidr(input.data, check.version)) {
            ctx = this._getOrReturnCtx(input, ctx);
            (0, parseUtil_js_1.addIssueToContext)(ctx, {
              validation: "cidr",
              code: ZodError_js_1.ZodIssueCode.invalid_string,
              message: check.message
            });
            status.dirty();
          }
        } else if (check.kind === "base64") {
          if (!base64Regex.test(input.data)) {
            ctx = this._getOrReturnCtx(input, ctx);
            (0, parseUtil_js_1.addIssueToContext)(ctx, {
              validation: "base64",
              code: ZodError_js_1.ZodIssueCode.invalid_string,
              message: check.message
            });
            status.dirty();
          }
        } else if (check.kind === "base64url") {
          if (!base64urlRegex.test(input.data)) {
            ctx = this._getOrReturnCtx(input, ctx);
            (0, parseUtil_js_1.addIssueToContext)(ctx, {
              validation: "base64url",
              code: ZodError_js_1.ZodIssueCode.invalid_string,
              message: check.message
            });
            status.dirty();
          }
        } else {
          util_js_1.util.assertNever(check);
        }
      }
      return { status: status.value, value: input.data };
    }
    _regex(regex, validation2, message) {
      return this.refinement((data) => regex.test(data), {
        validation: validation2,
        code: ZodError_js_1.ZodIssueCode.invalid_string,
        ...errorUtil_js_1.errorUtil.errToObj(message)
      });
    }
    _addCheck(check) {
      return new ZodString({
        ...this._def,
        checks: [...this._def.checks, check]
      });
    }
    email(message) {
      return this._addCheck({ kind: "email", ...errorUtil_js_1.errorUtil.errToObj(message) });
    }
    url(message) {
      return this._addCheck({ kind: "url", ...errorUtil_js_1.errorUtil.errToObj(message) });
    }
    emoji(message) {
      return this._addCheck({ kind: "emoji", ...errorUtil_js_1.errorUtil.errToObj(message) });
    }
    uuid(message) {
      return this._addCheck({ kind: "uuid", ...errorUtil_js_1.errorUtil.errToObj(message) });
    }
    nanoid(message) {
      return this._addCheck({ kind: "nanoid", ...errorUtil_js_1.errorUtil.errToObj(message) });
    }
    cuid(message) {
      return this._addCheck({ kind: "cuid", ...errorUtil_js_1.errorUtil.errToObj(message) });
    }
    cuid2(message) {
      return this._addCheck({ kind: "cuid2", ...errorUtil_js_1.errorUtil.errToObj(message) });
    }
    ulid(message) {
      return this._addCheck({ kind: "ulid", ...errorUtil_js_1.errorUtil.errToObj(message) });
    }
    base64(message) {
      return this._addCheck({ kind: "base64", ...errorUtil_js_1.errorUtil.errToObj(message) });
    }
    base64url(message) {
      return this._addCheck({
        kind: "base64url",
        ...errorUtil_js_1.errorUtil.errToObj(message)
      });
    }
    jwt(options) {
      return this._addCheck({ kind: "jwt", ...errorUtil_js_1.errorUtil.errToObj(options) });
    }
    ip(options) {
      return this._addCheck({ kind: "ip", ...errorUtil_js_1.errorUtil.errToObj(options) });
    }
    cidr(options) {
      return this._addCheck({ kind: "cidr", ...errorUtil_js_1.errorUtil.errToObj(options) });
    }
    datetime(options) {
      if (typeof options === "string") {
        return this._addCheck({
          kind: "datetime",
          precision: null,
          offset: false,
          local: false,
          message: options
        });
      }
      return this._addCheck({
        kind: "datetime",
        precision: typeof options?.precision === "undefined" ? null : options?.precision,
        offset: options?.offset ?? false,
        local: options?.local ?? false,
        ...errorUtil_js_1.errorUtil.errToObj(options?.message)
      });
    }
    date(message) {
      return this._addCheck({ kind: "date", message });
    }
    time(options) {
      if (typeof options === "string") {
        return this._addCheck({
          kind: "time",
          precision: null,
          message: options
        });
      }
      return this._addCheck({
        kind: "time",
        precision: typeof options?.precision === "undefined" ? null : options?.precision,
        ...errorUtil_js_1.errorUtil.errToObj(options?.message)
      });
    }
    duration(message) {
      return this._addCheck({ kind: "duration", ...errorUtil_js_1.errorUtil.errToObj(message) });
    }
    regex(regex, message) {
      return this._addCheck({
        kind: "regex",
        regex,
        ...errorUtil_js_1.errorUtil.errToObj(message)
      });
    }
    includes(value, options) {
      return this._addCheck({
        kind: "includes",
        value,
        position: options?.position,
        ...errorUtil_js_1.errorUtil.errToObj(options?.message)
      });
    }
    startsWith(value, message) {
      return this._addCheck({
        kind: "startsWith",
        value,
        ...errorUtil_js_1.errorUtil.errToObj(message)
      });
    }
    endsWith(value, message) {
      return this._addCheck({
        kind: "endsWith",
        value,
        ...errorUtil_js_1.errorUtil.errToObj(message)
      });
    }
    min(minLength, message) {
      return this._addCheck({
        kind: "min",
        value: minLength,
        ...errorUtil_js_1.errorUtil.errToObj(message)
      });
    }
    max(maxLength, message) {
      return this._addCheck({
        kind: "max",
        value: maxLength,
        ...errorUtil_js_1.errorUtil.errToObj(message)
      });
    }
    length(len, message) {
      return this._addCheck({
        kind: "length",
        value: len,
        ...errorUtil_js_1.errorUtil.errToObj(message)
      });
    }
    /**
     * Equivalent to `.min(1)`
     */
    nonempty(message) {
      return this.min(1, errorUtil_js_1.errorUtil.errToObj(message));
    }
    trim() {
      return new ZodString({
        ...this._def,
        checks: [...this._def.checks, { kind: "trim" }]
      });
    }
    toLowerCase() {
      return new ZodString({
        ...this._def,
        checks: [...this._def.checks, { kind: "toLowerCase" }]
      });
    }
    toUpperCase() {
      return new ZodString({
        ...this._def,
        checks: [...this._def.checks, { kind: "toUpperCase" }]
      });
    }
    get isDatetime() {
      return !!this._def.checks.find((ch) => ch.kind === "datetime");
    }
    get isDate() {
      return !!this._def.checks.find((ch) => ch.kind === "date");
    }
    get isTime() {
      return !!this._def.checks.find((ch) => ch.kind === "time");
    }
    get isDuration() {
      return !!this._def.checks.find((ch) => ch.kind === "duration");
    }
    get isEmail() {
      return !!this._def.checks.find((ch) => ch.kind === "email");
    }
    get isURL() {
      return !!this._def.checks.find((ch) => ch.kind === "url");
    }
    get isEmoji() {
      return !!this._def.checks.find((ch) => ch.kind === "emoji");
    }
    get isUUID() {
      return !!this._def.checks.find((ch) => ch.kind === "uuid");
    }
    get isNANOID() {
      return !!this._def.checks.find((ch) => ch.kind === "nanoid");
    }
    get isCUID() {
      return !!this._def.checks.find((ch) => ch.kind === "cuid");
    }
    get isCUID2() {
      return !!this._def.checks.find((ch) => ch.kind === "cuid2");
    }
    get isULID() {
      return !!this._def.checks.find((ch) => ch.kind === "ulid");
    }
    get isIP() {
      return !!this._def.checks.find((ch) => ch.kind === "ip");
    }
    get isCIDR() {
      return !!this._def.checks.find((ch) => ch.kind === "cidr");
    }
    get isBase64() {
      return !!this._def.checks.find((ch) => ch.kind === "base64");
    }
    get isBase64url() {
      return !!this._def.checks.find((ch) => ch.kind === "base64url");
    }
    get minLength() {
      let min = null;
      for (const ch of this._def.checks) {
        if (ch.kind === "min") {
          if (min === null || ch.value > min)
            min = ch.value;
        }
      }
      return min;
    }
    get maxLength() {
      let max = null;
      for (const ch of this._def.checks) {
        if (ch.kind === "max") {
          if (max === null || ch.value < max)
            max = ch.value;
        }
      }
      return max;
    }
  }
  types.ZodString = ZodString;
  ZodString.create = (params) => {
    return new ZodString({
      checks: [],
      typeName: ZodFirstPartyTypeKind.ZodString,
      coerce: params?.coerce ?? false,
      ...processCreateParams(params)
    });
  };
  function floatSafeRemainder(val, step) {
    const valDecCount = (val.toString().split(".")[1] || "").length;
    const stepDecCount = (step.toString().split(".")[1] || "").length;
    const decCount = valDecCount > stepDecCount ? valDecCount : stepDecCount;
    const valInt = Number.parseInt(val.toFixed(decCount).replace(".", ""));
    const stepInt = Number.parseInt(step.toFixed(decCount).replace(".", ""));
    return valInt % stepInt / 10 ** decCount;
  }
  class ZodNumber extends ZodType {
    constructor() {
      super(...arguments);
      this.min = this.gte;
      this.max = this.lte;
      this.step = this.multipleOf;
    }
    _parse(input) {
      if (this._def.coerce) {
        input.data = Number(input.data);
      }
      const parsedType = this._getType(input);
      if (parsedType !== util_js_1.ZodParsedType.number) {
        const ctx2 = this._getOrReturnCtx(input);
        (0, parseUtil_js_1.addIssueToContext)(ctx2, {
          code: ZodError_js_1.ZodIssueCode.invalid_type,
          expected: util_js_1.ZodParsedType.number,
          received: ctx2.parsedType
        });
        return parseUtil_js_1.INVALID;
      }
      let ctx = void 0;
      const status = new parseUtil_js_1.ParseStatus();
      for (const check of this._def.checks) {
        if (check.kind === "int") {
          if (!util_js_1.util.isInteger(input.data)) {
            ctx = this._getOrReturnCtx(input, ctx);
            (0, parseUtil_js_1.addIssueToContext)(ctx, {
              code: ZodError_js_1.ZodIssueCode.invalid_type,
              expected: "integer",
              received: "float",
              message: check.message
            });
            status.dirty();
          }
        } else if (check.kind === "min") {
          const tooSmall = check.inclusive ? input.data < check.value : input.data <= check.value;
          if (tooSmall) {
            ctx = this._getOrReturnCtx(input, ctx);
            (0, parseUtil_js_1.addIssueToContext)(ctx, {
              code: ZodError_js_1.ZodIssueCode.too_small,
              minimum: check.value,
              type: "number",
              inclusive: check.inclusive,
              exact: false,
              message: check.message
            });
            status.dirty();
          }
        } else if (check.kind === "max") {
          const tooBig = check.inclusive ? input.data > check.value : input.data >= check.value;
          if (tooBig) {
            ctx = this._getOrReturnCtx(input, ctx);
            (0, parseUtil_js_1.addIssueToContext)(ctx, {
              code: ZodError_js_1.ZodIssueCode.too_big,
              maximum: check.value,
              type: "number",
              inclusive: check.inclusive,
              exact: false,
              message: check.message
            });
            status.dirty();
          }
        } else if (check.kind === "multipleOf") {
          if (floatSafeRemainder(input.data, check.value) !== 0) {
            ctx = this._getOrReturnCtx(input, ctx);
            (0, parseUtil_js_1.addIssueToContext)(ctx, {
              code: ZodError_js_1.ZodIssueCode.not_multiple_of,
              multipleOf: check.value,
              message: check.message
            });
            status.dirty();
          }
        } else if (check.kind === "finite") {
          if (!Number.isFinite(input.data)) {
            ctx = this._getOrReturnCtx(input, ctx);
            (0, parseUtil_js_1.addIssueToContext)(ctx, {
              code: ZodError_js_1.ZodIssueCode.not_finite,
              message: check.message
            });
            status.dirty();
          }
        } else {
          util_js_1.util.assertNever(check);
        }
      }
      return { status: status.value, value: input.data };
    }
    gte(value, message) {
      return this.setLimit("min", value, true, errorUtil_js_1.errorUtil.toString(message));
    }
    gt(value, message) {
      return this.setLimit("min", value, false, errorUtil_js_1.errorUtil.toString(message));
    }
    lte(value, message) {
      return this.setLimit("max", value, true, errorUtil_js_1.errorUtil.toString(message));
    }
    lt(value, message) {
      return this.setLimit("max", value, false, errorUtil_js_1.errorUtil.toString(message));
    }
    setLimit(kind, value, inclusive, message) {
      return new ZodNumber({
        ...this._def,
        checks: [
          ...this._def.checks,
          {
            kind,
            value,
            inclusive,
            message: errorUtil_js_1.errorUtil.toString(message)
          }
        ]
      });
    }
    _addCheck(check) {
      return new ZodNumber({
        ...this._def,
        checks: [...this._def.checks, check]
      });
    }
    int(message) {
      return this._addCheck({
        kind: "int",
        message: errorUtil_js_1.errorUtil.toString(message)
      });
    }
    positive(message) {
      return this._addCheck({
        kind: "min",
        value: 0,
        inclusive: false,
        message: errorUtil_js_1.errorUtil.toString(message)
      });
    }
    negative(message) {
      return this._addCheck({
        kind: "max",
        value: 0,
        inclusive: false,
        message: errorUtil_js_1.errorUtil.toString(message)
      });
    }
    nonpositive(message) {
      return this._addCheck({
        kind: "max",
        value: 0,
        inclusive: true,
        message: errorUtil_js_1.errorUtil.toString(message)
      });
    }
    nonnegative(message) {
      return this._addCheck({
        kind: "min",
        value: 0,
        inclusive: true,
        message: errorUtil_js_1.errorUtil.toString(message)
      });
    }
    multipleOf(value, message) {
      return this._addCheck({
        kind: "multipleOf",
        value,
        message: errorUtil_js_1.errorUtil.toString(message)
      });
    }
    finite(message) {
      return this._addCheck({
        kind: "finite",
        message: errorUtil_js_1.errorUtil.toString(message)
      });
    }
    safe(message) {
      return this._addCheck({
        kind: "min",
        inclusive: true,
        value: Number.MIN_SAFE_INTEGER,
        message: errorUtil_js_1.errorUtil.toString(message)
      })._addCheck({
        kind: "max",
        inclusive: true,
        value: Number.MAX_SAFE_INTEGER,
        message: errorUtil_js_1.errorUtil.toString(message)
      });
    }
    get minValue() {
      let min = null;
      for (const ch of this._def.checks) {
        if (ch.kind === "min") {
          if (min === null || ch.value > min)
            min = ch.value;
        }
      }
      return min;
    }
    get maxValue() {
      let max = null;
      for (const ch of this._def.checks) {
        if (ch.kind === "max") {
          if (max === null || ch.value < max)
            max = ch.value;
        }
      }
      return max;
    }
    get isInt() {
      return !!this._def.checks.find((ch) => ch.kind === "int" || ch.kind === "multipleOf" && util_js_1.util.isInteger(ch.value));
    }
    get isFinite() {
      let max = null;
      let min = null;
      for (const ch of this._def.checks) {
        if (ch.kind === "finite" || ch.kind === "int" || ch.kind === "multipleOf") {
          return true;
        } else if (ch.kind === "min") {
          if (min === null || ch.value > min)
            min = ch.value;
        } else if (ch.kind === "max") {
          if (max === null || ch.value < max)
            max = ch.value;
        }
      }
      return Number.isFinite(min) && Number.isFinite(max);
    }
  }
  types.ZodNumber = ZodNumber;
  ZodNumber.create = (params) => {
    return new ZodNumber({
      checks: [],
      typeName: ZodFirstPartyTypeKind.ZodNumber,
      coerce: params?.coerce || false,
      ...processCreateParams(params)
    });
  };
  class ZodBigInt extends ZodType {
    constructor() {
      super(...arguments);
      this.min = this.gte;
      this.max = this.lte;
    }
    _parse(input) {
      if (this._def.coerce) {
        try {
          input.data = BigInt(input.data);
        } catch {
          return this._getInvalidInput(input);
        }
      }
      const parsedType = this._getType(input);
      if (parsedType !== util_js_1.ZodParsedType.bigint) {
        return this._getInvalidInput(input);
      }
      let ctx = void 0;
      const status = new parseUtil_js_1.ParseStatus();
      for (const check of this._def.checks) {
        if (check.kind === "min") {
          const tooSmall = check.inclusive ? input.data < check.value : input.data <= check.value;
          if (tooSmall) {
            ctx = this._getOrReturnCtx(input, ctx);
            (0, parseUtil_js_1.addIssueToContext)(ctx, {
              code: ZodError_js_1.ZodIssueCode.too_small,
              type: "bigint",
              minimum: check.value,
              inclusive: check.inclusive,
              message: check.message
            });
            status.dirty();
          }
        } else if (check.kind === "max") {
          const tooBig = check.inclusive ? input.data > check.value : input.data >= check.value;
          if (tooBig) {
            ctx = this._getOrReturnCtx(input, ctx);
            (0, parseUtil_js_1.addIssueToContext)(ctx, {
              code: ZodError_js_1.ZodIssueCode.too_big,
              type: "bigint",
              maximum: check.value,
              inclusive: check.inclusive,
              message: check.message
            });
            status.dirty();
          }
        } else if (check.kind === "multipleOf") {
          if (input.data % check.value !== BigInt(0)) {
            ctx = this._getOrReturnCtx(input, ctx);
            (0, parseUtil_js_1.addIssueToContext)(ctx, {
              code: ZodError_js_1.ZodIssueCode.not_multiple_of,
              multipleOf: check.value,
              message: check.message
            });
            status.dirty();
          }
        } else {
          util_js_1.util.assertNever(check);
        }
      }
      return { status: status.value, value: input.data };
    }
    _getInvalidInput(input) {
      const ctx = this._getOrReturnCtx(input);
      (0, parseUtil_js_1.addIssueToContext)(ctx, {
        code: ZodError_js_1.ZodIssueCode.invalid_type,
        expected: util_js_1.ZodParsedType.bigint,
        received: ctx.parsedType
      });
      return parseUtil_js_1.INVALID;
    }
    gte(value, message) {
      return this.setLimit("min", value, true, errorUtil_js_1.errorUtil.toString(message));
    }
    gt(value, message) {
      return this.setLimit("min", value, false, errorUtil_js_1.errorUtil.toString(message));
    }
    lte(value, message) {
      return this.setLimit("max", value, true, errorUtil_js_1.errorUtil.toString(message));
    }
    lt(value, message) {
      return this.setLimit("max", value, false, errorUtil_js_1.errorUtil.toString(message));
    }
    setLimit(kind, value, inclusive, message) {
      return new ZodBigInt({
        ...this._def,
        checks: [
          ...this._def.checks,
          {
            kind,
            value,
            inclusive,
            message: errorUtil_js_1.errorUtil.toString(message)
          }
        ]
      });
    }
    _addCheck(check) {
      return new ZodBigInt({
        ...this._def,
        checks: [...this._def.checks, check]
      });
    }
    positive(message) {
      return this._addCheck({
        kind: "min",
        value: BigInt(0),
        inclusive: false,
        message: errorUtil_js_1.errorUtil.toString(message)
      });
    }
    negative(message) {
      return this._addCheck({
        kind: "max",
        value: BigInt(0),
        inclusive: false,
        message: errorUtil_js_1.errorUtil.toString(message)
      });
    }
    nonpositive(message) {
      return this._addCheck({
        kind: "max",
        value: BigInt(0),
        inclusive: true,
        message: errorUtil_js_1.errorUtil.toString(message)
      });
    }
    nonnegative(message) {
      return this._addCheck({
        kind: "min",
        value: BigInt(0),
        inclusive: true,
        message: errorUtil_js_1.errorUtil.toString(message)
      });
    }
    multipleOf(value, message) {
      return this._addCheck({
        kind: "multipleOf",
        value,
        message: errorUtil_js_1.errorUtil.toString(message)
      });
    }
    get minValue() {
      let min = null;
      for (const ch of this._def.checks) {
        if (ch.kind === "min") {
          if (min === null || ch.value > min)
            min = ch.value;
        }
      }
      return min;
    }
    get maxValue() {
      let max = null;
      for (const ch of this._def.checks) {
        if (ch.kind === "max") {
          if (max === null || ch.value < max)
            max = ch.value;
        }
      }
      return max;
    }
  }
  types.ZodBigInt = ZodBigInt;
  ZodBigInt.create = (params) => {
    return new ZodBigInt({
      checks: [],
      typeName: ZodFirstPartyTypeKind.ZodBigInt,
      coerce: params?.coerce ?? false,
      ...processCreateParams(params)
    });
  };
  class ZodBoolean extends ZodType {
    _parse(input) {
      if (this._def.coerce) {
        input.data = Boolean(input.data);
      }
      const parsedType = this._getType(input);
      if (parsedType !== util_js_1.ZodParsedType.boolean) {
        const ctx = this._getOrReturnCtx(input);
        (0, parseUtil_js_1.addIssueToContext)(ctx, {
          code: ZodError_js_1.ZodIssueCode.invalid_type,
          expected: util_js_1.ZodParsedType.boolean,
          received: ctx.parsedType
        });
        return parseUtil_js_1.INVALID;
      }
      return (0, parseUtil_js_1.OK)(input.data);
    }
  }
  types.ZodBoolean = ZodBoolean;
  ZodBoolean.create = (params) => {
    return new ZodBoolean({
      typeName: ZodFirstPartyTypeKind.ZodBoolean,
      coerce: params?.coerce || false,
      ...processCreateParams(params)
    });
  };
  class ZodDate extends ZodType {
    _parse(input) {
      if (this._def.coerce) {
        input.data = new Date(input.data);
      }
      const parsedType = this._getType(input);
      if (parsedType !== util_js_1.ZodParsedType.date) {
        const ctx2 = this._getOrReturnCtx(input);
        (0, parseUtil_js_1.addIssueToContext)(ctx2, {
          code: ZodError_js_1.ZodIssueCode.invalid_type,
          expected: util_js_1.ZodParsedType.date,
          received: ctx2.parsedType
        });
        return parseUtil_js_1.INVALID;
      }
      if (Number.isNaN(input.data.getTime())) {
        const ctx2 = this._getOrReturnCtx(input);
        (0, parseUtil_js_1.addIssueToContext)(ctx2, {
          code: ZodError_js_1.ZodIssueCode.invalid_date
        });
        return parseUtil_js_1.INVALID;
      }
      const status = new parseUtil_js_1.ParseStatus();
      let ctx = void 0;
      for (const check of this._def.checks) {
        if (check.kind === "min") {
          if (input.data.getTime() < check.value) {
            ctx = this._getOrReturnCtx(input, ctx);
            (0, parseUtil_js_1.addIssueToContext)(ctx, {
              code: ZodError_js_1.ZodIssueCode.too_small,
              message: check.message,
              inclusive: true,
              exact: false,
              minimum: check.value,
              type: "date"
            });
            status.dirty();
          }
        } else if (check.kind === "max") {
          if (input.data.getTime() > check.value) {
            ctx = this._getOrReturnCtx(input, ctx);
            (0, parseUtil_js_1.addIssueToContext)(ctx, {
              code: ZodError_js_1.ZodIssueCode.too_big,
              message: check.message,
              inclusive: true,
              exact: false,
              maximum: check.value,
              type: "date"
            });
            status.dirty();
          }
        } else {
          util_js_1.util.assertNever(check);
        }
      }
      return {
        status: status.value,
        value: new Date(input.data.getTime())
      };
    }
    _addCheck(check) {
      return new ZodDate({
        ...this._def,
        checks: [...this._def.checks, check]
      });
    }
    min(minDate, message) {
      return this._addCheck({
        kind: "min",
        value: minDate.getTime(),
        message: errorUtil_js_1.errorUtil.toString(message)
      });
    }
    max(maxDate, message) {
      return this._addCheck({
        kind: "max",
        value: maxDate.getTime(),
        message: errorUtil_js_1.errorUtil.toString(message)
      });
    }
    get minDate() {
      let min = null;
      for (const ch of this._def.checks) {
        if (ch.kind === "min") {
          if (min === null || ch.value > min)
            min = ch.value;
        }
      }
      return min != null ? new Date(min) : null;
    }
    get maxDate() {
      let max = null;
      for (const ch of this._def.checks) {
        if (ch.kind === "max") {
          if (max === null || ch.value < max)
            max = ch.value;
        }
      }
      return max != null ? new Date(max) : null;
    }
  }
  types.ZodDate = ZodDate;
  ZodDate.create = (params) => {
    return new ZodDate({
      checks: [],
      coerce: params?.coerce || false,
      typeName: ZodFirstPartyTypeKind.ZodDate,
      ...processCreateParams(params)
    });
  };
  class ZodSymbol extends ZodType {
    _parse(input) {
      const parsedType = this._getType(input);
      if (parsedType !== util_js_1.ZodParsedType.symbol) {
        const ctx = this._getOrReturnCtx(input);
        (0, parseUtil_js_1.addIssueToContext)(ctx, {
          code: ZodError_js_1.ZodIssueCode.invalid_type,
          expected: util_js_1.ZodParsedType.symbol,
          received: ctx.parsedType
        });
        return parseUtil_js_1.INVALID;
      }
      return (0, parseUtil_js_1.OK)(input.data);
    }
  }
  types.ZodSymbol = ZodSymbol;
  ZodSymbol.create = (params) => {
    return new ZodSymbol({
      typeName: ZodFirstPartyTypeKind.ZodSymbol,
      ...processCreateParams(params)
    });
  };
  class ZodUndefined extends ZodType {
    _parse(input) {
      const parsedType = this._getType(input);
      if (parsedType !== util_js_1.ZodParsedType.undefined) {
        const ctx = this._getOrReturnCtx(input);
        (0, parseUtil_js_1.addIssueToContext)(ctx, {
          code: ZodError_js_1.ZodIssueCode.invalid_type,
          expected: util_js_1.ZodParsedType.undefined,
          received: ctx.parsedType
        });
        return parseUtil_js_1.INVALID;
      }
      return (0, parseUtil_js_1.OK)(input.data);
    }
  }
  types.ZodUndefined = ZodUndefined;
  ZodUndefined.create = (params) => {
    return new ZodUndefined({
      typeName: ZodFirstPartyTypeKind.ZodUndefined,
      ...processCreateParams(params)
    });
  };
  class ZodNull extends ZodType {
    _parse(input) {
      const parsedType = this._getType(input);
      if (parsedType !== util_js_1.ZodParsedType.null) {
        const ctx = this._getOrReturnCtx(input);
        (0, parseUtil_js_1.addIssueToContext)(ctx, {
          code: ZodError_js_1.ZodIssueCode.invalid_type,
          expected: util_js_1.ZodParsedType.null,
          received: ctx.parsedType
        });
        return parseUtil_js_1.INVALID;
      }
      return (0, parseUtil_js_1.OK)(input.data);
    }
  }
  types.ZodNull = ZodNull;
  ZodNull.create = (params) => {
    return new ZodNull({
      typeName: ZodFirstPartyTypeKind.ZodNull,
      ...processCreateParams(params)
    });
  };
  class ZodAny extends ZodType {
    constructor() {
      super(...arguments);
      this._any = true;
    }
    _parse(input) {
      return (0, parseUtil_js_1.OK)(input.data);
    }
  }
  types.ZodAny = ZodAny;
  ZodAny.create = (params) => {
    return new ZodAny({
      typeName: ZodFirstPartyTypeKind.ZodAny,
      ...processCreateParams(params)
    });
  };
  class ZodUnknown extends ZodType {
    constructor() {
      super(...arguments);
      this._unknown = true;
    }
    _parse(input) {
      return (0, parseUtil_js_1.OK)(input.data);
    }
  }
  types.ZodUnknown = ZodUnknown;
  ZodUnknown.create = (params) => {
    return new ZodUnknown({
      typeName: ZodFirstPartyTypeKind.ZodUnknown,
      ...processCreateParams(params)
    });
  };
  class ZodNever extends ZodType {
    _parse(input) {
      const ctx = this._getOrReturnCtx(input);
      (0, parseUtil_js_1.addIssueToContext)(ctx, {
        code: ZodError_js_1.ZodIssueCode.invalid_type,
        expected: util_js_1.ZodParsedType.never,
        received: ctx.parsedType
      });
      return parseUtil_js_1.INVALID;
    }
  }
  types.ZodNever = ZodNever;
  ZodNever.create = (params) => {
    return new ZodNever({
      typeName: ZodFirstPartyTypeKind.ZodNever,
      ...processCreateParams(params)
    });
  };
  class ZodVoid extends ZodType {
    _parse(input) {
      const parsedType = this._getType(input);
      if (parsedType !== util_js_1.ZodParsedType.undefined) {
        const ctx = this._getOrReturnCtx(input);
        (0, parseUtil_js_1.addIssueToContext)(ctx, {
          code: ZodError_js_1.ZodIssueCode.invalid_type,
          expected: util_js_1.ZodParsedType.void,
          received: ctx.parsedType
        });
        return parseUtil_js_1.INVALID;
      }
      return (0, parseUtil_js_1.OK)(input.data);
    }
  }
  types.ZodVoid = ZodVoid;
  ZodVoid.create = (params) => {
    return new ZodVoid({
      typeName: ZodFirstPartyTypeKind.ZodVoid,
      ...processCreateParams(params)
    });
  };
  class ZodArray extends ZodType {
    _parse(input) {
      const { ctx, status } = this._processInputParams(input);
      const def = this._def;
      if (ctx.parsedType !== util_js_1.ZodParsedType.array) {
        (0, parseUtil_js_1.addIssueToContext)(ctx, {
          code: ZodError_js_1.ZodIssueCode.invalid_type,
          expected: util_js_1.ZodParsedType.array,
          received: ctx.parsedType
        });
        return parseUtil_js_1.INVALID;
      }
      if (def.exactLength !== null) {
        const tooBig = ctx.data.length > def.exactLength.value;
        const tooSmall = ctx.data.length < def.exactLength.value;
        if (tooBig || tooSmall) {
          (0, parseUtil_js_1.addIssueToContext)(ctx, {
            code: tooBig ? ZodError_js_1.ZodIssueCode.too_big : ZodError_js_1.ZodIssueCode.too_small,
            minimum: tooSmall ? def.exactLength.value : void 0,
            maximum: tooBig ? def.exactLength.value : void 0,
            type: "array",
            inclusive: true,
            exact: true,
            message: def.exactLength.message
          });
          status.dirty();
        }
      }
      if (def.minLength !== null) {
        if (ctx.data.length < def.minLength.value) {
          (0, parseUtil_js_1.addIssueToContext)(ctx, {
            code: ZodError_js_1.ZodIssueCode.too_small,
            minimum: def.minLength.value,
            type: "array",
            inclusive: true,
            exact: false,
            message: def.minLength.message
          });
          status.dirty();
        }
      }
      if (def.maxLength !== null) {
        if (ctx.data.length > def.maxLength.value) {
          (0, parseUtil_js_1.addIssueToContext)(ctx, {
            code: ZodError_js_1.ZodIssueCode.too_big,
            maximum: def.maxLength.value,
            type: "array",
            inclusive: true,
            exact: false,
            message: def.maxLength.message
          });
          status.dirty();
        }
      }
      if (ctx.common.async) {
        return Promise.all([...ctx.data].map((item, i) => {
          return def.type._parseAsync(new ParseInputLazyPath(ctx, item, ctx.path, i));
        })).then((result2) => {
          return parseUtil_js_1.ParseStatus.mergeArray(status, result2);
        });
      }
      const result = [...ctx.data].map((item, i) => {
        return def.type._parseSync(new ParseInputLazyPath(ctx, item, ctx.path, i));
      });
      return parseUtil_js_1.ParseStatus.mergeArray(status, result);
    }
    get element() {
      return this._def.type;
    }
    min(minLength, message) {
      return new ZodArray({
        ...this._def,
        minLength: { value: minLength, message: errorUtil_js_1.errorUtil.toString(message) }
      });
    }
    max(maxLength, message) {
      return new ZodArray({
        ...this._def,
        maxLength: { value: maxLength, message: errorUtil_js_1.errorUtil.toString(message) }
      });
    }
    length(len, message) {
      return new ZodArray({
        ...this._def,
        exactLength: { value: len, message: errorUtil_js_1.errorUtil.toString(message) }
      });
    }
    nonempty(message) {
      return this.min(1, message);
    }
  }
  types.ZodArray = ZodArray;
  ZodArray.create = (schema, params) => {
    return new ZodArray({
      type: schema,
      minLength: null,
      maxLength: null,
      exactLength: null,
      typeName: ZodFirstPartyTypeKind.ZodArray,
      ...processCreateParams(params)
    });
  };
  function deepPartialify(schema) {
    if (schema instanceof ZodObject) {
      const newShape = {};
      for (const key in schema.shape) {
        const fieldSchema = schema.shape[key];
        newShape[key] = ZodOptional.create(deepPartialify(fieldSchema));
      }
      return new ZodObject({
        ...schema._def,
        shape: () => newShape
      });
    } else if (schema instanceof ZodArray) {
      return new ZodArray({
        ...schema._def,
        type: deepPartialify(schema.element)
      });
    } else if (schema instanceof ZodOptional) {
      return ZodOptional.create(deepPartialify(schema.unwrap()));
    } else if (schema instanceof ZodNullable) {
      return ZodNullable.create(deepPartialify(schema.unwrap()));
    } else if (schema instanceof ZodTuple) {
      return ZodTuple.create(schema.items.map((item) => deepPartialify(item)));
    } else {
      return schema;
    }
  }
  class ZodObject extends ZodType {
    constructor() {
      super(...arguments);
      this._cached = null;
      this.nonstrict = this.passthrough;
      this.augment = this.extend;
    }
    _getCached() {
      if (this._cached !== null)
        return this._cached;
      const shape = this._def.shape();
      const keys = util_js_1.util.objectKeys(shape);
      this._cached = { shape, keys };
      return this._cached;
    }
    _parse(input) {
      const parsedType = this._getType(input);
      if (parsedType !== util_js_1.ZodParsedType.object) {
        const ctx2 = this._getOrReturnCtx(input);
        (0, parseUtil_js_1.addIssueToContext)(ctx2, {
          code: ZodError_js_1.ZodIssueCode.invalid_type,
          expected: util_js_1.ZodParsedType.object,
          received: ctx2.parsedType
        });
        return parseUtil_js_1.INVALID;
      }
      const { status, ctx } = this._processInputParams(input);
      const { shape, keys: shapeKeys } = this._getCached();
      const extraKeys = [];
      if (!(this._def.catchall instanceof ZodNever && this._def.unknownKeys === "strip")) {
        for (const key in ctx.data) {
          if (!shapeKeys.includes(key)) {
            extraKeys.push(key);
          }
        }
      }
      const pairs = [];
      for (const key of shapeKeys) {
        const keyValidator = shape[key];
        const value = ctx.data[key];
        pairs.push({
          key: { status: "valid", value: key },
          value: keyValidator._parse(new ParseInputLazyPath(ctx, value, ctx.path, key)),
          alwaysSet: key in ctx.data
        });
      }
      if (this._def.catchall instanceof ZodNever) {
        const unknownKeys = this._def.unknownKeys;
        if (unknownKeys === "passthrough") {
          for (const key of extraKeys) {
            pairs.push({
              key: { status: "valid", value: key },
              value: { status: "valid", value: ctx.data[key] }
            });
          }
        } else if (unknownKeys === "strict") {
          if (extraKeys.length > 0) {
            (0, parseUtil_js_1.addIssueToContext)(ctx, {
              code: ZodError_js_1.ZodIssueCode.unrecognized_keys,
              keys: extraKeys
            });
            status.dirty();
          }
        } else if (unknownKeys === "strip") ;
        else {
          throw new Error(`Internal ZodObject error: invalid unknownKeys value.`);
        }
      } else {
        const catchall = this._def.catchall;
        for (const key of extraKeys) {
          const value = ctx.data[key];
          pairs.push({
            key: { status: "valid", value: key },
            value: catchall._parse(
              new ParseInputLazyPath(ctx, value, ctx.path, key)
              //, ctx.child(key), value, getParsedType(value)
            ),
            alwaysSet: key in ctx.data
          });
        }
      }
      if (ctx.common.async) {
        return Promise.resolve().then(async () => {
          const syncPairs = [];
          for (const pair of pairs) {
            const key = await pair.key;
            const value = await pair.value;
            syncPairs.push({
              key,
              value,
              alwaysSet: pair.alwaysSet
            });
          }
          return syncPairs;
        }).then((syncPairs) => {
          return parseUtil_js_1.ParseStatus.mergeObjectSync(status, syncPairs);
        });
      } else {
        return parseUtil_js_1.ParseStatus.mergeObjectSync(status, pairs);
      }
    }
    get shape() {
      return this._def.shape();
    }
    strict(message) {
      errorUtil_js_1.errorUtil.errToObj;
      return new ZodObject({
        ...this._def,
        unknownKeys: "strict",
        ...message !== void 0 ? {
          errorMap: (issue, ctx) => {
            const defaultError = this._def.errorMap?.(issue, ctx).message ?? ctx.defaultError;
            if (issue.code === "unrecognized_keys")
              return {
                message: errorUtil_js_1.errorUtil.errToObj(message).message ?? defaultError
              };
            return {
              message: defaultError
            };
          }
        } : {}
      });
    }
    strip() {
      return new ZodObject({
        ...this._def,
        unknownKeys: "strip"
      });
    }
    passthrough() {
      return new ZodObject({
        ...this._def,
        unknownKeys: "passthrough"
      });
    }
    // const AugmentFactory =
    //   <Def extends ZodObjectDef>(def: Def) =>
    //   <Augmentation extends ZodRawShape>(
    //     augmentation: Augmentation
    //   ): ZodObject<
    //     extendShape<ReturnType<Def["shape"]>, Augmentation>,
    //     Def["unknownKeys"],
    //     Def["catchall"]
    //   > => {
    //     return new ZodObject({
    //       ...def,
    //       shape: () => ({
    //         ...def.shape(),
    //         ...augmentation,
    //       }),
    //     }) as any;
    //   };
    extend(augmentation) {
      return new ZodObject({
        ...this._def,
        shape: () => ({
          ...this._def.shape(),
          ...augmentation
        })
      });
    }
    /**
     * Prior to zod@1.0.12 there was a bug in the
     * inferred type of merged objects. Please
     * upgrade if you are experiencing issues.
     */
    merge(merging) {
      const merged = new ZodObject({
        unknownKeys: merging._def.unknownKeys,
        catchall: merging._def.catchall,
        shape: () => ({
          ...this._def.shape(),
          ...merging._def.shape()
        }),
        typeName: ZodFirstPartyTypeKind.ZodObject
      });
      return merged;
    }
    // merge<
    //   Incoming extends AnyZodObject,
    //   Augmentation extends Incoming["shape"],
    //   NewOutput extends {
    //     [k in keyof Augmentation | keyof Output]: k extends keyof Augmentation
    //       ? Augmentation[k]["_output"]
    //       : k extends keyof Output
    //       ? Output[k]
    //       : never;
    //   },
    //   NewInput extends {
    //     [k in keyof Augmentation | keyof Input]: k extends keyof Augmentation
    //       ? Augmentation[k]["_input"]
    //       : k extends keyof Input
    //       ? Input[k]
    //       : never;
    //   }
    // >(
    //   merging: Incoming
    // ): ZodObject<
    //   extendShape<T, ReturnType<Incoming["_def"]["shape"]>>,
    //   Incoming["_def"]["unknownKeys"],
    //   Incoming["_def"]["catchall"],
    //   NewOutput,
    //   NewInput
    // > {
    //   const merged: any = new ZodObject({
    //     unknownKeys: merging._def.unknownKeys,
    //     catchall: merging._def.catchall,
    //     shape: () =>
    //       objectUtil.mergeShapes(this._def.shape(), merging._def.shape()),
    //     typeName: ZodFirstPartyTypeKind.ZodObject,
    //   }) as any;
    //   return merged;
    // }
    setKey(key, schema) {
      return this.augment({ [key]: schema });
    }
    // merge<Incoming extends AnyZodObject>(
    //   merging: Incoming
    // ): //ZodObject<T & Incoming["_shape"], UnknownKeys, Catchall> = (merging) => {
    // ZodObject<
    //   extendShape<T, ReturnType<Incoming["_def"]["shape"]>>,
    //   Incoming["_def"]["unknownKeys"],
    //   Incoming["_def"]["catchall"]
    // > {
    //   // const mergedShape = objectUtil.mergeShapes(
    //   //   this._def.shape(),
    //   //   merging._def.shape()
    //   // );
    //   const merged: any = new ZodObject({
    //     unknownKeys: merging._def.unknownKeys,
    //     catchall: merging._def.catchall,
    //     shape: () =>
    //       objectUtil.mergeShapes(this._def.shape(), merging._def.shape()),
    //     typeName: ZodFirstPartyTypeKind.ZodObject,
    //   }) as any;
    //   return merged;
    // }
    catchall(index) {
      return new ZodObject({
        ...this._def,
        catchall: index
      });
    }
    pick(mask) {
      const shape = {};
      for (const key of util_js_1.util.objectKeys(mask)) {
        if (mask[key] && this.shape[key]) {
          shape[key] = this.shape[key];
        }
      }
      return new ZodObject({
        ...this._def,
        shape: () => shape
      });
    }
    omit(mask) {
      const shape = {};
      for (const key of util_js_1.util.objectKeys(this.shape)) {
        if (!mask[key]) {
          shape[key] = this.shape[key];
        }
      }
      return new ZodObject({
        ...this._def,
        shape: () => shape
      });
    }
    /**
     * @deprecated
     */
    deepPartial() {
      return deepPartialify(this);
    }
    partial(mask) {
      const newShape = {};
      for (const key of util_js_1.util.objectKeys(this.shape)) {
        const fieldSchema = this.shape[key];
        if (mask && !mask[key]) {
          newShape[key] = fieldSchema;
        } else {
          newShape[key] = fieldSchema.optional();
        }
      }
      return new ZodObject({
        ...this._def,
        shape: () => newShape
      });
    }
    required(mask) {
      const newShape = {};
      for (const key of util_js_1.util.objectKeys(this.shape)) {
        if (mask && !mask[key]) {
          newShape[key] = this.shape[key];
        } else {
          const fieldSchema = this.shape[key];
          let newField = fieldSchema;
          while (newField instanceof ZodOptional) {
            newField = newField._def.innerType;
          }
          newShape[key] = newField;
        }
      }
      return new ZodObject({
        ...this._def,
        shape: () => newShape
      });
    }
    keyof() {
      return createZodEnum(util_js_1.util.objectKeys(this.shape));
    }
  }
  types.ZodObject = ZodObject;
  ZodObject.create = (shape, params) => {
    return new ZodObject({
      shape: () => shape,
      unknownKeys: "strip",
      catchall: ZodNever.create(),
      typeName: ZodFirstPartyTypeKind.ZodObject,
      ...processCreateParams(params)
    });
  };
  ZodObject.strictCreate = (shape, params) => {
    return new ZodObject({
      shape: () => shape,
      unknownKeys: "strict",
      catchall: ZodNever.create(),
      typeName: ZodFirstPartyTypeKind.ZodObject,
      ...processCreateParams(params)
    });
  };
  ZodObject.lazycreate = (shape, params) => {
    return new ZodObject({
      shape,
      unknownKeys: "strip",
      catchall: ZodNever.create(),
      typeName: ZodFirstPartyTypeKind.ZodObject,
      ...processCreateParams(params)
    });
  };
  class ZodUnion extends ZodType {
    _parse(input) {
      const { ctx } = this._processInputParams(input);
      const options = this._def.options;
      function handleResults(results) {
        for (const result of results) {
          if (result.result.status === "valid") {
            return result.result;
          }
        }
        for (const result of results) {
          if (result.result.status === "dirty") {
            ctx.common.issues.push(...result.ctx.common.issues);
            return result.result;
          }
        }
        const unionErrors = results.map((result) => new ZodError_js_1.ZodError(result.ctx.common.issues));
        (0, parseUtil_js_1.addIssueToContext)(ctx, {
          code: ZodError_js_1.ZodIssueCode.invalid_union,
          unionErrors
        });
        return parseUtil_js_1.INVALID;
      }
      if (ctx.common.async) {
        return Promise.all(options.map(async (option) => {
          const childCtx = {
            ...ctx,
            common: {
              ...ctx.common,
              issues: []
            },
            parent: null
          };
          return {
            result: await option._parseAsync({
              data: ctx.data,
              path: ctx.path,
              parent: childCtx
            }),
            ctx: childCtx
          };
        })).then(handleResults);
      } else {
        let dirty = void 0;
        const issues = [];
        for (const option of options) {
          const childCtx = {
            ...ctx,
            common: {
              ...ctx.common,
              issues: []
            },
            parent: null
          };
          const result = option._parseSync({
            data: ctx.data,
            path: ctx.path,
            parent: childCtx
          });
          if (result.status === "valid") {
            return result;
          } else if (result.status === "dirty" && !dirty) {
            dirty = { result, ctx: childCtx };
          }
          if (childCtx.common.issues.length) {
            issues.push(childCtx.common.issues);
          }
        }
        if (dirty) {
          ctx.common.issues.push(...dirty.ctx.common.issues);
          return dirty.result;
        }
        const unionErrors = issues.map((issues2) => new ZodError_js_1.ZodError(issues2));
        (0, parseUtil_js_1.addIssueToContext)(ctx, {
          code: ZodError_js_1.ZodIssueCode.invalid_union,
          unionErrors
        });
        return parseUtil_js_1.INVALID;
      }
    }
    get options() {
      return this._def.options;
    }
  }
  types.ZodUnion = ZodUnion;
  ZodUnion.create = (types2, params) => {
    return new ZodUnion({
      options: types2,
      typeName: ZodFirstPartyTypeKind.ZodUnion,
      ...processCreateParams(params)
    });
  };
  const getDiscriminator = (type) => {
    if (type instanceof ZodLazy) {
      return getDiscriminator(type.schema);
    } else if (type instanceof ZodEffects) {
      return getDiscriminator(type.innerType());
    } else if (type instanceof ZodLiteral) {
      return [type.value];
    } else if (type instanceof ZodEnum) {
      return type.options;
    } else if (type instanceof ZodNativeEnum) {
      return util_js_1.util.objectValues(type.enum);
    } else if (type instanceof ZodDefault) {
      return getDiscriminator(type._def.innerType);
    } else if (type instanceof ZodUndefined) {
      return [void 0];
    } else if (type instanceof ZodNull) {
      return [null];
    } else if (type instanceof ZodOptional) {
      return [void 0, ...getDiscriminator(type.unwrap())];
    } else if (type instanceof ZodNullable) {
      return [null, ...getDiscriminator(type.unwrap())];
    } else if (type instanceof ZodBranded) {
      return getDiscriminator(type.unwrap());
    } else if (type instanceof ZodReadonly) {
      return getDiscriminator(type.unwrap());
    } else if (type instanceof ZodCatch) {
      return getDiscriminator(type._def.innerType);
    } else {
      return [];
    }
  };
  class ZodDiscriminatedUnion extends ZodType {
    _parse(input) {
      const { ctx } = this._processInputParams(input);
      if (ctx.parsedType !== util_js_1.ZodParsedType.object) {
        (0, parseUtil_js_1.addIssueToContext)(ctx, {
          code: ZodError_js_1.ZodIssueCode.invalid_type,
          expected: util_js_1.ZodParsedType.object,
          received: ctx.parsedType
        });
        return parseUtil_js_1.INVALID;
      }
      const discriminator = this.discriminator;
      const discriminatorValue = ctx.data[discriminator];
      const option = this.optionsMap.get(discriminatorValue);
      if (!option) {
        (0, parseUtil_js_1.addIssueToContext)(ctx, {
          code: ZodError_js_1.ZodIssueCode.invalid_union_discriminator,
          options: Array.from(this.optionsMap.keys()),
          path: [discriminator]
        });
        return parseUtil_js_1.INVALID;
      }
      if (ctx.common.async) {
        return option._parseAsync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        });
      } else {
        return option._parseSync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        });
      }
    }
    get discriminator() {
      return this._def.discriminator;
    }
    get options() {
      return this._def.options;
    }
    get optionsMap() {
      return this._def.optionsMap;
    }
    /**
     * The constructor of the discriminated union schema. Its behaviour is very similar to that of the normal z.union() constructor.
     * However, it only allows a union of objects, all of which need to share a discriminator property. This property must
     * have a different value for each object in the union.
     * @param discriminator the name of the discriminator property
     * @param types an array of object schemas
     * @param params
     */
    static create(discriminator, options, params) {
      const optionsMap = /* @__PURE__ */ new Map();
      for (const type of options) {
        const discriminatorValues = getDiscriminator(type.shape[discriminator]);
        if (!discriminatorValues.length) {
          throw new Error(`A discriminator value for key \`${discriminator}\` could not be extracted from all schema options`);
        }
        for (const value of discriminatorValues) {
          if (optionsMap.has(value)) {
            throw new Error(`Discriminator property ${String(discriminator)} has duplicate value ${String(value)}`);
          }
          optionsMap.set(value, type);
        }
      }
      return new ZodDiscriminatedUnion({
        typeName: ZodFirstPartyTypeKind.ZodDiscriminatedUnion,
        discriminator,
        options,
        optionsMap,
        ...processCreateParams(params)
      });
    }
  }
  types.ZodDiscriminatedUnion = ZodDiscriminatedUnion;
  function mergeValues(a, b) {
    const aType = (0, util_js_1.getParsedType)(a);
    const bType = (0, util_js_1.getParsedType)(b);
    if (a === b) {
      return { valid: true, data: a };
    } else if (aType === util_js_1.ZodParsedType.object && bType === util_js_1.ZodParsedType.object) {
      const bKeys = util_js_1.util.objectKeys(b);
      const sharedKeys = util_js_1.util.objectKeys(a).filter((key) => bKeys.indexOf(key) !== -1);
      const newObj = { ...a, ...b };
      for (const key of sharedKeys) {
        const sharedValue = mergeValues(a[key], b[key]);
        if (!sharedValue.valid) {
          return { valid: false };
        }
        newObj[key] = sharedValue.data;
      }
      return { valid: true, data: newObj };
    } else if (aType === util_js_1.ZodParsedType.array && bType === util_js_1.ZodParsedType.array) {
      if (a.length !== b.length) {
        return { valid: false };
      }
      const newArray = [];
      for (let index = 0; index < a.length; index++) {
        const itemA = a[index];
        const itemB = b[index];
        const sharedValue = mergeValues(itemA, itemB);
        if (!sharedValue.valid) {
          return { valid: false };
        }
        newArray.push(sharedValue.data);
      }
      return { valid: true, data: newArray };
    } else if (aType === util_js_1.ZodParsedType.date && bType === util_js_1.ZodParsedType.date && +a === +b) {
      return { valid: true, data: a };
    } else {
      return { valid: false };
    }
  }
  class ZodIntersection extends ZodType {
    _parse(input) {
      const { status, ctx } = this._processInputParams(input);
      const handleParsed = (parsedLeft, parsedRight) => {
        if ((0, parseUtil_js_1.isAborted)(parsedLeft) || (0, parseUtil_js_1.isAborted)(parsedRight)) {
          return parseUtil_js_1.INVALID;
        }
        const merged = mergeValues(parsedLeft.value, parsedRight.value);
        if (!merged.valid) {
          (0, parseUtil_js_1.addIssueToContext)(ctx, {
            code: ZodError_js_1.ZodIssueCode.invalid_intersection_types
          });
          return parseUtil_js_1.INVALID;
        }
        if ((0, parseUtil_js_1.isDirty)(parsedLeft) || (0, parseUtil_js_1.isDirty)(parsedRight)) {
          status.dirty();
        }
        return { status: status.value, value: merged.data };
      };
      if (ctx.common.async) {
        return Promise.all([
          this._def.left._parseAsync({
            data: ctx.data,
            path: ctx.path,
            parent: ctx
          }),
          this._def.right._parseAsync({
            data: ctx.data,
            path: ctx.path,
            parent: ctx
          })
        ]).then(([left, right]) => handleParsed(left, right));
      } else {
        return handleParsed(this._def.left._parseSync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        }), this._def.right._parseSync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        }));
      }
    }
  }
  types.ZodIntersection = ZodIntersection;
  ZodIntersection.create = (left, right, params) => {
    return new ZodIntersection({
      left,
      right,
      typeName: ZodFirstPartyTypeKind.ZodIntersection,
      ...processCreateParams(params)
    });
  };
  class ZodTuple extends ZodType {
    _parse(input) {
      const { status, ctx } = this._processInputParams(input);
      if (ctx.parsedType !== util_js_1.ZodParsedType.array) {
        (0, parseUtil_js_1.addIssueToContext)(ctx, {
          code: ZodError_js_1.ZodIssueCode.invalid_type,
          expected: util_js_1.ZodParsedType.array,
          received: ctx.parsedType
        });
        return parseUtil_js_1.INVALID;
      }
      if (ctx.data.length < this._def.items.length) {
        (0, parseUtil_js_1.addIssueToContext)(ctx, {
          code: ZodError_js_1.ZodIssueCode.too_small,
          minimum: this._def.items.length,
          inclusive: true,
          exact: false,
          type: "array"
        });
        return parseUtil_js_1.INVALID;
      }
      const rest = this._def.rest;
      if (!rest && ctx.data.length > this._def.items.length) {
        (0, parseUtil_js_1.addIssueToContext)(ctx, {
          code: ZodError_js_1.ZodIssueCode.too_big,
          maximum: this._def.items.length,
          inclusive: true,
          exact: false,
          type: "array"
        });
        status.dirty();
      }
      const items = [...ctx.data].map((item, itemIndex) => {
        const schema = this._def.items[itemIndex] || this._def.rest;
        if (!schema)
          return null;
        return schema._parse(new ParseInputLazyPath(ctx, item, ctx.path, itemIndex));
      }).filter((x) => !!x);
      if (ctx.common.async) {
        return Promise.all(items).then((results) => {
          return parseUtil_js_1.ParseStatus.mergeArray(status, results);
        });
      } else {
        return parseUtil_js_1.ParseStatus.mergeArray(status, items);
      }
    }
    get items() {
      return this._def.items;
    }
    rest(rest) {
      return new ZodTuple({
        ...this._def,
        rest
      });
    }
  }
  types.ZodTuple = ZodTuple;
  ZodTuple.create = (schemas2, params) => {
    if (!Array.isArray(schemas2)) {
      throw new Error("You must pass an array of schemas to z.tuple([ ... ])");
    }
    return new ZodTuple({
      items: schemas2,
      typeName: ZodFirstPartyTypeKind.ZodTuple,
      rest: null,
      ...processCreateParams(params)
    });
  };
  class ZodRecord extends ZodType {
    get keySchema() {
      return this._def.keyType;
    }
    get valueSchema() {
      return this._def.valueType;
    }
    _parse(input) {
      const { status, ctx } = this._processInputParams(input);
      if (ctx.parsedType !== util_js_1.ZodParsedType.object) {
        (0, parseUtil_js_1.addIssueToContext)(ctx, {
          code: ZodError_js_1.ZodIssueCode.invalid_type,
          expected: util_js_1.ZodParsedType.object,
          received: ctx.parsedType
        });
        return parseUtil_js_1.INVALID;
      }
      const pairs = [];
      const keyType = this._def.keyType;
      const valueType = this._def.valueType;
      for (const key in ctx.data) {
        pairs.push({
          key: keyType._parse(new ParseInputLazyPath(ctx, key, ctx.path, key)),
          value: valueType._parse(new ParseInputLazyPath(ctx, ctx.data[key], ctx.path, key)),
          alwaysSet: key in ctx.data
        });
      }
      if (ctx.common.async) {
        return parseUtil_js_1.ParseStatus.mergeObjectAsync(status, pairs);
      } else {
        return parseUtil_js_1.ParseStatus.mergeObjectSync(status, pairs);
      }
    }
    get element() {
      return this._def.valueType;
    }
    static create(first, second, third) {
      if (second instanceof ZodType) {
        return new ZodRecord({
          keyType: first,
          valueType: second,
          typeName: ZodFirstPartyTypeKind.ZodRecord,
          ...processCreateParams(third)
        });
      }
      return new ZodRecord({
        keyType: ZodString.create(),
        valueType: first,
        typeName: ZodFirstPartyTypeKind.ZodRecord,
        ...processCreateParams(second)
      });
    }
  }
  types.ZodRecord = ZodRecord;
  class ZodMap extends ZodType {
    get keySchema() {
      return this._def.keyType;
    }
    get valueSchema() {
      return this._def.valueType;
    }
    _parse(input) {
      const { status, ctx } = this._processInputParams(input);
      if (ctx.parsedType !== util_js_1.ZodParsedType.map) {
        (0, parseUtil_js_1.addIssueToContext)(ctx, {
          code: ZodError_js_1.ZodIssueCode.invalid_type,
          expected: util_js_1.ZodParsedType.map,
          received: ctx.parsedType
        });
        return parseUtil_js_1.INVALID;
      }
      const keyType = this._def.keyType;
      const valueType = this._def.valueType;
      const pairs = [...ctx.data.entries()].map(([key, value], index) => {
        return {
          key: keyType._parse(new ParseInputLazyPath(ctx, key, ctx.path, [index, "key"])),
          value: valueType._parse(new ParseInputLazyPath(ctx, value, ctx.path, [index, "value"]))
        };
      });
      if (ctx.common.async) {
        const finalMap = /* @__PURE__ */ new Map();
        return Promise.resolve().then(async () => {
          for (const pair of pairs) {
            const key = await pair.key;
            const value = await pair.value;
            if (key.status === "aborted" || value.status === "aborted") {
              return parseUtil_js_1.INVALID;
            }
            if (key.status === "dirty" || value.status === "dirty") {
              status.dirty();
            }
            finalMap.set(key.value, value.value);
          }
          return { status: status.value, value: finalMap };
        });
      } else {
        const finalMap = /* @__PURE__ */ new Map();
        for (const pair of pairs) {
          const key = pair.key;
          const value = pair.value;
          if (key.status === "aborted" || value.status === "aborted") {
            return parseUtil_js_1.INVALID;
          }
          if (key.status === "dirty" || value.status === "dirty") {
            status.dirty();
          }
          finalMap.set(key.value, value.value);
        }
        return { status: status.value, value: finalMap };
      }
    }
  }
  types.ZodMap = ZodMap;
  ZodMap.create = (keyType, valueType, params) => {
    return new ZodMap({
      valueType,
      keyType,
      typeName: ZodFirstPartyTypeKind.ZodMap,
      ...processCreateParams(params)
    });
  };
  class ZodSet extends ZodType {
    _parse(input) {
      const { status, ctx } = this._processInputParams(input);
      if (ctx.parsedType !== util_js_1.ZodParsedType.set) {
        (0, parseUtil_js_1.addIssueToContext)(ctx, {
          code: ZodError_js_1.ZodIssueCode.invalid_type,
          expected: util_js_1.ZodParsedType.set,
          received: ctx.parsedType
        });
        return parseUtil_js_1.INVALID;
      }
      const def = this._def;
      if (def.minSize !== null) {
        if (ctx.data.size < def.minSize.value) {
          (0, parseUtil_js_1.addIssueToContext)(ctx, {
            code: ZodError_js_1.ZodIssueCode.too_small,
            minimum: def.minSize.value,
            type: "set",
            inclusive: true,
            exact: false,
            message: def.minSize.message
          });
          status.dirty();
        }
      }
      if (def.maxSize !== null) {
        if (ctx.data.size > def.maxSize.value) {
          (0, parseUtil_js_1.addIssueToContext)(ctx, {
            code: ZodError_js_1.ZodIssueCode.too_big,
            maximum: def.maxSize.value,
            type: "set",
            inclusive: true,
            exact: false,
            message: def.maxSize.message
          });
          status.dirty();
        }
      }
      const valueType = this._def.valueType;
      function finalizeSet(elements2) {
        const parsedSet = /* @__PURE__ */ new Set();
        for (const element of elements2) {
          if (element.status === "aborted")
            return parseUtil_js_1.INVALID;
          if (element.status === "dirty")
            status.dirty();
          parsedSet.add(element.value);
        }
        return { status: status.value, value: parsedSet };
      }
      const elements = [...ctx.data.values()].map((item, i) => valueType._parse(new ParseInputLazyPath(ctx, item, ctx.path, i)));
      if (ctx.common.async) {
        return Promise.all(elements).then((elements2) => finalizeSet(elements2));
      } else {
        return finalizeSet(elements);
      }
    }
    min(minSize, message) {
      return new ZodSet({
        ...this._def,
        minSize: { value: minSize, message: errorUtil_js_1.errorUtil.toString(message) }
      });
    }
    max(maxSize, message) {
      return new ZodSet({
        ...this._def,
        maxSize: { value: maxSize, message: errorUtil_js_1.errorUtil.toString(message) }
      });
    }
    size(size, message) {
      return this.min(size, message).max(size, message);
    }
    nonempty(message) {
      return this.min(1, message);
    }
  }
  types.ZodSet = ZodSet;
  ZodSet.create = (valueType, params) => {
    return new ZodSet({
      valueType,
      minSize: null,
      maxSize: null,
      typeName: ZodFirstPartyTypeKind.ZodSet,
      ...processCreateParams(params)
    });
  };
  class ZodFunction extends ZodType {
    constructor() {
      super(...arguments);
      this.validate = this.implement;
    }
    _parse(input) {
      const { ctx } = this._processInputParams(input);
      if (ctx.parsedType !== util_js_1.ZodParsedType.function) {
        (0, parseUtil_js_1.addIssueToContext)(ctx, {
          code: ZodError_js_1.ZodIssueCode.invalid_type,
          expected: util_js_1.ZodParsedType.function,
          received: ctx.parsedType
        });
        return parseUtil_js_1.INVALID;
      }
      function makeArgsIssue(args, error) {
        return (0, parseUtil_js_1.makeIssue)({
          data: args,
          path: ctx.path,
          errorMaps: [ctx.common.contextualErrorMap, ctx.schemaErrorMap, (0, errors_js_1.getErrorMap)(), errors_js_1.defaultErrorMap].filter((x) => !!x),
          issueData: {
            code: ZodError_js_1.ZodIssueCode.invalid_arguments,
            argumentsError: error
          }
        });
      }
      function makeReturnsIssue(returns, error) {
        return (0, parseUtil_js_1.makeIssue)({
          data: returns,
          path: ctx.path,
          errorMaps: [ctx.common.contextualErrorMap, ctx.schemaErrorMap, (0, errors_js_1.getErrorMap)(), errors_js_1.defaultErrorMap].filter((x) => !!x),
          issueData: {
            code: ZodError_js_1.ZodIssueCode.invalid_return_type,
            returnTypeError: error
          }
        });
      }
      const params = { errorMap: ctx.common.contextualErrorMap };
      const fn = ctx.data;
      if (this._def.returns instanceof ZodPromise) {
        const me = this;
        return (0, parseUtil_js_1.OK)(async function(...args) {
          const error = new ZodError_js_1.ZodError([]);
          const parsedArgs = await me._def.args.parseAsync(args, params).catch((e) => {
            error.addIssue(makeArgsIssue(args, e));
            throw error;
          });
          const result = await Reflect.apply(fn, this, parsedArgs);
          const parsedReturns = await me._def.returns._def.type.parseAsync(result, params).catch((e) => {
            error.addIssue(makeReturnsIssue(result, e));
            throw error;
          });
          return parsedReturns;
        });
      } else {
        const me = this;
        return (0, parseUtil_js_1.OK)(function(...args) {
          const parsedArgs = me._def.args.safeParse(args, params);
          if (!parsedArgs.success) {
            throw new ZodError_js_1.ZodError([makeArgsIssue(args, parsedArgs.error)]);
          }
          const result = Reflect.apply(fn, this, parsedArgs.data);
          const parsedReturns = me._def.returns.safeParse(result, params);
          if (!parsedReturns.success) {
            throw new ZodError_js_1.ZodError([makeReturnsIssue(result, parsedReturns.error)]);
          }
          return parsedReturns.data;
        });
      }
    }
    parameters() {
      return this._def.args;
    }
    returnType() {
      return this._def.returns;
    }
    args(...items) {
      return new ZodFunction({
        ...this._def,
        args: ZodTuple.create(items).rest(ZodUnknown.create())
      });
    }
    returns(returnType) {
      return new ZodFunction({
        ...this._def,
        returns: returnType
      });
    }
    implement(func) {
      const validatedFunc = this.parse(func);
      return validatedFunc;
    }
    strictImplement(func) {
      const validatedFunc = this.parse(func);
      return validatedFunc;
    }
    static create(args, returns, params) {
      return new ZodFunction({
        args: args ? args : ZodTuple.create([]).rest(ZodUnknown.create()),
        returns: returns || ZodUnknown.create(),
        typeName: ZodFirstPartyTypeKind.ZodFunction,
        ...processCreateParams(params)
      });
    }
  }
  types.ZodFunction = ZodFunction;
  class ZodLazy extends ZodType {
    get schema() {
      return this._def.getter();
    }
    _parse(input) {
      const { ctx } = this._processInputParams(input);
      const lazySchema = this._def.getter();
      return lazySchema._parse({ data: ctx.data, path: ctx.path, parent: ctx });
    }
  }
  types.ZodLazy = ZodLazy;
  ZodLazy.create = (getter, params) => {
    return new ZodLazy({
      getter,
      typeName: ZodFirstPartyTypeKind.ZodLazy,
      ...processCreateParams(params)
    });
  };
  class ZodLiteral extends ZodType {
    _parse(input) {
      if (input.data !== this._def.value) {
        const ctx = this._getOrReturnCtx(input);
        (0, parseUtil_js_1.addIssueToContext)(ctx, {
          received: ctx.data,
          code: ZodError_js_1.ZodIssueCode.invalid_literal,
          expected: this._def.value
        });
        return parseUtil_js_1.INVALID;
      }
      return { status: "valid", value: input.data };
    }
    get value() {
      return this._def.value;
    }
  }
  types.ZodLiteral = ZodLiteral;
  ZodLiteral.create = (value, params) => {
    return new ZodLiteral({
      value,
      typeName: ZodFirstPartyTypeKind.ZodLiteral,
      ...processCreateParams(params)
    });
  };
  function createZodEnum(values, params) {
    return new ZodEnum({
      values,
      typeName: ZodFirstPartyTypeKind.ZodEnum,
      ...processCreateParams(params)
    });
  }
  class ZodEnum extends ZodType {
    _parse(input) {
      if (typeof input.data !== "string") {
        const ctx = this._getOrReturnCtx(input);
        const expectedValues = this._def.values;
        (0, parseUtil_js_1.addIssueToContext)(ctx, {
          expected: util_js_1.util.joinValues(expectedValues),
          received: ctx.parsedType,
          code: ZodError_js_1.ZodIssueCode.invalid_type
        });
        return parseUtil_js_1.INVALID;
      }
      if (!this._cache) {
        this._cache = new Set(this._def.values);
      }
      if (!this._cache.has(input.data)) {
        const ctx = this._getOrReturnCtx(input);
        const expectedValues = this._def.values;
        (0, parseUtil_js_1.addIssueToContext)(ctx, {
          received: ctx.data,
          code: ZodError_js_1.ZodIssueCode.invalid_enum_value,
          options: expectedValues
        });
        return parseUtil_js_1.INVALID;
      }
      return (0, parseUtil_js_1.OK)(input.data);
    }
    get options() {
      return this._def.values;
    }
    get enum() {
      const enumValues = {};
      for (const val of this._def.values) {
        enumValues[val] = val;
      }
      return enumValues;
    }
    get Values() {
      const enumValues = {};
      for (const val of this._def.values) {
        enumValues[val] = val;
      }
      return enumValues;
    }
    get Enum() {
      const enumValues = {};
      for (const val of this._def.values) {
        enumValues[val] = val;
      }
      return enumValues;
    }
    extract(values, newDef = this._def) {
      return ZodEnum.create(values, {
        ...this._def,
        ...newDef
      });
    }
    exclude(values, newDef = this._def) {
      return ZodEnum.create(this.options.filter((opt) => !values.includes(opt)), {
        ...this._def,
        ...newDef
      });
    }
  }
  types.ZodEnum = ZodEnum;
  ZodEnum.create = createZodEnum;
  class ZodNativeEnum extends ZodType {
    _parse(input) {
      const nativeEnumValues = util_js_1.util.getValidEnumValues(this._def.values);
      const ctx = this._getOrReturnCtx(input);
      if (ctx.parsedType !== util_js_1.ZodParsedType.string && ctx.parsedType !== util_js_1.ZodParsedType.number) {
        const expectedValues = util_js_1.util.objectValues(nativeEnumValues);
        (0, parseUtil_js_1.addIssueToContext)(ctx, {
          expected: util_js_1.util.joinValues(expectedValues),
          received: ctx.parsedType,
          code: ZodError_js_1.ZodIssueCode.invalid_type
        });
        return parseUtil_js_1.INVALID;
      }
      if (!this._cache) {
        this._cache = new Set(util_js_1.util.getValidEnumValues(this._def.values));
      }
      if (!this._cache.has(input.data)) {
        const expectedValues = util_js_1.util.objectValues(nativeEnumValues);
        (0, parseUtil_js_1.addIssueToContext)(ctx, {
          received: ctx.data,
          code: ZodError_js_1.ZodIssueCode.invalid_enum_value,
          options: expectedValues
        });
        return parseUtil_js_1.INVALID;
      }
      return (0, parseUtil_js_1.OK)(input.data);
    }
    get enum() {
      return this._def.values;
    }
  }
  types.ZodNativeEnum = ZodNativeEnum;
  ZodNativeEnum.create = (values, params) => {
    return new ZodNativeEnum({
      values,
      typeName: ZodFirstPartyTypeKind.ZodNativeEnum,
      ...processCreateParams(params)
    });
  };
  class ZodPromise extends ZodType {
    unwrap() {
      return this._def.type;
    }
    _parse(input) {
      const { ctx } = this._processInputParams(input);
      if (ctx.parsedType !== util_js_1.ZodParsedType.promise && ctx.common.async === false) {
        (0, parseUtil_js_1.addIssueToContext)(ctx, {
          code: ZodError_js_1.ZodIssueCode.invalid_type,
          expected: util_js_1.ZodParsedType.promise,
          received: ctx.parsedType
        });
        return parseUtil_js_1.INVALID;
      }
      const promisified = ctx.parsedType === util_js_1.ZodParsedType.promise ? ctx.data : Promise.resolve(ctx.data);
      return (0, parseUtil_js_1.OK)(promisified.then((data) => {
        return this._def.type.parseAsync(data, {
          path: ctx.path,
          errorMap: ctx.common.contextualErrorMap
        });
      }));
    }
  }
  types.ZodPromise = ZodPromise;
  ZodPromise.create = (schema, params) => {
    return new ZodPromise({
      type: schema,
      typeName: ZodFirstPartyTypeKind.ZodPromise,
      ...processCreateParams(params)
    });
  };
  class ZodEffects extends ZodType {
    innerType() {
      return this._def.schema;
    }
    sourceType() {
      return this._def.schema._def.typeName === ZodFirstPartyTypeKind.ZodEffects ? this._def.schema.sourceType() : this._def.schema;
    }
    _parse(input) {
      const { status, ctx } = this._processInputParams(input);
      const effect = this._def.effect || null;
      const checkCtx = {
        addIssue: (arg) => {
          (0, parseUtil_js_1.addIssueToContext)(ctx, arg);
          if (arg.fatal) {
            status.abort();
          } else {
            status.dirty();
          }
        },
        get path() {
          return ctx.path;
        }
      };
      checkCtx.addIssue = checkCtx.addIssue.bind(checkCtx);
      if (effect.type === "preprocess") {
        const processed = effect.transform(ctx.data, checkCtx);
        if (ctx.common.async) {
          return Promise.resolve(processed).then(async (processed2) => {
            if (status.value === "aborted")
              return parseUtil_js_1.INVALID;
            const result = await this._def.schema._parseAsync({
              data: processed2,
              path: ctx.path,
              parent: ctx
            });
            if (result.status === "aborted")
              return parseUtil_js_1.INVALID;
            if (result.status === "dirty")
              return (0, parseUtil_js_1.DIRTY)(result.value);
            if (status.value === "dirty")
              return (0, parseUtil_js_1.DIRTY)(result.value);
            return result;
          });
        } else {
          if (status.value === "aborted")
            return parseUtil_js_1.INVALID;
          const result = this._def.schema._parseSync({
            data: processed,
            path: ctx.path,
            parent: ctx
          });
          if (result.status === "aborted")
            return parseUtil_js_1.INVALID;
          if (result.status === "dirty")
            return (0, parseUtil_js_1.DIRTY)(result.value);
          if (status.value === "dirty")
            return (0, parseUtil_js_1.DIRTY)(result.value);
          return result;
        }
      }
      if (effect.type === "refinement") {
        const executeRefinement = (acc) => {
          const result = effect.refinement(acc, checkCtx);
          if (ctx.common.async) {
            return Promise.resolve(result);
          }
          if (result instanceof Promise) {
            throw new Error("Async refinement encountered during synchronous parse operation. Use .parseAsync instead.");
          }
          return acc;
        };
        if (ctx.common.async === false) {
          const inner = this._def.schema._parseSync({
            data: ctx.data,
            path: ctx.path,
            parent: ctx
          });
          if (inner.status === "aborted")
            return parseUtil_js_1.INVALID;
          if (inner.status === "dirty")
            status.dirty();
          executeRefinement(inner.value);
          return { status: status.value, value: inner.value };
        } else {
          return this._def.schema._parseAsync({ data: ctx.data, path: ctx.path, parent: ctx }).then((inner) => {
            if (inner.status === "aborted")
              return parseUtil_js_1.INVALID;
            if (inner.status === "dirty")
              status.dirty();
            return executeRefinement(inner.value).then(() => {
              return { status: status.value, value: inner.value };
            });
          });
        }
      }
      if (effect.type === "transform") {
        if (ctx.common.async === false) {
          const base = this._def.schema._parseSync({
            data: ctx.data,
            path: ctx.path,
            parent: ctx
          });
          if (!(0, parseUtil_js_1.isValid)(base))
            return parseUtil_js_1.INVALID;
          const result = effect.transform(base.value, checkCtx);
          if (result instanceof Promise) {
            throw new Error(`Asynchronous transform encountered during synchronous parse operation. Use .parseAsync instead.`);
          }
          return { status: status.value, value: result };
        } else {
          return this._def.schema._parseAsync({ data: ctx.data, path: ctx.path, parent: ctx }).then((base) => {
            if (!(0, parseUtil_js_1.isValid)(base))
              return parseUtil_js_1.INVALID;
            return Promise.resolve(effect.transform(base.value, checkCtx)).then((result) => ({
              status: status.value,
              value: result
            }));
          });
        }
      }
      util_js_1.util.assertNever(effect);
    }
  }
  types.ZodEffects = ZodEffects;
  types.ZodTransformer = ZodEffects;
  ZodEffects.create = (schema, effect, params) => {
    return new ZodEffects({
      schema,
      typeName: ZodFirstPartyTypeKind.ZodEffects,
      effect,
      ...processCreateParams(params)
    });
  };
  ZodEffects.createWithPreprocess = (preprocess, schema, params) => {
    return new ZodEffects({
      schema,
      effect: { type: "preprocess", transform: preprocess },
      typeName: ZodFirstPartyTypeKind.ZodEffects,
      ...processCreateParams(params)
    });
  };
  class ZodOptional extends ZodType {
    _parse(input) {
      const parsedType = this._getType(input);
      if (parsedType === util_js_1.ZodParsedType.undefined) {
        return (0, parseUtil_js_1.OK)(void 0);
      }
      return this._def.innerType._parse(input);
    }
    unwrap() {
      return this._def.innerType;
    }
  }
  types.ZodOptional = ZodOptional;
  ZodOptional.create = (type, params) => {
    return new ZodOptional({
      innerType: type,
      typeName: ZodFirstPartyTypeKind.ZodOptional,
      ...processCreateParams(params)
    });
  };
  class ZodNullable extends ZodType {
    _parse(input) {
      const parsedType = this._getType(input);
      if (parsedType === util_js_1.ZodParsedType.null) {
        return (0, parseUtil_js_1.OK)(null);
      }
      return this._def.innerType._parse(input);
    }
    unwrap() {
      return this._def.innerType;
    }
  }
  types.ZodNullable = ZodNullable;
  ZodNullable.create = (type, params) => {
    return new ZodNullable({
      innerType: type,
      typeName: ZodFirstPartyTypeKind.ZodNullable,
      ...processCreateParams(params)
    });
  };
  class ZodDefault extends ZodType {
    _parse(input) {
      const { ctx } = this._processInputParams(input);
      let data = ctx.data;
      if (ctx.parsedType === util_js_1.ZodParsedType.undefined) {
        data = this._def.defaultValue();
      }
      return this._def.innerType._parse({
        data,
        path: ctx.path,
        parent: ctx
      });
    }
    removeDefault() {
      return this._def.innerType;
    }
  }
  types.ZodDefault = ZodDefault;
  ZodDefault.create = (type, params) => {
    return new ZodDefault({
      innerType: type,
      typeName: ZodFirstPartyTypeKind.ZodDefault,
      defaultValue: typeof params.default === "function" ? params.default : () => params.default,
      ...processCreateParams(params)
    });
  };
  class ZodCatch extends ZodType {
    _parse(input) {
      const { ctx } = this._processInputParams(input);
      const newCtx = {
        ...ctx,
        common: {
          ...ctx.common,
          issues: []
        }
      };
      const result = this._def.innerType._parse({
        data: newCtx.data,
        path: newCtx.path,
        parent: {
          ...newCtx
        }
      });
      if ((0, parseUtil_js_1.isAsync)(result)) {
        return result.then((result2) => {
          return {
            status: "valid",
            value: result2.status === "valid" ? result2.value : this._def.catchValue({
              get error() {
                return new ZodError_js_1.ZodError(newCtx.common.issues);
              },
              input: newCtx.data
            })
          };
        });
      } else {
        return {
          status: "valid",
          value: result.status === "valid" ? result.value : this._def.catchValue({
            get error() {
              return new ZodError_js_1.ZodError(newCtx.common.issues);
            },
            input: newCtx.data
          })
        };
      }
    }
    removeCatch() {
      return this._def.innerType;
    }
  }
  types.ZodCatch = ZodCatch;
  ZodCatch.create = (type, params) => {
    return new ZodCatch({
      innerType: type,
      typeName: ZodFirstPartyTypeKind.ZodCatch,
      catchValue: typeof params.catch === "function" ? params.catch : () => params.catch,
      ...processCreateParams(params)
    });
  };
  class ZodNaN extends ZodType {
    _parse(input) {
      const parsedType = this._getType(input);
      if (parsedType !== util_js_1.ZodParsedType.nan) {
        const ctx = this._getOrReturnCtx(input);
        (0, parseUtil_js_1.addIssueToContext)(ctx, {
          code: ZodError_js_1.ZodIssueCode.invalid_type,
          expected: util_js_1.ZodParsedType.nan,
          received: ctx.parsedType
        });
        return parseUtil_js_1.INVALID;
      }
      return { status: "valid", value: input.data };
    }
  }
  types.ZodNaN = ZodNaN;
  ZodNaN.create = (params) => {
    return new ZodNaN({
      typeName: ZodFirstPartyTypeKind.ZodNaN,
      ...processCreateParams(params)
    });
  };
  types.BRAND = /* @__PURE__ */ Symbol("zod_brand");
  class ZodBranded extends ZodType {
    _parse(input) {
      const { ctx } = this._processInputParams(input);
      const data = ctx.data;
      return this._def.type._parse({
        data,
        path: ctx.path,
        parent: ctx
      });
    }
    unwrap() {
      return this._def.type;
    }
  }
  types.ZodBranded = ZodBranded;
  class ZodPipeline extends ZodType {
    _parse(input) {
      const { status, ctx } = this._processInputParams(input);
      if (ctx.common.async) {
        const handleAsync = async () => {
          const inResult = await this._def.in._parseAsync({
            data: ctx.data,
            path: ctx.path,
            parent: ctx
          });
          if (inResult.status === "aborted")
            return parseUtil_js_1.INVALID;
          if (inResult.status === "dirty") {
            status.dirty();
            return (0, parseUtil_js_1.DIRTY)(inResult.value);
          } else {
            return this._def.out._parseAsync({
              data: inResult.value,
              path: ctx.path,
              parent: ctx
            });
          }
        };
        return handleAsync();
      } else {
        const inResult = this._def.in._parseSync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        });
        if (inResult.status === "aborted")
          return parseUtil_js_1.INVALID;
        if (inResult.status === "dirty") {
          status.dirty();
          return {
            status: "dirty",
            value: inResult.value
          };
        } else {
          return this._def.out._parseSync({
            data: inResult.value,
            path: ctx.path,
            parent: ctx
          });
        }
      }
    }
    static create(a, b) {
      return new ZodPipeline({
        in: a,
        out: b,
        typeName: ZodFirstPartyTypeKind.ZodPipeline
      });
    }
  }
  types.ZodPipeline = ZodPipeline;
  class ZodReadonly extends ZodType {
    _parse(input) {
      const result = this._def.innerType._parse(input);
      const freeze = (data) => {
        if ((0, parseUtil_js_1.isValid)(data)) {
          data.value = Object.freeze(data.value);
        }
        return data;
      };
      return (0, parseUtil_js_1.isAsync)(result) ? result.then((data) => freeze(data)) : freeze(result);
    }
    unwrap() {
      return this._def.innerType;
    }
  }
  types.ZodReadonly = ZodReadonly;
  ZodReadonly.create = (type, params) => {
    return new ZodReadonly({
      innerType: type,
      typeName: ZodFirstPartyTypeKind.ZodReadonly,
      ...processCreateParams(params)
    });
  };
  function cleanParams(params, data) {
    const p = typeof params === "function" ? params(data) : typeof params === "string" ? { message: params } : params;
    const p2 = typeof p === "string" ? { message: p } : p;
    return p2;
  }
  function custom(check, _params = {}, fatal) {
    if (check)
      return ZodAny.create().superRefine((data, ctx) => {
        const r = check(data);
        if (r instanceof Promise) {
          return r.then((r2) => {
            if (!r2) {
              const params = cleanParams(_params, data);
              const _fatal = params.fatal ?? fatal ?? true;
              ctx.addIssue({ code: "custom", ...params, fatal: _fatal });
            }
          });
        }
        if (!r) {
          const params = cleanParams(_params, data);
          const _fatal = params.fatal ?? fatal ?? true;
          ctx.addIssue({ code: "custom", ...params, fatal: _fatal });
        }
        return;
      });
    return ZodAny.create();
  }
  types.late = {
    object: ZodObject.lazycreate
  };
  var ZodFirstPartyTypeKind;
  (function(ZodFirstPartyTypeKind2) {
    ZodFirstPartyTypeKind2["ZodString"] = "ZodString";
    ZodFirstPartyTypeKind2["ZodNumber"] = "ZodNumber";
    ZodFirstPartyTypeKind2["ZodNaN"] = "ZodNaN";
    ZodFirstPartyTypeKind2["ZodBigInt"] = "ZodBigInt";
    ZodFirstPartyTypeKind2["ZodBoolean"] = "ZodBoolean";
    ZodFirstPartyTypeKind2["ZodDate"] = "ZodDate";
    ZodFirstPartyTypeKind2["ZodSymbol"] = "ZodSymbol";
    ZodFirstPartyTypeKind2["ZodUndefined"] = "ZodUndefined";
    ZodFirstPartyTypeKind2["ZodNull"] = "ZodNull";
    ZodFirstPartyTypeKind2["ZodAny"] = "ZodAny";
    ZodFirstPartyTypeKind2["ZodUnknown"] = "ZodUnknown";
    ZodFirstPartyTypeKind2["ZodNever"] = "ZodNever";
    ZodFirstPartyTypeKind2["ZodVoid"] = "ZodVoid";
    ZodFirstPartyTypeKind2["ZodArray"] = "ZodArray";
    ZodFirstPartyTypeKind2["ZodObject"] = "ZodObject";
    ZodFirstPartyTypeKind2["ZodUnion"] = "ZodUnion";
    ZodFirstPartyTypeKind2["ZodDiscriminatedUnion"] = "ZodDiscriminatedUnion";
    ZodFirstPartyTypeKind2["ZodIntersection"] = "ZodIntersection";
    ZodFirstPartyTypeKind2["ZodTuple"] = "ZodTuple";
    ZodFirstPartyTypeKind2["ZodRecord"] = "ZodRecord";
    ZodFirstPartyTypeKind2["ZodMap"] = "ZodMap";
    ZodFirstPartyTypeKind2["ZodSet"] = "ZodSet";
    ZodFirstPartyTypeKind2["ZodFunction"] = "ZodFunction";
    ZodFirstPartyTypeKind2["ZodLazy"] = "ZodLazy";
    ZodFirstPartyTypeKind2["ZodLiteral"] = "ZodLiteral";
    ZodFirstPartyTypeKind2["ZodEnum"] = "ZodEnum";
    ZodFirstPartyTypeKind2["ZodEffects"] = "ZodEffects";
    ZodFirstPartyTypeKind2["ZodNativeEnum"] = "ZodNativeEnum";
    ZodFirstPartyTypeKind2["ZodOptional"] = "ZodOptional";
    ZodFirstPartyTypeKind2["ZodNullable"] = "ZodNullable";
    ZodFirstPartyTypeKind2["ZodDefault"] = "ZodDefault";
    ZodFirstPartyTypeKind2["ZodCatch"] = "ZodCatch";
    ZodFirstPartyTypeKind2["ZodPromise"] = "ZodPromise";
    ZodFirstPartyTypeKind2["ZodBranded"] = "ZodBranded";
    ZodFirstPartyTypeKind2["ZodPipeline"] = "ZodPipeline";
    ZodFirstPartyTypeKind2["ZodReadonly"] = "ZodReadonly";
  })(ZodFirstPartyTypeKind || (types.ZodFirstPartyTypeKind = ZodFirstPartyTypeKind = {}));
  const instanceOfType = (cls, params = {
    message: `Input not instance of ${cls.name}`
  }) => custom((data) => data instanceof cls, params);
  types.instanceof = instanceOfType;
  const stringType = ZodString.create;
  types.string = stringType;
  const numberType = ZodNumber.create;
  types.number = numberType;
  const nanType = ZodNaN.create;
  types.nan = nanType;
  const bigIntType = ZodBigInt.create;
  types.bigint = bigIntType;
  const booleanType = ZodBoolean.create;
  types.boolean = booleanType;
  const dateType = ZodDate.create;
  types.date = dateType;
  const symbolType = ZodSymbol.create;
  types.symbol = symbolType;
  const undefinedType = ZodUndefined.create;
  types.undefined = undefinedType;
  const nullType = ZodNull.create;
  types.null = nullType;
  const anyType = ZodAny.create;
  types.any = anyType;
  const unknownType = ZodUnknown.create;
  types.unknown = unknownType;
  const neverType = ZodNever.create;
  types.never = neverType;
  const voidType = ZodVoid.create;
  types.void = voidType;
  const arrayType = ZodArray.create;
  types.array = arrayType;
  const objectType = ZodObject.create;
  types.object = objectType;
  const strictObjectType = ZodObject.strictCreate;
  types.strictObject = strictObjectType;
  const unionType = ZodUnion.create;
  types.union = unionType;
  const discriminatedUnionType = ZodDiscriminatedUnion.create;
  types.discriminatedUnion = discriminatedUnionType;
  const intersectionType = ZodIntersection.create;
  types.intersection = intersectionType;
  const tupleType = ZodTuple.create;
  types.tuple = tupleType;
  const recordType = ZodRecord.create;
  types.record = recordType;
  const mapType = ZodMap.create;
  types.map = mapType;
  const setType = ZodSet.create;
  types.set = setType;
  const functionType = ZodFunction.create;
  types.function = functionType;
  const lazyType = ZodLazy.create;
  types.lazy = lazyType;
  const literalType = ZodLiteral.create;
  types.literal = literalType;
  const enumType = ZodEnum.create;
  types.enum = enumType;
  const nativeEnumType = ZodNativeEnum.create;
  types.nativeEnum = nativeEnumType;
  const promiseType = ZodPromise.create;
  types.promise = promiseType;
  const effectsType = ZodEffects.create;
  types.effect = effectsType;
  types.transformer = effectsType;
  const optionalType = ZodOptional.create;
  types.optional = optionalType;
  const nullableType = ZodNullable.create;
  types.nullable = nullableType;
  const preprocessType = ZodEffects.createWithPreprocess;
  types.preprocess = preprocessType;
  const pipelineType = ZodPipeline.create;
  types.pipeline = pipelineType;
  const ostring = () => stringType().optional();
  types.ostring = ostring;
  const onumber = () => numberType().optional();
  types.onumber = onumber;
  const oboolean = () => booleanType().optional();
  types.oboolean = oboolean;
  types.coerce = {
    string: ((arg) => ZodString.create({ ...arg, coerce: true })),
    number: ((arg) => ZodNumber.create({ ...arg, coerce: true })),
    boolean: ((arg) => ZodBoolean.create({
      ...arg,
      coerce: true
    })),
    bigint: ((arg) => ZodBigInt.create({ ...arg, coerce: true })),
    date: ((arg) => ZodDate.create({ ...arg, coerce: true }))
  };
  types.NEVER = parseUtil_js_1.INVALID;
  return types;
}
var hasRequiredExternal;
function requireExternal() {
  if (hasRequiredExternal) return external;
  hasRequiredExternal = 1;
  (function(exports$1) {
    var __createBinding = external && external.__createBinding || (Object.create ? (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    }) : (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    }));
    var __exportStar = external && external.__exportStar || function(m, exports$12) {
      for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports$12, p)) __createBinding(exports$12, m, p);
    };
    Object.defineProperty(exports$1, "__esModule", { value: true });
    __exportStar(requireErrors$1(), exports$1);
    __exportStar(requireParseUtil(), exports$1);
    __exportStar(requireTypeAliases(), exports$1);
    __exportStar(requireUtil(), exports$1);
    __exportStar(requireTypes(), exports$1);
    __exportStar(requireZodError(), exports$1);
  })(external);
  return external;
}
var hasRequiredV3;
function requireV3() {
  if (hasRequiredV3) return v3;
  hasRequiredV3 = 1;
  (function(exports$1) {
    var __createBinding = v3 && v3.__createBinding || (Object.create ? (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    }) : (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    }));
    var __setModuleDefault = v3 && v3.__setModuleDefault || (Object.create ? (function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    }) : function(o, v) {
      o["default"] = v;
    });
    var __importStar = v3 && v3.__importStar || function(mod) {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
      }
      __setModuleDefault(result, mod);
      return result;
    };
    var __exportStar = v3 && v3.__exportStar || function(m, exports$12) {
      for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports$12, p)) __createBinding(exports$12, m, p);
    };
    Object.defineProperty(exports$1, "__esModule", { value: true });
    exports$1.z = void 0;
    const z = __importStar(requireExternal());
    exports$1.z = z;
    __exportStar(requireExternal(), exports$1);
    exports$1.default = z;
  })(v3);
  return v3;
}
var unrecognized = {};
var hasRequiredUnrecognized;
function requireUnrecognized() {
  if (hasRequiredUnrecognized) return unrecognized;
  hasRequiredUnrecognized = 1;
  Object.defineProperty(unrecognized, "__esModule", { value: true });
  unrecognized.startCountingUnrecognized = startCountingUnrecognized;
  unrecognized.unrecognized = unrecognized$1;
  function unrecognized$1(value) {
    globalCount++;
    return value;
  }
  let globalCount = 0;
  let refCount = 0;
  function startCountingUnrecognized() {
    refCount++;
    const start = globalCount;
    return {
      /**
       * Ends counting and returns the delta.
       * @param delta - If provided, only this amount is added to the parent counter
       *   (used for nested unions where we only want to record the winning option's count).
       *   If not provided, records all counts since start().
       */
      end: (delta) => {
        const count = globalCount - start;
        globalCount = start + (delta ?? count);
        if (--refCount === 0)
          globalCount = 0;
        return count;
      }
    };
  }
  return unrecognized;
}
var hasRequiredEnums;
function requireEnums() {
  if (hasRequiredEnums) return enums;
  hasRequiredEnums = 1;
  var __createBinding = enums && enums.__createBinding || (Object.create ? (function(o, m, k, k2) {
    if (k2 === void 0) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() {
        return m[k];
      } };
    }
    Object.defineProperty(o, k2, desc);
  }) : (function(o, m, k, k2) {
    if (k2 === void 0) k2 = k;
    o[k2] = m[k];
  }));
  var __setModuleDefault = enums && enums.__setModuleDefault || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
  }) : function(o, v) {
    o["default"] = v;
  });
  var __importStar = enums && enums.__importStar || /* @__PURE__ */ (function() {
    var ownKeys = function(o) {
      ownKeys = Object.getOwnPropertyNames || function(o2) {
        var ar = [];
        for (var k in o2) if (Object.prototype.hasOwnProperty.call(o2, k)) ar[ar.length] = k;
        return ar;
      };
      return ownKeys(o);
    };
    return function(mod) {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null) {
        for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
      }
      __setModuleDefault(result, mod);
      return result;
    };
  })();
  Object.defineProperty(enums, "__esModule", { value: true });
  enums.inboundSchema = inboundSchema;
  enums.inboundSchemaInt = inboundSchemaInt;
  enums.outboundSchema = outboundSchema;
  enums.outboundSchemaInt = outboundSchemaInt;
  const z = __importStar(/* @__PURE__ */ requireV3());
  const unrecognized_js_1 = /* @__PURE__ */ requireUnrecognized();
  function inboundSchema(enumObj) {
    const options = Object.values(enumObj);
    return z.union([
      ...options.map((x) => z.literal(x)),
      z.string().transform((x) => (0, unrecognized_js_1.unrecognized)(x))
    ]);
  }
  function inboundSchemaInt(enumObj) {
    const options = Object.values(enumObj).filter((v) => typeof v === "number");
    return z.union([
      ...options.map((x) => z.literal(x)),
      z.number().int().transform((x) => (0, unrecognized_js_1.unrecognized)(x))
    ]);
  }
  function outboundSchema(_) {
    return z.string();
  }
  function outboundSchemaInt(_) {
    return z.number().int();
  }
  return enums;
}
var hasRequiredAudioencoding;
function requireAudioencoding() {
  if (hasRequiredAudioencoding) return audioencoding;
  hasRequiredAudioencoding = 1;
  (function(exports$1) {
    var __createBinding = audioencoding && audioencoding.__createBinding || (Object.create ? (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    }) : (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    }));
    var __setModuleDefault = audioencoding && audioencoding.__setModuleDefault || (Object.create ? (function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    }) : function(o, v) {
      o["default"] = v;
    });
    var __importStar = audioencoding && audioencoding.__importStar || /* @__PURE__ */ (function() {
      var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function(o2) {
          var ar = [];
          for (var k in o2) if (Object.prototype.hasOwnProperty.call(o2, k)) ar[ar.length] = k;
          return ar;
        };
        return ownKeys(o);
      };
      return function(mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) {
          for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        }
        __setModuleDefault(result, mod);
        return result;
      };
    })();
    Object.defineProperty(exports$1, "__esModule", { value: true });
    exports$1.AudioEncoding$outboundSchema = exports$1.AudioEncoding$inboundSchema = exports$1.AudioEncoding = void 0;
    const openEnums = __importStar(/* @__PURE__ */ requireEnums());
    exports$1.AudioEncoding = {
      PcmS16le: "pcm_s16le",
      PcmS32le: "pcm_s32le",
      PcmF16le: "pcm_f16le",
      PcmF32le: "pcm_f32le",
      PcmMulaw: "pcm_mulaw",
      PcmAlaw: "pcm_alaw"
    };
    exports$1.AudioEncoding$inboundSchema = openEnums.inboundSchema(exports$1.AudioEncoding);
    exports$1.AudioEncoding$outboundSchema = openEnums.outboundSchema(exports$1.AudioEncoding);
  })(audioencoding);
  return audioencoding;
}
var connection = {};
var transcriptionstreamdone = {};
var primitives = {};
var hasRequiredPrimitives;
function requirePrimitives() {
  if (hasRequiredPrimitives) return primitives;
  hasRequiredPrimitives = 1;
  Object.defineProperty(primitives, "__esModule", { value: true });
  primitives.invariant = invariant;
  primitives.remap = remap;
  primitives.combineSignals = combineSignals;
  primitives.abortSignalAny = abortSignalAny;
  primitives.compactMap = compactMap;
  primitives.allRequired = allRequired;
  class InvariantError extends Error {
    constructor(message) {
      super(message);
      this.name = "InvariantError";
    }
  }
  function invariant(condition, message) {
    if (!condition) {
      throw new InvariantError(message);
    }
  }
  function remap(inp, mappings) {
    let out = {};
    if (!Object.keys(mappings).length) {
      out = inp;
      return out;
    }
    for (const [k, v] of Object.entries(inp)) {
      const j = mappings[k];
      if (j === null) {
        continue;
      }
      out[j ?? k] = v;
    }
    return out;
  }
  function combineSignals(...signals) {
    const filtered = [];
    for (const signal of signals) {
      if (signal) {
        filtered.push(signal);
      }
    }
    switch (filtered.length) {
      case 0:
      case 1:
        return filtered[0] || null;
      default:
        if ("any" in AbortSignal && typeof AbortSignal.any === "function") {
          return AbortSignal.any(filtered);
        }
        return abortSignalAny(filtered);
    }
  }
  function abortSignalAny(signals) {
    const controller = new AbortController();
    const result = controller.signal;
    if (!signals.length) {
      return controller.signal;
    }
    if (signals.length === 1) {
      return signals[0] || controller.signal;
    }
    for (const signal of signals) {
      if (signal.aborted) {
        return signal;
      }
    }
    function abort() {
      controller.abort(this.reason);
      clean();
    }
    const signalRefs = [];
    function clean() {
      for (const signalRef of signalRefs) {
        const signal = signalRef.deref();
        if (signal) {
          signal.removeEventListener("abort", abort);
        }
      }
    }
    for (const signal of signals) {
      signalRefs.push(new WeakRef(signal));
      signal.addEventListener("abort", abort);
    }
    return result;
  }
  function compactMap(values) {
    const out = {};
    for (const [k, v] of Object.entries(values)) {
      if (typeof v !== "undefined") {
        out[k] = v;
      }
    }
    return out;
  }
  function allRequired(v) {
    if (Object.values(v).every((x) => x == null)) {
      return void 0;
    }
    return v;
  }
  return primitives;
}
var schemas = {};
var sdkvalidationerror = {};
var hasRequiredSdkvalidationerror;
function requireSdkvalidationerror() {
  if (hasRequiredSdkvalidationerror) return sdkvalidationerror;
  hasRequiredSdkvalidationerror = 1;
  var __createBinding = sdkvalidationerror && sdkvalidationerror.__createBinding || (Object.create ? (function(o, m, k, k2) {
    if (k2 === void 0) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() {
        return m[k];
      } };
    }
    Object.defineProperty(o, k2, desc);
  }) : (function(o, m, k, k2) {
    if (k2 === void 0) k2 = k;
    o[k2] = m[k];
  }));
  var __setModuleDefault = sdkvalidationerror && sdkvalidationerror.__setModuleDefault || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
  }) : function(o, v) {
    o["default"] = v;
  });
  var __importStar = sdkvalidationerror && sdkvalidationerror.__importStar || /* @__PURE__ */ (function() {
    var ownKeys = function(o) {
      ownKeys = Object.getOwnPropertyNames || function(o2) {
        var ar = [];
        for (var k in o2) if (Object.prototype.hasOwnProperty.call(o2, k)) ar[ar.length] = k;
        return ar;
      };
      return ownKeys(o);
    };
    return function(mod) {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null) {
        for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
      }
      __setModuleDefault(result, mod);
      return result;
    };
  })();
  Object.defineProperty(sdkvalidationerror, "__esModule", { value: true });
  sdkvalidationerror.SDKValidationError = void 0;
  sdkvalidationerror.formatZodError = formatZodError;
  const z = __importStar(/* @__PURE__ */ requireV3());
  class SDKValidationError extends Error {
    // Allows for backwards compatibility for `instanceof` checks of `ResponseValidationError`
    static [Symbol.hasInstance](instance) {
      if (!(instance instanceof Error))
        return false;
      if (!("rawValue" in instance))
        return false;
      if (!("rawMessage" in instance))
        return false;
      if (!("pretty" in instance))
        return false;
      if (typeof instance.pretty !== "function")
        return false;
      return true;
    }
    constructor(message, cause, rawValue) {
      super(`${message}: ${cause}`);
      this.name = "SDKValidationError";
      this.cause = cause;
      this.rawValue = rawValue;
      this.rawMessage = message;
    }
    /**
     * Return a pretty-formatted error message if the underlying validation error
     * is a ZodError or some other recognized error type, otherwise return the
     * default error message.
     */
    pretty() {
      if (this.cause instanceof z.ZodError) {
        return `${this.rawMessage}
${formatZodError(this.cause)}`;
      } else {
        return this.toString();
      }
    }
  }
  sdkvalidationerror.SDKValidationError = SDKValidationError;
  function formatZodError(err, level = 0) {
    let pre = "  ".repeat(level);
    pre = level > 0 ? `│${pre}` : pre;
    pre += " ".repeat(level);
    let message = "";
    const append = (str) => message += `
${pre}${str}`;
    const len = err.issues.length;
    const headline = len === 1 ? `${len} issue found` : `${len} issues found`;
    if (len) {
      append(`┌ ${headline}:`);
    }
    for (const issue of err.issues) {
      let path2 = issue.path.join(".");
      path2 = path2 ? `<root>.${path2}` : "<root>";
      append(`│ • [${path2}]: ${issue.message} (${issue.code})`);
      switch (issue.code) {
        case "invalid_literal":
        case "invalid_type": {
          append(`│     Want: ${issue.expected}`);
          append(`│      Got: ${issue.received}`);
          break;
        }
        case "unrecognized_keys": {
          append(`│     Keys: ${issue.keys.join(", ")}`);
          break;
        }
        case "invalid_enum_value": {
          append(`│     Allowed: ${issue.options.join(", ")}`);
          append(`│         Got: ${issue.received}`);
          break;
        }
        case "invalid_union_discriminator": {
          append(`│     Allowed: ${issue.options.join(", ")}`);
          break;
        }
        case "invalid_union": {
          const len2 = issue.unionErrors.length;
          append(`│   ✖︎ Attemped to deserialize into one of ${len2} union members:`);
          issue.unionErrors.forEach((err2, i) => {
            append(`│   ✖︎ Member ${i + 1} of ${len2}`);
            append(`${formatZodError(err2, level + 1)}`);
          });
        }
      }
    }
    if (err.issues.length) {
      append(`└─*`);
    }
    return message.slice(1);
  }
  return sdkvalidationerror;
}
var fp = {};
var hasRequiredFp;
function requireFp() {
  if (hasRequiredFp) return fp;
  hasRequiredFp = 1;
  Object.defineProperty(fp, "__esModule", { value: true });
  fp.OK = OK;
  fp.ERR = ERR;
  fp.unwrap = unwrap;
  fp.unwrapAsync = unwrapAsync;
  function OK(value) {
    return { ok: true, value };
  }
  function ERR(error) {
    return { ok: false, error };
  }
  function unwrap(r) {
    if (!r.ok) {
      throw r.error;
    }
    return r.value;
  }
  async function unwrapAsync(pr) {
    const r = await pr;
    if (!r.ok) {
      throw r.error;
    }
    return r.value;
  }
  return fp;
}
var hasRequiredSchemas;
function requireSchemas() {
  if (hasRequiredSchemas) return schemas;
  hasRequiredSchemas = 1;
  Object.defineProperty(schemas, "__esModule", { value: true });
  schemas.parse = parse;
  schemas.safeParse = safeParse;
  schemas.collectExtraKeys = collectExtraKeys;
  const v3_1 = /* @__PURE__ */ requireV3();
  const sdkvalidationerror_js_1 = /* @__PURE__ */ requireSdkvalidationerror();
  const fp_js_1 = /* @__PURE__ */ requireFp();
  function parse(rawValue, fn, errorMessage) {
    try {
      return fn(rawValue);
    } catch (err) {
      if (err instanceof v3_1.ZodError) {
        throw new sdkvalidationerror_js_1.SDKValidationError(errorMessage, err, rawValue);
      }
      throw err;
    }
  }
  function safeParse(rawValue, fn, errorMessage) {
    try {
      return (0, fp_js_1.OK)(fn(rawValue));
    } catch (err) {
      return (0, fp_js_1.ERR)(new sdkvalidationerror_js_1.SDKValidationError(errorMessage, err, rawValue));
    }
  }
  function collectExtraKeys(obj, extrasKey, optional) {
    return obj.transform((val) => {
      const extras = {};
      const { shape } = obj;
      for (const [key] of Object.entries(val)) {
        if (key in shape) {
          continue;
        }
        const v = val[key];
        if (typeof v === "undefined") {
          continue;
        }
        extras[key] = v;
        delete val[key];
      }
      if (optional && Object.keys(extras).length === 0) {
        return val;
      }
      return { ...val, [extrasKey]: extras };
    });
  }
  return schemas;
}
var transcriptionsegmentchunk = {};
var hasRequiredTranscriptionsegmentchunk;
function requireTranscriptionsegmentchunk() {
  if (hasRequiredTranscriptionsegmentchunk) return transcriptionsegmentchunk;
  hasRequiredTranscriptionsegmentchunk = 1;
  (function(exports$1) {
    var __createBinding = transcriptionsegmentchunk && transcriptionsegmentchunk.__createBinding || (Object.create ? (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    }) : (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    }));
    var __setModuleDefault = transcriptionsegmentchunk && transcriptionsegmentchunk.__setModuleDefault || (Object.create ? (function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    }) : function(o, v) {
      o["default"] = v;
    });
    var __importStar = transcriptionsegmentchunk && transcriptionsegmentchunk.__importStar || /* @__PURE__ */ (function() {
      var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function(o2) {
          var ar = [];
          for (var k in o2) if (Object.prototype.hasOwnProperty.call(o2, k)) ar[ar.length] = k;
          return ar;
        };
        return ownKeys(o);
      };
      return function(mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) {
          for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        }
        __setModuleDefault(result, mod);
        return result;
      };
    })();
    Object.defineProperty(exports$1, "__esModule", { value: true });
    exports$1.TranscriptionSegmentChunk$outboundSchema = exports$1.TranscriptionSegmentChunk$inboundSchema = exports$1.Type$outboundSchema = exports$1.Type$inboundSchema = exports$1.Type = void 0;
    exports$1.transcriptionSegmentChunkToJSON = transcriptionSegmentChunkToJSON;
    exports$1.transcriptionSegmentChunkFromJSON = transcriptionSegmentChunkFromJSON;
    const z = __importStar(/* @__PURE__ */ requireV3());
    const primitives_js_1 = /* @__PURE__ */ requirePrimitives();
    const schemas_js_1 = /* @__PURE__ */ requireSchemas();
    exports$1.Type = {
      TranscriptionSegment: "transcription_segment"
    };
    exports$1.Type$inboundSchema = z.nativeEnum(exports$1.Type);
    exports$1.Type$outboundSchema = exports$1.Type$inboundSchema;
    exports$1.TranscriptionSegmentChunk$inboundSchema = (0, schemas_js_1.collectExtraKeys)(z.object({
      text: z.string(),
      start: z.number(),
      end: z.number(),
      score: z.nullable(z.number()).optional(),
      speaker_id: z.nullable(z.string()).optional(),
      type: exports$1.Type$inboundSchema.default("transcription_segment")
    }).catchall(z.any()), "additionalProperties", true).transform((v) => {
      return (0, primitives_js_1.remap)(v, {
        "speaker_id": "speakerId"
      });
    });
    exports$1.TranscriptionSegmentChunk$outboundSchema = z.object({
      text: z.string(),
      start: z.number(),
      end: z.number(),
      score: z.nullable(z.number()).optional(),
      speakerId: z.nullable(z.string()).optional(),
      type: exports$1.Type$outboundSchema.default("transcription_segment"),
      additionalProperties: z.record(z.any()).optional()
    }).transform((v) => {
      return {
        ...v.additionalProperties,
        ...(0, primitives_js_1.remap)(v, {
          speakerId: "speaker_id",
          additionalProperties: null
        })
      };
    });
    function transcriptionSegmentChunkToJSON(transcriptionSegmentChunk) {
      return JSON.stringify(exports$1.TranscriptionSegmentChunk$outboundSchema.parse(transcriptionSegmentChunk));
    }
    function transcriptionSegmentChunkFromJSON(jsonString) {
      return (0, schemas_js_1.safeParse)(jsonString, (x) => exports$1.TranscriptionSegmentChunk$inboundSchema.parse(JSON.parse(x)), `Failed to parse 'TranscriptionSegmentChunk' from JSON`);
    }
  })(transcriptionsegmentchunk);
  return transcriptionsegmentchunk;
}
var usageinfo = {};
var hasRequiredUsageinfo;
function requireUsageinfo() {
  if (hasRequiredUsageinfo) return usageinfo;
  hasRequiredUsageinfo = 1;
  (function(exports$1) {
    var __createBinding = usageinfo && usageinfo.__createBinding || (Object.create ? (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    }) : (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    }));
    var __setModuleDefault = usageinfo && usageinfo.__setModuleDefault || (Object.create ? (function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    }) : function(o, v) {
      o["default"] = v;
    });
    var __importStar = usageinfo && usageinfo.__importStar || /* @__PURE__ */ (function() {
      var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function(o2) {
          var ar = [];
          for (var k in o2) if (Object.prototype.hasOwnProperty.call(o2, k)) ar[ar.length] = k;
          return ar;
        };
        return ownKeys(o);
      };
      return function(mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) {
          for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        }
        __setModuleDefault(result, mod);
        return result;
      };
    })();
    Object.defineProperty(exports$1, "__esModule", { value: true });
    exports$1.UsageInfo$outboundSchema = exports$1.UsageInfo$inboundSchema = void 0;
    exports$1.usageInfoToJSON = usageInfoToJSON;
    exports$1.usageInfoFromJSON = usageInfoFromJSON;
    const z = __importStar(/* @__PURE__ */ requireV3());
    const primitives_js_1 = /* @__PURE__ */ requirePrimitives();
    const schemas_js_1 = /* @__PURE__ */ requireSchemas();
    exports$1.UsageInfo$inboundSchema = (0, schemas_js_1.collectExtraKeys)(z.object({
      prompt_tokens: z.number().int().default(0),
      completion_tokens: z.number().int().default(0),
      total_tokens: z.number().int().default(0),
      prompt_audio_seconds: z.nullable(z.number().int()).optional()
    }).catchall(z.any()), "additionalProperties", true).transform((v) => {
      return (0, primitives_js_1.remap)(v, {
        "prompt_tokens": "promptTokens",
        "completion_tokens": "completionTokens",
        "total_tokens": "totalTokens",
        "prompt_audio_seconds": "promptAudioSeconds"
      });
    });
    exports$1.UsageInfo$outboundSchema = z.object({
      promptTokens: z.number().int().default(0),
      completionTokens: z.number().int().default(0),
      totalTokens: z.number().int().default(0),
      promptAudioSeconds: z.nullable(z.number().int()).optional(),
      additionalProperties: z.record(z.any()).optional()
    }).transform((v) => {
      return {
        ...v.additionalProperties,
        ...(0, primitives_js_1.remap)(v, {
          promptTokens: "prompt_tokens",
          completionTokens: "completion_tokens",
          totalTokens: "total_tokens",
          promptAudioSeconds: "prompt_audio_seconds",
          additionalProperties: null
        })
      };
    });
    function usageInfoToJSON(usageInfo) {
      return JSON.stringify(exports$1.UsageInfo$outboundSchema.parse(usageInfo));
    }
    function usageInfoFromJSON(jsonString) {
      return (0, schemas_js_1.safeParse)(jsonString, (x) => exports$1.UsageInfo$inboundSchema.parse(JSON.parse(x)), `Failed to parse 'UsageInfo' from JSON`);
    }
  })(usageinfo);
  return usageinfo;
}
var hasRequiredTranscriptionstreamdone;
function requireTranscriptionstreamdone() {
  if (hasRequiredTranscriptionstreamdone) return transcriptionstreamdone;
  hasRequiredTranscriptionstreamdone = 1;
  (function(exports$1) {
    var __createBinding = transcriptionstreamdone && transcriptionstreamdone.__createBinding || (Object.create ? (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    }) : (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    }));
    var __setModuleDefault = transcriptionstreamdone && transcriptionstreamdone.__setModuleDefault || (Object.create ? (function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    }) : function(o, v) {
      o["default"] = v;
    });
    var __importStar = transcriptionstreamdone && transcriptionstreamdone.__importStar || /* @__PURE__ */ (function() {
      var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function(o2) {
          var ar = [];
          for (var k in o2) if (Object.prototype.hasOwnProperty.call(o2, k)) ar[ar.length] = k;
          return ar;
        };
        return ownKeys(o);
      };
      return function(mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) {
          for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        }
        __setModuleDefault(result, mod);
        return result;
      };
    })();
    Object.defineProperty(exports$1, "__esModule", { value: true });
    exports$1.TranscriptionStreamDone$outboundSchema = exports$1.TranscriptionStreamDone$inboundSchema = exports$1.TranscriptionStreamDoneType$outboundSchema = exports$1.TranscriptionStreamDoneType$inboundSchema = exports$1.TranscriptionStreamDoneType = void 0;
    exports$1.transcriptionStreamDoneToJSON = transcriptionStreamDoneToJSON;
    exports$1.transcriptionStreamDoneFromJSON = transcriptionStreamDoneFromJSON;
    const z = __importStar(/* @__PURE__ */ requireV3());
    const primitives_js_1 = /* @__PURE__ */ requirePrimitives();
    const schemas_js_1 = /* @__PURE__ */ requireSchemas();
    const transcriptionsegmentchunk_js_1 = /* @__PURE__ */ requireTranscriptionsegmentchunk();
    const usageinfo_js_1 = /* @__PURE__ */ requireUsageinfo();
    exports$1.TranscriptionStreamDoneType = {
      TranscriptionDone: "transcription.done"
    };
    exports$1.TranscriptionStreamDoneType$inboundSchema = z.nativeEnum(exports$1.TranscriptionStreamDoneType);
    exports$1.TranscriptionStreamDoneType$outboundSchema = exports$1.TranscriptionStreamDoneType$inboundSchema;
    exports$1.TranscriptionStreamDone$inboundSchema = (0, schemas_js_1.collectExtraKeys)(z.object({
      model: z.string(),
      text: z.string(),
      segments: z.array(transcriptionsegmentchunk_js_1.TranscriptionSegmentChunk$inboundSchema).optional(),
      usage: usageinfo_js_1.UsageInfo$inboundSchema,
      type: exports$1.TranscriptionStreamDoneType$inboundSchema.default("transcription.done"),
      language: z.nullable(z.string())
    }).catchall(z.any()), "additionalProperties", true);
    exports$1.TranscriptionStreamDone$outboundSchema = z.object({
      model: z.string(),
      text: z.string(),
      segments: z.array(transcriptionsegmentchunk_js_1.TranscriptionSegmentChunk$outboundSchema).optional(),
      usage: usageinfo_js_1.UsageInfo$outboundSchema,
      type: exports$1.TranscriptionStreamDoneType$outboundSchema.default("transcription.done"),
      language: z.nullable(z.string()),
      additionalProperties: z.record(z.any()).optional()
    }).transform((v) => {
      return {
        ...v.additionalProperties,
        ...(0, primitives_js_1.remap)(v, {
          additionalProperties: null
        })
      };
    });
    function transcriptionStreamDoneToJSON(transcriptionStreamDone) {
      return JSON.stringify(exports$1.TranscriptionStreamDone$outboundSchema.parse(transcriptionStreamDone));
    }
    function transcriptionStreamDoneFromJSON(jsonString) {
      return (0, schemas_js_1.safeParse)(jsonString, (x) => exports$1.TranscriptionStreamDone$inboundSchema.parse(JSON.parse(x)), `Failed to parse 'TranscriptionStreamDone' from JSON`);
    }
  })(transcriptionstreamdone);
  return transcriptionstreamdone;
}
var transcriptionstreamlanguage = {};
var hasRequiredTranscriptionstreamlanguage;
function requireTranscriptionstreamlanguage() {
  if (hasRequiredTranscriptionstreamlanguage) return transcriptionstreamlanguage;
  hasRequiredTranscriptionstreamlanguage = 1;
  (function(exports$1) {
    var __createBinding = transcriptionstreamlanguage && transcriptionstreamlanguage.__createBinding || (Object.create ? (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    }) : (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    }));
    var __setModuleDefault = transcriptionstreamlanguage && transcriptionstreamlanguage.__setModuleDefault || (Object.create ? (function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    }) : function(o, v) {
      o["default"] = v;
    });
    var __importStar = transcriptionstreamlanguage && transcriptionstreamlanguage.__importStar || /* @__PURE__ */ (function() {
      var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function(o2) {
          var ar = [];
          for (var k in o2) if (Object.prototype.hasOwnProperty.call(o2, k)) ar[ar.length] = k;
          return ar;
        };
        return ownKeys(o);
      };
      return function(mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) {
          for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        }
        __setModuleDefault(result, mod);
        return result;
      };
    })();
    Object.defineProperty(exports$1, "__esModule", { value: true });
    exports$1.TranscriptionStreamLanguage$outboundSchema = exports$1.TranscriptionStreamLanguage$inboundSchema = exports$1.TranscriptionStreamLanguageType$outboundSchema = exports$1.TranscriptionStreamLanguageType$inboundSchema = exports$1.TranscriptionStreamLanguageType = void 0;
    exports$1.transcriptionStreamLanguageToJSON = transcriptionStreamLanguageToJSON;
    exports$1.transcriptionStreamLanguageFromJSON = transcriptionStreamLanguageFromJSON;
    const z = __importStar(/* @__PURE__ */ requireV3());
    const primitives_js_1 = /* @__PURE__ */ requirePrimitives();
    const schemas_js_1 = /* @__PURE__ */ requireSchemas();
    exports$1.TranscriptionStreamLanguageType = {
      TranscriptionLanguage: "transcription.language"
    };
    exports$1.TranscriptionStreamLanguageType$inboundSchema = z.nativeEnum(exports$1.TranscriptionStreamLanguageType);
    exports$1.TranscriptionStreamLanguageType$outboundSchema = exports$1.TranscriptionStreamLanguageType$inboundSchema;
    exports$1.TranscriptionStreamLanguage$inboundSchema = (0, schemas_js_1.collectExtraKeys)(z.object({
      type: exports$1.TranscriptionStreamLanguageType$inboundSchema.default("transcription.language"),
      audio_language: z.string()
    }).catchall(z.any()), "additionalProperties", true).transform((v) => {
      return (0, primitives_js_1.remap)(v, {
        "audio_language": "audioLanguage"
      });
    });
    exports$1.TranscriptionStreamLanguage$outboundSchema = z.object({
      type: exports$1.TranscriptionStreamLanguageType$outboundSchema.default("transcription.language"),
      audioLanguage: z.string(),
      additionalProperties: z.record(z.any()).optional()
    }).transform((v) => {
      return {
        ...v.additionalProperties,
        ...(0, primitives_js_1.remap)(v, {
          audioLanguage: "audio_language",
          additionalProperties: null
        })
      };
    });
    function transcriptionStreamLanguageToJSON(transcriptionStreamLanguage) {
      return JSON.stringify(exports$1.TranscriptionStreamLanguage$outboundSchema.parse(transcriptionStreamLanguage));
    }
    function transcriptionStreamLanguageFromJSON(jsonString) {
      return (0, schemas_js_1.safeParse)(jsonString, (x) => exports$1.TranscriptionStreamLanguage$inboundSchema.parse(JSON.parse(x)), `Failed to parse 'TranscriptionStreamLanguage' from JSON`);
    }
  })(transcriptionstreamlanguage);
  return transcriptionstreamlanguage;
}
var transcriptionstreamsegmentdelta = {};
var hasRequiredTranscriptionstreamsegmentdelta;
function requireTranscriptionstreamsegmentdelta() {
  if (hasRequiredTranscriptionstreamsegmentdelta) return transcriptionstreamsegmentdelta;
  hasRequiredTranscriptionstreamsegmentdelta = 1;
  (function(exports$1) {
    var __createBinding = transcriptionstreamsegmentdelta && transcriptionstreamsegmentdelta.__createBinding || (Object.create ? (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    }) : (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    }));
    var __setModuleDefault = transcriptionstreamsegmentdelta && transcriptionstreamsegmentdelta.__setModuleDefault || (Object.create ? (function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    }) : function(o, v) {
      o["default"] = v;
    });
    var __importStar = transcriptionstreamsegmentdelta && transcriptionstreamsegmentdelta.__importStar || /* @__PURE__ */ (function() {
      var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function(o2) {
          var ar = [];
          for (var k in o2) if (Object.prototype.hasOwnProperty.call(o2, k)) ar[ar.length] = k;
          return ar;
        };
        return ownKeys(o);
      };
      return function(mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) {
          for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        }
        __setModuleDefault(result, mod);
        return result;
      };
    })();
    Object.defineProperty(exports$1, "__esModule", { value: true });
    exports$1.TranscriptionStreamSegmentDelta$inboundSchema = exports$1.TranscriptionStreamSegmentDeltaType$inboundSchema = exports$1.TranscriptionStreamSegmentDeltaType = void 0;
    exports$1.transcriptionStreamSegmentDeltaFromJSON = transcriptionStreamSegmentDeltaFromJSON;
    const z = __importStar(/* @__PURE__ */ requireV3());
    const primitives_js_1 = /* @__PURE__ */ requirePrimitives();
    const schemas_js_1 = /* @__PURE__ */ requireSchemas();
    exports$1.TranscriptionStreamSegmentDeltaType = {
      TranscriptionSegment: "transcription.segment"
    };
    exports$1.TranscriptionStreamSegmentDeltaType$inboundSchema = z.nativeEnum(exports$1.TranscriptionStreamSegmentDeltaType);
    exports$1.TranscriptionStreamSegmentDelta$inboundSchema = (0, schemas_js_1.collectExtraKeys)(z.object({
      text: z.string(),
      start: z.number(),
      end: z.number(),
      speaker_id: z.nullable(z.string()).optional(),
      type: exports$1.TranscriptionStreamSegmentDeltaType$inboundSchema.default("transcription.segment")
    }).catchall(z.any()), "additionalProperties", true).transform((v) => {
      return (0, primitives_js_1.remap)(v, {
        "speaker_id": "speakerId"
      });
    });
    function transcriptionStreamSegmentDeltaFromJSON(jsonString) {
      return (0, schemas_js_1.safeParse)(jsonString, (x) => exports$1.TranscriptionStreamSegmentDelta$inboundSchema.parse(JSON.parse(x)), `Failed to parse 'TranscriptionStreamSegmentDelta' from JSON`);
    }
  })(transcriptionstreamsegmentdelta);
  return transcriptionstreamsegmentdelta;
}
var transcriptionstreamtextdelta = {};
var hasRequiredTranscriptionstreamtextdelta;
function requireTranscriptionstreamtextdelta() {
  if (hasRequiredTranscriptionstreamtextdelta) return transcriptionstreamtextdelta;
  hasRequiredTranscriptionstreamtextdelta = 1;
  (function(exports$1) {
    var __createBinding = transcriptionstreamtextdelta && transcriptionstreamtextdelta.__createBinding || (Object.create ? (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    }) : (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    }));
    var __setModuleDefault = transcriptionstreamtextdelta && transcriptionstreamtextdelta.__setModuleDefault || (Object.create ? (function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    }) : function(o, v) {
      o["default"] = v;
    });
    var __importStar = transcriptionstreamtextdelta && transcriptionstreamtextdelta.__importStar || /* @__PURE__ */ (function() {
      var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function(o2) {
          var ar = [];
          for (var k in o2) if (Object.prototype.hasOwnProperty.call(o2, k)) ar[ar.length] = k;
          return ar;
        };
        return ownKeys(o);
      };
      return function(mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) {
          for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        }
        __setModuleDefault(result, mod);
        return result;
      };
    })();
    Object.defineProperty(exports$1, "__esModule", { value: true });
    exports$1.TranscriptionStreamTextDelta$outboundSchema = exports$1.TranscriptionStreamTextDelta$inboundSchema = exports$1.TranscriptionStreamTextDeltaType$outboundSchema = exports$1.TranscriptionStreamTextDeltaType$inboundSchema = exports$1.TranscriptionStreamTextDeltaType = void 0;
    exports$1.transcriptionStreamTextDeltaToJSON = transcriptionStreamTextDeltaToJSON;
    exports$1.transcriptionStreamTextDeltaFromJSON = transcriptionStreamTextDeltaFromJSON;
    const z = __importStar(/* @__PURE__ */ requireV3());
    const primitives_js_1 = /* @__PURE__ */ requirePrimitives();
    const schemas_js_1 = /* @__PURE__ */ requireSchemas();
    exports$1.TranscriptionStreamTextDeltaType = {
      TranscriptionTextDelta: "transcription.text.delta"
    };
    exports$1.TranscriptionStreamTextDeltaType$inboundSchema = z.nativeEnum(exports$1.TranscriptionStreamTextDeltaType);
    exports$1.TranscriptionStreamTextDeltaType$outboundSchema = exports$1.TranscriptionStreamTextDeltaType$inboundSchema;
    exports$1.TranscriptionStreamTextDelta$inboundSchema = (0, schemas_js_1.collectExtraKeys)(z.object({
      text: z.string(),
      type: exports$1.TranscriptionStreamTextDeltaType$inboundSchema.default("transcription.text.delta")
    }).catchall(z.any()), "additionalProperties", true);
    exports$1.TranscriptionStreamTextDelta$outboundSchema = z.object({
      text: z.string(),
      type: exports$1.TranscriptionStreamTextDeltaType$outboundSchema.default("transcription.text.delta"),
      additionalProperties: z.record(z.any()).optional()
    }).transform((v) => {
      return {
        ...v.additionalProperties,
        ...(0, primitives_js_1.remap)(v, {
          additionalProperties: null
        })
      };
    });
    function transcriptionStreamTextDeltaToJSON(transcriptionStreamTextDelta) {
      return JSON.stringify(exports$1.TranscriptionStreamTextDelta$outboundSchema.parse(transcriptionStreamTextDelta));
    }
    function transcriptionStreamTextDeltaFromJSON(jsonString) {
      return (0, schemas_js_1.safeParse)(jsonString, (x) => exports$1.TranscriptionStreamTextDelta$inboundSchema.parse(JSON.parse(x)), `Failed to parse 'TranscriptionStreamTextDelta' from JSON`);
    }
  })(transcriptionstreamtextdelta);
  return transcriptionstreamtextdelta;
}
var audioformat = {};
var hasRequiredAudioformat;
function requireAudioformat() {
  if (hasRequiredAudioformat) return audioformat;
  hasRequiredAudioformat = 1;
  (function(exports$1) {
    var __createBinding = audioformat && audioformat.__createBinding || (Object.create ? (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    }) : (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    }));
    var __setModuleDefault = audioformat && audioformat.__setModuleDefault || (Object.create ? (function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    }) : function(o, v) {
      o["default"] = v;
    });
    var __importStar = audioformat && audioformat.__importStar || /* @__PURE__ */ (function() {
      var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function(o2) {
          var ar = [];
          for (var k in o2) if (Object.prototype.hasOwnProperty.call(o2, k)) ar[ar.length] = k;
          return ar;
        };
        return ownKeys(o);
      };
      return function(mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) {
          for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        }
        __setModuleDefault(result, mod);
        return result;
      };
    })();
    Object.defineProperty(exports$1, "__esModule", { value: true });
    exports$1.AudioFormat$outboundSchema = exports$1.AudioFormat$inboundSchema = void 0;
    exports$1.audioFormatToJSON = audioFormatToJSON;
    exports$1.audioFormatFromJSON = audioFormatFromJSON;
    const z = __importStar(/* @__PURE__ */ requireV3());
    const primitives_js_1 = /* @__PURE__ */ requirePrimitives();
    const schemas_js_1 = /* @__PURE__ */ requireSchemas();
    const audioencoding_js_1 = /* @__PURE__ */ requireAudioencoding();
    exports$1.AudioFormat$inboundSchema = z.object({
      encoding: audioencoding_js_1.AudioEncoding$inboundSchema,
      sample_rate: z.number().int()
    }).transform((v) => {
      return (0, primitives_js_1.remap)(v, {
        "sample_rate": "sampleRate"
      });
    });
    exports$1.AudioFormat$outboundSchema = z.object({
      encoding: audioencoding_js_1.AudioEncoding$outboundSchema,
      sampleRate: z.number().int()
    }).transform((v) => {
      return (0, primitives_js_1.remap)(v, {
        sampleRate: "sample_rate"
      });
    });
    function audioFormatToJSON(audioFormat) {
      return JSON.stringify(exports$1.AudioFormat$outboundSchema.parse(audioFormat));
    }
    function audioFormatFromJSON(jsonString) {
      return (0, schemas_js_1.safeParse)(jsonString, (x) => exports$1.AudioFormat$inboundSchema.parse(JSON.parse(x)), `Failed to parse 'AudioFormat' from JSON`);
    }
  })(audioformat);
  return audioformat;
}
var realtimetranscriptionerror = {};
var realtimetranscriptionerrordetail = {};
var hasRequiredRealtimetranscriptionerrordetail;
function requireRealtimetranscriptionerrordetail() {
  if (hasRequiredRealtimetranscriptionerrordetail) return realtimetranscriptionerrordetail;
  hasRequiredRealtimetranscriptionerrordetail = 1;
  (function(exports$1) {
    var __createBinding = realtimetranscriptionerrordetail && realtimetranscriptionerrordetail.__createBinding || (Object.create ? (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    }) : (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    }));
    var __setModuleDefault = realtimetranscriptionerrordetail && realtimetranscriptionerrordetail.__setModuleDefault || (Object.create ? (function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    }) : function(o, v) {
      o["default"] = v;
    });
    var __importStar = realtimetranscriptionerrordetail && realtimetranscriptionerrordetail.__importStar || /* @__PURE__ */ (function() {
      var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function(o2) {
          var ar = [];
          for (var k in o2) if (Object.prototype.hasOwnProperty.call(o2, k)) ar[ar.length] = k;
          return ar;
        };
        return ownKeys(o);
      };
      return function(mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) {
          for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        }
        __setModuleDefault(result, mod);
        return result;
      };
    })();
    Object.defineProperty(exports$1, "__esModule", { value: true });
    exports$1.RealtimeTranscriptionErrorDetail$outboundSchema = exports$1.RealtimeTranscriptionErrorDetail$inboundSchema = exports$1.Message$outboundSchema = exports$1.Message$inboundSchema = void 0;
    exports$1.messageToJSON = messageToJSON;
    exports$1.messageFromJSON = messageFromJSON;
    exports$1.realtimeTranscriptionErrorDetailToJSON = realtimeTranscriptionErrorDetailToJSON;
    exports$1.realtimeTranscriptionErrorDetailFromJSON = realtimeTranscriptionErrorDetailFromJSON;
    const z = __importStar(/* @__PURE__ */ requireV3());
    const schemas_js_1 = /* @__PURE__ */ requireSchemas();
    exports$1.Message$inboundSchema = z.union([z.string(), z.record(z.any())]);
    exports$1.Message$outboundSchema = z.union([z.string(), z.record(z.any())]);
    function messageToJSON(message) {
      return JSON.stringify(exports$1.Message$outboundSchema.parse(message));
    }
    function messageFromJSON(jsonString) {
      return (0, schemas_js_1.safeParse)(jsonString, (x) => exports$1.Message$inboundSchema.parse(JSON.parse(x)), `Failed to parse 'Message' from JSON`);
    }
    exports$1.RealtimeTranscriptionErrorDetail$inboundSchema = z.object({
      message: z.union([z.string(), z.record(z.any())]),
      code: z.number().int()
    });
    exports$1.RealtimeTranscriptionErrorDetail$outboundSchema = z.object({
      message: z.union([z.string(), z.record(z.any())]),
      code: z.number().int()
    });
    function realtimeTranscriptionErrorDetailToJSON(realtimeTranscriptionErrorDetail) {
      return JSON.stringify(exports$1.RealtimeTranscriptionErrorDetail$outboundSchema.parse(realtimeTranscriptionErrorDetail));
    }
    function realtimeTranscriptionErrorDetailFromJSON(jsonString) {
      return (0, schemas_js_1.safeParse)(jsonString, (x) => exports$1.RealtimeTranscriptionErrorDetail$inboundSchema.parse(JSON.parse(x)), `Failed to parse 'RealtimeTranscriptionErrorDetail' from JSON`);
    }
  })(realtimetranscriptionerrordetail);
  return realtimetranscriptionerrordetail;
}
var hasRequiredRealtimetranscriptionerror;
function requireRealtimetranscriptionerror() {
  if (hasRequiredRealtimetranscriptionerror) return realtimetranscriptionerror;
  hasRequiredRealtimetranscriptionerror = 1;
  (function(exports$1) {
    var __createBinding = realtimetranscriptionerror && realtimetranscriptionerror.__createBinding || (Object.create ? (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    }) : (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    }));
    var __setModuleDefault = realtimetranscriptionerror && realtimetranscriptionerror.__setModuleDefault || (Object.create ? (function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    }) : function(o, v) {
      o["default"] = v;
    });
    var __importStar = realtimetranscriptionerror && realtimetranscriptionerror.__importStar || /* @__PURE__ */ (function() {
      var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function(o2) {
          var ar = [];
          for (var k in o2) if (Object.prototype.hasOwnProperty.call(o2, k)) ar[ar.length] = k;
          return ar;
        };
        return ownKeys(o);
      };
      return function(mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) {
          for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        }
        __setModuleDefault(result, mod);
        return result;
      };
    })();
    Object.defineProperty(exports$1, "__esModule", { value: true });
    exports$1.RealtimeTranscriptionError$outboundSchema = exports$1.RealtimeTranscriptionError$inboundSchema = void 0;
    exports$1.realtimeTranscriptionErrorToJSON = realtimeTranscriptionErrorToJSON;
    exports$1.realtimeTranscriptionErrorFromJSON = realtimeTranscriptionErrorFromJSON;
    const z = __importStar(/* @__PURE__ */ requireV3());
    const schemas_js_1 = /* @__PURE__ */ requireSchemas();
    const realtimetranscriptionerrordetail_js_1 = /* @__PURE__ */ requireRealtimetranscriptionerrordetail();
    exports$1.RealtimeTranscriptionError$inboundSchema = z.object({
      type: z.literal("error").default("error"),
      error: realtimetranscriptionerrordetail_js_1.RealtimeTranscriptionErrorDetail$inboundSchema
    });
    exports$1.RealtimeTranscriptionError$outboundSchema = z.object({
      type: z.literal("error").default("error"),
      error: realtimetranscriptionerrordetail_js_1.RealtimeTranscriptionErrorDetail$outboundSchema
    });
    function realtimeTranscriptionErrorToJSON(realtimeTranscriptionError) {
      return JSON.stringify(exports$1.RealtimeTranscriptionError$outboundSchema.parse(realtimeTranscriptionError));
    }
    function realtimeTranscriptionErrorFromJSON(jsonString) {
      return (0, schemas_js_1.safeParse)(jsonString, (x) => exports$1.RealtimeTranscriptionError$inboundSchema.parse(JSON.parse(x)), `Failed to parse 'RealtimeTranscriptionError' from JSON`);
    }
  })(realtimetranscriptionerror);
  return realtimetranscriptionerror;
}
var realtimetranscriptionsessioncreated = {};
var realtimetranscriptionsession = {};
var hasRequiredRealtimetranscriptionsession;
function requireRealtimetranscriptionsession() {
  if (hasRequiredRealtimetranscriptionsession) return realtimetranscriptionsession;
  hasRequiredRealtimetranscriptionsession = 1;
  (function(exports$1) {
    var __createBinding = realtimetranscriptionsession && realtimetranscriptionsession.__createBinding || (Object.create ? (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    }) : (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    }));
    var __setModuleDefault = realtimetranscriptionsession && realtimetranscriptionsession.__setModuleDefault || (Object.create ? (function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    }) : function(o, v) {
      o["default"] = v;
    });
    var __importStar = realtimetranscriptionsession && realtimetranscriptionsession.__importStar || /* @__PURE__ */ (function() {
      var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function(o2) {
          var ar = [];
          for (var k in o2) if (Object.prototype.hasOwnProperty.call(o2, k)) ar[ar.length] = k;
          return ar;
        };
        return ownKeys(o);
      };
      return function(mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) {
          for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        }
        __setModuleDefault(result, mod);
        return result;
      };
    })();
    Object.defineProperty(exports$1, "__esModule", { value: true });
    exports$1.RealtimeTranscriptionSession$outboundSchema = exports$1.RealtimeTranscriptionSession$inboundSchema = void 0;
    exports$1.realtimeTranscriptionSessionToJSON = realtimeTranscriptionSessionToJSON;
    exports$1.realtimeTranscriptionSessionFromJSON = realtimeTranscriptionSessionFromJSON;
    const z = __importStar(/* @__PURE__ */ requireV3());
    const primitives_js_1 = /* @__PURE__ */ requirePrimitives();
    const schemas_js_1 = /* @__PURE__ */ requireSchemas();
    const audioformat_js_1 = /* @__PURE__ */ requireAudioformat();
    exports$1.RealtimeTranscriptionSession$inboundSchema = z.object({
      request_id: z.string(),
      model: z.string(),
      audio_format: audioformat_js_1.AudioFormat$inboundSchema
    }).transform((v) => {
      return (0, primitives_js_1.remap)(v, {
        "request_id": "requestId",
        "audio_format": "audioFormat"
      });
    });
    exports$1.RealtimeTranscriptionSession$outboundSchema = z.object({
      requestId: z.string(),
      model: z.string(),
      audioFormat: audioformat_js_1.AudioFormat$outboundSchema
    }).transform((v) => {
      return (0, primitives_js_1.remap)(v, {
        requestId: "request_id",
        audioFormat: "audio_format"
      });
    });
    function realtimeTranscriptionSessionToJSON(realtimeTranscriptionSession) {
      return JSON.stringify(exports$1.RealtimeTranscriptionSession$outboundSchema.parse(realtimeTranscriptionSession));
    }
    function realtimeTranscriptionSessionFromJSON(jsonString) {
      return (0, schemas_js_1.safeParse)(jsonString, (x) => exports$1.RealtimeTranscriptionSession$inboundSchema.parse(JSON.parse(x)), `Failed to parse 'RealtimeTranscriptionSession' from JSON`);
    }
  })(realtimetranscriptionsession);
  return realtimetranscriptionsession;
}
var hasRequiredRealtimetranscriptionsessioncreated;
function requireRealtimetranscriptionsessioncreated() {
  if (hasRequiredRealtimetranscriptionsessioncreated) return realtimetranscriptionsessioncreated;
  hasRequiredRealtimetranscriptionsessioncreated = 1;
  (function(exports$1) {
    var __createBinding = realtimetranscriptionsessioncreated && realtimetranscriptionsessioncreated.__createBinding || (Object.create ? (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    }) : (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    }));
    var __setModuleDefault = realtimetranscriptionsessioncreated && realtimetranscriptionsessioncreated.__setModuleDefault || (Object.create ? (function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    }) : function(o, v) {
      o["default"] = v;
    });
    var __importStar = realtimetranscriptionsessioncreated && realtimetranscriptionsessioncreated.__importStar || /* @__PURE__ */ (function() {
      var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function(o2) {
          var ar = [];
          for (var k in o2) if (Object.prototype.hasOwnProperty.call(o2, k)) ar[ar.length] = k;
          return ar;
        };
        return ownKeys(o);
      };
      return function(mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) {
          for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        }
        __setModuleDefault(result, mod);
        return result;
      };
    })();
    Object.defineProperty(exports$1, "__esModule", { value: true });
    exports$1.RealtimeTranscriptionSessionCreated$outboundSchema = exports$1.RealtimeTranscriptionSessionCreated$inboundSchema = void 0;
    exports$1.realtimeTranscriptionSessionCreatedToJSON = realtimeTranscriptionSessionCreatedToJSON;
    exports$1.realtimeTranscriptionSessionCreatedFromJSON = realtimeTranscriptionSessionCreatedFromJSON;
    const z = __importStar(/* @__PURE__ */ requireV3());
    const schemas_js_1 = /* @__PURE__ */ requireSchemas();
    const realtimetranscriptionsession_js_1 = /* @__PURE__ */ requireRealtimetranscriptionsession();
    exports$1.RealtimeTranscriptionSessionCreated$inboundSchema = z.object({
      type: z.literal("session.created").default("session.created"),
      session: realtimetranscriptionsession_js_1.RealtimeTranscriptionSession$inboundSchema
    });
    exports$1.RealtimeTranscriptionSessionCreated$outboundSchema = z.object({
      type: z.literal("session.created").default("session.created"),
      session: realtimetranscriptionsession_js_1.RealtimeTranscriptionSession$outboundSchema
    });
    function realtimeTranscriptionSessionCreatedToJSON(realtimeTranscriptionSessionCreated) {
      return JSON.stringify(exports$1.RealtimeTranscriptionSessionCreated$outboundSchema.parse(realtimeTranscriptionSessionCreated));
    }
    function realtimeTranscriptionSessionCreatedFromJSON(jsonString) {
      return (0, schemas_js_1.safeParse)(jsonString, (x) => exports$1.RealtimeTranscriptionSessionCreated$inboundSchema.parse(JSON.parse(x)), `Failed to parse 'RealtimeTranscriptionSessionCreated' from JSON`);
    }
  })(realtimetranscriptionsessioncreated);
  return realtimetranscriptionsessioncreated;
}
var realtimetranscriptionsessionupdated = {};
var hasRequiredRealtimetranscriptionsessionupdated;
function requireRealtimetranscriptionsessionupdated() {
  if (hasRequiredRealtimetranscriptionsessionupdated) return realtimetranscriptionsessionupdated;
  hasRequiredRealtimetranscriptionsessionupdated = 1;
  (function(exports$1) {
    var __createBinding = realtimetranscriptionsessionupdated && realtimetranscriptionsessionupdated.__createBinding || (Object.create ? (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    }) : (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    }));
    var __setModuleDefault = realtimetranscriptionsessionupdated && realtimetranscriptionsessionupdated.__setModuleDefault || (Object.create ? (function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    }) : function(o, v) {
      o["default"] = v;
    });
    var __importStar = realtimetranscriptionsessionupdated && realtimetranscriptionsessionupdated.__importStar || /* @__PURE__ */ (function() {
      var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function(o2) {
          var ar = [];
          for (var k in o2) if (Object.prototype.hasOwnProperty.call(o2, k)) ar[ar.length] = k;
          return ar;
        };
        return ownKeys(o);
      };
      return function(mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) {
          for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        }
        __setModuleDefault(result, mod);
        return result;
      };
    })();
    Object.defineProperty(exports$1, "__esModule", { value: true });
    exports$1.RealtimeTranscriptionSessionUpdated$outboundSchema = exports$1.RealtimeTranscriptionSessionUpdated$inboundSchema = void 0;
    exports$1.realtimeTranscriptionSessionUpdatedToJSON = realtimeTranscriptionSessionUpdatedToJSON;
    exports$1.realtimeTranscriptionSessionUpdatedFromJSON = realtimeTranscriptionSessionUpdatedFromJSON;
    const z = __importStar(/* @__PURE__ */ requireV3());
    const schemas_js_1 = /* @__PURE__ */ requireSchemas();
    const realtimetranscriptionsession_js_1 = /* @__PURE__ */ requireRealtimetranscriptionsession();
    exports$1.RealtimeTranscriptionSessionUpdated$inboundSchema = z.object({
      type: z.literal("session.updated").default("session.updated"),
      session: realtimetranscriptionsession_js_1.RealtimeTranscriptionSession$inboundSchema
    });
    exports$1.RealtimeTranscriptionSessionUpdated$outboundSchema = z.object({
      type: z.literal("session.updated").default("session.updated"),
      session: realtimetranscriptionsession_js_1.RealtimeTranscriptionSession$outboundSchema
    });
    function realtimeTranscriptionSessionUpdatedToJSON(realtimeTranscriptionSessionUpdated) {
      return JSON.stringify(exports$1.RealtimeTranscriptionSessionUpdated$outboundSchema.parse(realtimeTranscriptionSessionUpdated));
    }
    function realtimeTranscriptionSessionUpdatedFromJSON(jsonString) {
      return (0, schemas_js_1.safeParse)(jsonString, (x) => exports$1.RealtimeTranscriptionSessionUpdated$inboundSchema.parse(JSON.parse(x)), `Failed to parse 'RealtimeTranscriptionSessionUpdated' from JSON`);
    }
  })(realtimetranscriptionsessionupdated);
  return realtimetranscriptionsessionupdated;
}
var hasRequiredConnection;
function requireConnection() {
  if (hasRequiredConnection) return connection;
  hasRequiredConnection = 1;
  Object.defineProperty(connection, "__esModule", { value: true });
  connection.RealtimeConnection = void 0;
  connection.isUnknownRealtimeEvent = isUnknownRealtimeEvent;
  connection.parseRealtimeEventFromData = parseRealtimeEventFromData;
  const node_buffer_1 = require$$0;
  const transcriptionstreamdone_js_1 = /* @__PURE__ */ requireTranscriptionstreamdone();
  const transcriptionstreamlanguage_js_1 = /* @__PURE__ */ requireTranscriptionstreamlanguage();
  const transcriptionstreamsegmentdelta_js_1 = /* @__PURE__ */ requireTranscriptionstreamsegmentdelta();
  const transcriptionstreamtextdelta_js_1 = /* @__PURE__ */ requireTranscriptionstreamtextdelta();
  const audioformat_js_1 = /* @__PURE__ */ requireAudioformat();
  const realtimetranscriptionerror_js_1 = /* @__PURE__ */ requireRealtimetranscriptionerror();
  const realtimetranscriptionsessioncreated_js_1 = /* @__PURE__ */ requireRealtimetranscriptionsessioncreated();
  const realtimetranscriptionsessionupdated_js_1 = /* @__PURE__ */ requireRealtimetranscriptionsessionupdated();
  const WS_CLOSING = 2;
  const WS_CLOSED = 3;
  function isUnknownRealtimeEvent(event) {
    return "raw" in event;
  }
  function parseRealtimeEventFromData(data) {
    try {
      const payload = messageDataToString(data);
      try {
        const parsed = JSON.parse(payload);
        return parseRealtimeEvent(parsed);
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to parse websocket JSON", { cause: err });
        return unknownEvent("unknown", payload, error);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to read websocket message", { cause: err });
      return unknownEvent("unknown", data, error);
    }
  }
  class RealtimeConnection {
    constructor(websocket2, session, initialEvents = []) {
      this.closed = false;
      this.websocket = websocket2;
      this.currentSession = session;
      this.currentAudioFormat = session.audioFormat;
      this.initialEvents = [...initialEvents];
    }
    get requestId() {
      return this.currentSession.requestId;
    }
    get session() {
      return this.currentSession;
    }
    get audioFormat() {
      return this.currentAudioFormat;
    }
    get isClosed() {
      return this.closed || this.websocket.readyState === WS_CLOSING || this.websocket.readyState === WS_CLOSED;
    }
    [Symbol.asyncIterator]() {
      return this.events();
    }
    async *events() {
      const queued = this.initialEvents;
      this.initialEvents = [];
      for (const event of queued) {
        this.applySessionEvent(event);
        yield event;
      }
      const queue = [];
      let resolver = null;
      let done = false;
      const push = (item) => {
        if (done) {
          return;
        }
        if (resolver) {
          const resolve2 = resolver;
          resolver = null;
          resolve2(item);
          return;
        }
        queue.push(item);
      };
      const handleMessage = (event) => {
        push({ kind: "message", data: event.data });
      };
      const handleClose = () => {
        this.closed = true;
        push({ kind: "close" });
      };
      const handleError = (event) => {
        push({ kind: "error", error: normalizeWsError(event) });
      };
      this.websocket.addEventListener("message", handleMessage);
      this.websocket.addEventListener("close", handleClose);
      this.websocket.addEventListener("error", handleError);
      try {
        while (true) {
          const item = queue.length > 0 ? queue.shift() : await new Promise((resolve2) => {
            resolver = resolve2;
          });
          if (item.kind === "close") {
            break;
          }
          if (item.kind === "error") {
            const error = item.error ?? new Error("WebSocket connection error");
            yield unknownEvent("unknown", error, error);
            continue;
          }
          const event = parseRealtimeEventFromData(item.data);
          this.applySessionEvent(event);
          yield event;
        }
      } finally {
        done = true;
        this.websocket.removeEventListener("message", handleMessage);
        this.websocket.removeEventListener("close", handleClose);
        this.websocket.removeEventListener("error", handleError);
        if (resolver !== null) {
          const resolve2 = resolver;
          resolver = null;
          resolve2({ kind: "close" });
        }
      }
    }
    async sendAudio(audioBytes) {
      if (this.isClosed) {
        throw new Error("Connection is closed");
      }
      const message = {
        type: "input_audio.append",
        audio: node_buffer_1.Buffer.from(toUint8Array(audioBytes)).toString("base64")
      };
      await this.sendJson(message);
    }
    async updateSession(audioFormat) {
      if (this.isClosed) {
        throw new Error("Connection is closed");
      }
      const message = {
        type: "session.update",
        session: {
          audio_format: audioformat_js_1.AudioFormat$outboundSchema.parse(audioFormat)
        }
      };
      await this.sendJson(message);
      this.currentAudioFormat = audioFormat;
    }
    async endAudio() {
      if (this.isClosed) {
        return;
      }
      await this.sendJson({ type: "input_audio.end" });
    }
    async close(code = 1e3, reason = "") {
      if (this.closed) {
        return;
      }
      this.closed = true;
      if (this.websocket.readyState === WS_CLOSED) {
        return;
      }
      await new Promise((resolve2) => {
        const finalize = () => {
          this.websocket.removeEventListener("close", finalize);
          resolve2();
        };
        this.websocket.addEventListener("close", finalize);
        this.websocket.close(code, reason);
      });
    }
    async sendJson(payload) {
      const message = JSON.stringify(payload);
      await new Promise((resolve2, reject) => {
        this.websocket.send(message, (err) => {
          if (err) {
            reject(err);
            return;
          }
          resolve2();
        });
      });
    }
    applySessionEvent(event) {
      if (isUnknownRealtimeEvent(event)) {
        return;
      }
      if ("session" in event) {
        this.currentSession = event.session;
        this.currentAudioFormat = event.session.audioFormat;
      }
    }
  }
  connection.RealtimeConnection = RealtimeConnection;
  function parseRealtimeEvent(payload) {
    if (!isRecord(payload)) {
      return unknownEvent("unknown", payload, new Error("Invalid websocket message payload (expected JSON object)."));
    }
    const msgType = payload["type"];
    if (typeof msgType !== "string") {
      return unknownEvent("unknown", payload, new Error("Invalid websocket message payload (missing `type`)."));
    }
    if (msgType === "session.created") {
      return parseWithSchema(realtimetranscriptionsessioncreated_js_1.RealtimeTranscriptionSessionCreated$inboundSchema, payload, msgType);
    }
    if (msgType === "session.updated") {
      return parseWithSchema(realtimetranscriptionsessionupdated_js_1.RealtimeTranscriptionSessionUpdated$inboundSchema, payload, msgType);
    }
    if (msgType === "error") {
      return parseWithSchema(realtimetranscriptionerror_js_1.RealtimeTranscriptionError$inboundSchema, payload, msgType);
    }
    if (msgType === "transcription.language") {
      return parseWithSchema(transcriptionstreamlanguage_js_1.TranscriptionStreamLanguage$inboundSchema, payload, msgType);
    }
    if (msgType === "transcription.segment") {
      return parseWithSchema(transcriptionstreamsegmentdelta_js_1.TranscriptionStreamSegmentDelta$inboundSchema, payload, msgType);
    }
    if (msgType === "transcription.text.delta") {
      return parseWithSchema(transcriptionstreamtextdelta_js_1.TranscriptionStreamTextDelta$inboundSchema, payload, msgType);
    }
    if (msgType === "transcription.done") {
      return parseWithSchema(transcriptionstreamdone_js_1.TranscriptionStreamDone$inboundSchema, payload, msgType);
    }
    return unknownEvent(msgType, payload);
  }
  function parseWithSchema(schema, payload, msgType) {
    const result = schema.safeParse(payload);
    if (result.success) {
      return result.data;
    }
    const error = new Error(`Invalid websocket message payload for ${msgType}.`, { cause: result.error });
    return unknownEvent(msgType, payload, error);
  }
  function unknownEvent(type, raw, error) {
    return {
      type,
      raw,
      error
    };
  }
  function normalizeWsError(event) {
    if (event instanceof Error) {
      return event;
    }
    if (typeof event === "object" && event !== null && "error" in event && event.error instanceof Error) {
      return event.error;
    }
    return new Error("WebSocket connection error");
  }
  function messageDataToString(data) {
    if (typeof data === "string") {
      return data;
    }
    if (node_buffer_1.Buffer.isBuffer(data)) {
      return data.toString("utf8");
    }
    if (Array.isArray(data) && data.every((item) => node_buffer_1.Buffer.isBuffer(item))) {
      return node_buffer_1.Buffer.concat(data).toString("utf8");
    }
    if (data instanceof ArrayBuffer) {
      return node_buffer_1.Buffer.from(data).toString("utf8");
    }
    if (ArrayBuffer.isView(data)) {
      return node_buffer_1.Buffer.from(data.buffer, data.byteOffset, data.byteLength).toString("utf8");
    }
    throw new Error("Unsupported websocket message format");
  }
  function toUint8Array(value) {
    if (value instanceof Uint8Array) {
      return value;
    }
    if (value instanceof ArrayBuffer) {
      return new Uint8Array(value);
    }
    return new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
  }
  function isRecord(value) {
    return typeof value === "object" && value !== null && !Array.isArray(value);
  }
  return connection;
}
var transcription = {};
var bufferUtil = { exports: {} };
var constants;
var hasRequiredConstants;
function requireConstants() {
  if (hasRequiredConstants) return constants;
  hasRequiredConstants = 1;
  const BINARY_TYPES = ["nodebuffer", "arraybuffer", "fragments"];
  const hasBlob = typeof Blob !== "undefined";
  if (hasBlob) BINARY_TYPES.push("blob");
  constants = {
    BINARY_TYPES,
    CLOSE_TIMEOUT: 3e4,
    EMPTY_BUFFER: Buffer.alloc(0),
    GUID: "258EAFA5-E914-47DA-95CA-C5AB0DC85B11",
    hasBlob,
    kForOnEventAttribute: /* @__PURE__ */ Symbol("kIsForOnEventAttribute"),
    kListener: /* @__PURE__ */ Symbol("kListener"),
    kStatusCode: /* @__PURE__ */ Symbol("status-code"),
    kWebSocket: /* @__PURE__ */ Symbol("websocket"),
    NOOP: () => {
    }
  };
  return constants;
}
var bufferutil = { exports: {} };
function commonjsRequire(path2) {
  throw new Error('Could not dynamically require "' + path2 + '". Please configure the dynamicRequireTargets or/and ignoreDynamicRequires option of @rollup/plugin-commonjs appropriately for this require call to work.');
}
var nodeGypBuild$1 = { exports: {} };
var nodeGypBuild;
var hasRequiredNodeGypBuild$1;
function requireNodeGypBuild$1() {
  if (hasRequiredNodeGypBuild$1) return nodeGypBuild;
  hasRequiredNodeGypBuild$1 = 1;
  var fs2 = require$$0$1;
  var path2 = require$$1;
  var os = require$$2;
  var runtimeRequire = typeof __webpack_require__ === "function" ? __non_webpack_require__ : commonjsRequire;
  var vars = process.config && process.config.variables || {};
  var prebuildsOnly = !!process.env.PREBUILDS_ONLY;
  var abi = process.versions.modules;
  var runtime = isElectron() ? "electron" : isNwjs() ? "node-webkit" : "node";
  var arch = process.env.npm_config_arch || os.arch();
  var platform = process.env.npm_config_platform || os.platform();
  var libc = process.env.LIBC || (isAlpine(platform) ? "musl" : "glibc");
  var armv = process.env.ARM_VERSION || (arch === "arm64" ? "8" : vars.arm_version) || "";
  var uv = (process.versions.uv || "").split(".")[0];
  nodeGypBuild = load;
  function load(dir) {
    return runtimeRequire(load.resolve(dir));
  }
  load.resolve = load.path = function(dir) {
    dir = path2.resolve(dir || ".");
    try {
      var name = runtimeRequire(path2.join(dir, "package.json")).name.toUpperCase().replace(/-/g, "_");
      if (process.env[name + "_PREBUILD"]) dir = process.env[name + "_PREBUILD"];
    } catch (err) {
    }
    if (!prebuildsOnly) {
      var release = getFirst(path2.join(dir, "build/Release"), matchBuild);
      if (release) return release;
      var debug = getFirst(path2.join(dir, "build/Debug"), matchBuild);
      if (debug) return debug;
    }
    var prebuild = resolve2(dir);
    if (prebuild) return prebuild;
    var nearby = resolve2(path2.dirname(process.execPath));
    if (nearby) return nearby;
    var target = [
      "platform=" + platform,
      "arch=" + arch,
      "runtime=" + runtime,
      "abi=" + abi,
      "uv=" + uv,
      armv ? "armv=" + armv : "",
      "libc=" + libc,
      "node=" + process.versions.node,
      process.versions.electron ? "electron=" + process.versions.electron : "",
      typeof __webpack_require__ === "function" ? "webpack=true" : ""
      // eslint-disable-line
    ].filter(Boolean).join(" ");
    throw new Error("No native build was found for " + target + "\n    loaded from: " + dir + "\n");
    function resolve2(dir2) {
      var tuples = readdirSync(path2.join(dir2, "prebuilds")).map(parseTuple);
      var tuple = tuples.filter(matchTuple(platform, arch)).sort(compareTuples)[0];
      if (!tuple) return;
      var prebuilds = path2.join(dir2, "prebuilds", tuple.name);
      var parsed = readdirSync(prebuilds).map(parseTags);
      var candidates = parsed.filter(matchTags(runtime, abi));
      var winner = candidates.sort(compareTags(runtime))[0];
      if (winner) return path2.join(prebuilds, winner.file);
    }
  };
  function readdirSync(dir) {
    try {
      return fs2.readdirSync(dir);
    } catch (err) {
      return [];
    }
  }
  function getFirst(dir, filter) {
    var files = readdirSync(dir).filter(filter);
    return files[0] && path2.join(dir, files[0]);
  }
  function matchBuild(name) {
    return /\.node$/.test(name);
  }
  function parseTuple(name) {
    var arr = name.split("-");
    if (arr.length !== 2) return;
    var platform2 = arr[0];
    var architectures = arr[1].split("+");
    if (!platform2) return;
    if (!architectures.length) return;
    if (!architectures.every(Boolean)) return;
    return { name, platform: platform2, architectures };
  }
  function matchTuple(platform2, arch2) {
    return function(tuple) {
      if (tuple == null) return false;
      if (tuple.platform !== platform2) return false;
      return tuple.architectures.includes(arch2);
    };
  }
  function compareTuples(a, b) {
    return a.architectures.length - b.architectures.length;
  }
  function parseTags(file) {
    var arr = file.split(".");
    var extension2 = arr.pop();
    var tags = { file, specificity: 0 };
    if (extension2 !== "node") return;
    for (var i = 0; i < arr.length; i++) {
      var tag = arr[i];
      if (tag === "node" || tag === "electron" || tag === "node-webkit") {
        tags.runtime = tag;
      } else if (tag === "napi") {
        tags.napi = true;
      } else if (tag.slice(0, 3) === "abi") {
        tags.abi = tag.slice(3);
      } else if (tag.slice(0, 2) === "uv") {
        tags.uv = tag.slice(2);
      } else if (tag.slice(0, 4) === "armv") {
        tags.armv = tag.slice(4);
      } else if (tag === "glibc" || tag === "musl") {
        tags.libc = tag;
      } else {
        continue;
      }
      tags.specificity++;
    }
    return tags;
  }
  function matchTags(runtime2, abi2) {
    return function(tags) {
      if (tags == null) return false;
      if (tags.runtime && tags.runtime !== runtime2 && !runtimeAgnostic(tags)) return false;
      if (tags.abi && tags.abi !== abi2 && !tags.napi) return false;
      if (tags.uv && tags.uv !== uv) return false;
      if (tags.armv && tags.armv !== armv) return false;
      if (tags.libc && tags.libc !== libc) return false;
      return true;
    };
  }
  function runtimeAgnostic(tags) {
    return tags.runtime === "node" && tags.napi;
  }
  function compareTags(runtime2) {
    return function(a, b) {
      if (a.runtime !== b.runtime) {
        return a.runtime === runtime2 ? -1 : 1;
      } else if (a.abi !== b.abi) {
        return a.abi ? -1 : 1;
      } else if (a.specificity !== b.specificity) {
        return a.specificity > b.specificity ? -1 : 1;
      } else {
        return 0;
      }
    };
  }
  function isNwjs() {
    return !!(process.versions && process.versions.nw);
  }
  function isElectron() {
    if (process.versions && process.versions.electron) return true;
    if (process.env.ELECTRON_RUN_AS_NODE) return true;
    return typeof window !== "undefined" && window.process && window.process.type === "renderer";
  }
  function isAlpine(platform2) {
    return platform2 === "linux" && fs2.existsSync("/etc/alpine-release");
  }
  load.parseTags = parseTags;
  load.matchTags = matchTags;
  load.compareTags = compareTags;
  load.parseTuple = parseTuple;
  load.matchTuple = matchTuple;
  load.compareTuples = compareTuples;
  return nodeGypBuild;
}
var hasRequiredNodeGypBuild;
function requireNodeGypBuild() {
  if (hasRequiredNodeGypBuild) return nodeGypBuild$1.exports;
  hasRequiredNodeGypBuild = 1;
  const runtimeRequire = typeof __webpack_require__ === "function" ? __non_webpack_require__ : commonjsRequire;
  if (typeof runtimeRequire.addon === "function") {
    nodeGypBuild$1.exports = runtimeRequire.addon.bind(runtimeRequire);
  } else {
    nodeGypBuild$1.exports = requireNodeGypBuild$1();
  }
  return nodeGypBuild$1.exports;
}
var fallback$1;
var hasRequiredFallback$1;
function requireFallback$1() {
  if (hasRequiredFallback$1) return fallback$1;
  hasRequiredFallback$1 = 1;
  const mask = (source, mask2, output, offset, length) => {
    for (var i = 0; i < length; i++) {
      output[offset + i] = source[i] ^ mask2[i & 3];
    }
  };
  const unmask = (buffer, mask2) => {
    const length = buffer.length;
    for (var i = 0; i < length; i++) {
      buffer[i] ^= mask2[i & 3];
    }
  };
  fallback$1 = { mask, unmask };
  return fallback$1;
}
var hasRequiredBufferutil;
function requireBufferutil() {
  if (hasRequiredBufferutil) return bufferutil.exports;
  hasRequiredBufferutil = 1;
  try {
    bufferutil.exports = requireNodeGypBuild()(__dirname);
  } catch (e) {
    bufferutil.exports = requireFallback$1();
  }
  return bufferutil.exports;
}
var hasRequiredBufferUtil;
function requireBufferUtil() {
  if (hasRequiredBufferUtil) return bufferUtil.exports;
  hasRequiredBufferUtil = 1;
  const { EMPTY_BUFFER } = requireConstants();
  const FastBuffer = Buffer[Symbol.species];
  function concat(list, totalLength) {
    if (list.length === 0) return EMPTY_BUFFER;
    if (list.length === 1) return list[0];
    const target = Buffer.allocUnsafe(totalLength);
    let offset = 0;
    for (let i = 0; i < list.length; i++) {
      const buf = list[i];
      target.set(buf, offset);
      offset += buf.length;
    }
    if (offset < totalLength) {
      return new FastBuffer(target.buffer, target.byteOffset, offset);
    }
    return target;
  }
  function _mask(source, mask, output, offset, length) {
    for (let i = 0; i < length; i++) {
      output[offset + i] = source[i] ^ mask[i & 3];
    }
  }
  function _unmask(buffer, mask) {
    for (let i = 0; i < buffer.length; i++) {
      buffer[i] ^= mask[i & 3];
    }
  }
  function toArrayBuffer(buf) {
    if (buf.length === buf.buffer.byteLength) {
      return buf.buffer;
    }
    return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.length);
  }
  function toBuffer(data) {
    toBuffer.readOnly = true;
    if (Buffer.isBuffer(data)) return data;
    let buf;
    if (data instanceof ArrayBuffer) {
      buf = new FastBuffer(data);
    } else if (ArrayBuffer.isView(data)) {
      buf = new FastBuffer(data.buffer, data.byteOffset, data.byteLength);
    } else {
      buf = Buffer.from(data);
      toBuffer.readOnly = false;
    }
    return buf;
  }
  bufferUtil.exports = {
    concat,
    mask: _mask,
    toArrayBuffer,
    toBuffer,
    unmask: _unmask
  };
  if (!process.env.WS_NO_BUFFER_UTIL) {
    try {
      const bufferUtil$1 = requireBufferutil();
      bufferUtil.exports.mask = function(source, mask, output, offset, length) {
        if (length < 48) _mask(source, mask, output, offset, length);
        else bufferUtil$1.mask(source, mask, output, offset, length);
      };
      bufferUtil.exports.unmask = function(buffer, mask) {
        if (buffer.length < 32) _unmask(buffer, mask);
        else bufferUtil$1.unmask(buffer, mask);
      };
    } catch (e) {
    }
  }
  return bufferUtil.exports;
}
var limiter;
var hasRequiredLimiter;
function requireLimiter() {
  if (hasRequiredLimiter) return limiter;
  hasRequiredLimiter = 1;
  const kDone = /* @__PURE__ */ Symbol("kDone");
  const kRun = /* @__PURE__ */ Symbol("kRun");
  class Limiter {
    /**
     * Creates a new `Limiter`.
     *
     * @param {Number} [concurrency=Infinity] The maximum number of jobs allowed
     *     to run concurrently
     */
    constructor(concurrency) {
      this[kDone] = () => {
        this.pending--;
        this[kRun]();
      };
      this.concurrency = concurrency || Infinity;
      this.jobs = [];
      this.pending = 0;
    }
    /**
     * Adds a job to the queue.
     *
     * @param {Function} job The job to run
     * @public
     */
    add(job) {
      this.jobs.push(job);
      this[kRun]();
    }
    /**
     * Removes a job from the queue and runs it if possible.
     *
     * @private
     */
    [kRun]() {
      if (this.pending === this.concurrency) return;
      if (this.jobs.length) {
        const job = this.jobs.shift();
        this.pending++;
        job(this[kDone]);
      }
    }
  }
  limiter = Limiter;
  return limiter;
}
var permessageDeflate;
var hasRequiredPermessageDeflate;
function requirePermessageDeflate() {
  if (hasRequiredPermessageDeflate) return permessageDeflate;
  hasRequiredPermessageDeflate = 1;
  const zlib = require$$0$2;
  const bufferUtil2 = requireBufferUtil();
  const Limiter = requireLimiter();
  const { kStatusCode } = requireConstants();
  const FastBuffer = Buffer[Symbol.species];
  const TRAILER = Buffer.from([0, 0, 255, 255]);
  const kPerMessageDeflate = /* @__PURE__ */ Symbol("permessage-deflate");
  const kTotalLength = /* @__PURE__ */ Symbol("total-length");
  const kCallback = /* @__PURE__ */ Symbol("callback");
  const kBuffers = /* @__PURE__ */ Symbol("buffers");
  const kError = /* @__PURE__ */ Symbol("error");
  let zlibLimiter;
  class PerMessageDeflate {
    /**
     * Creates a PerMessageDeflate instance.
     *
     * @param {Object} [options] Configuration options
     * @param {(Boolean|Number)} [options.clientMaxWindowBits] Advertise support
     *     for, or request, a custom client window size
     * @param {Boolean} [options.clientNoContextTakeover=false] Advertise/
     *     acknowledge disabling of client context takeover
     * @param {Number} [options.concurrencyLimit=10] The number of concurrent
     *     calls to zlib
     * @param {(Boolean|Number)} [options.serverMaxWindowBits] Request/confirm the
     *     use of a custom server window size
     * @param {Boolean} [options.serverNoContextTakeover=false] Request/accept
     *     disabling of server context takeover
     * @param {Number} [options.threshold=1024] Size (in bytes) below which
     *     messages should not be compressed if context takeover is disabled
     * @param {Object} [options.zlibDeflateOptions] Options to pass to zlib on
     *     deflate
     * @param {Object} [options.zlibInflateOptions] Options to pass to zlib on
     *     inflate
     * @param {Boolean} [isServer=false] Create the instance in either server or
     *     client mode
     * @param {Number} [maxPayload=0] The maximum allowed message length
     */
    constructor(options, isServer, maxPayload) {
      this._maxPayload = maxPayload | 0;
      this._options = options || {};
      this._threshold = this._options.threshold !== void 0 ? this._options.threshold : 1024;
      this._isServer = !!isServer;
      this._deflate = null;
      this._inflate = null;
      this.params = null;
      if (!zlibLimiter) {
        const concurrency = this._options.concurrencyLimit !== void 0 ? this._options.concurrencyLimit : 10;
        zlibLimiter = new Limiter(concurrency);
      }
    }
    /**
     * @type {String}
     */
    static get extensionName() {
      return "permessage-deflate";
    }
    /**
     * Create an extension negotiation offer.
     *
     * @return {Object} Extension parameters
     * @public
     */
    offer() {
      const params = {};
      if (this._options.serverNoContextTakeover) {
        params.server_no_context_takeover = true;
      }
      if (this._options.clientNoContextTakeover) {
        params.client_no_context_takeover = true;
      }
      if (this._options.serverMaxWindowBits) {
        params.server_max_window_bits = this._options.serverMaxWindowBits;
      }
      if (this._options.clientMaxWindowBits) {
        params.client_max_window_bits = this._options.clientMaxWindowBits;
      } else if (this._options.clientMaxWindowBits == null) {
        params.client_max_window_bits = true;
      }
      return params;
    }
    /**
     * Accept an extension negotiation offer/response.
     *
     * @param {Array} configurations The extension negotiation offers/reponse
     * @return {Object} Accepted configuration
     * @public
     */
    accept(configurations) {
      configurations = this.normalizeParams(configurations);
      this.params = this._isServer ? this.acceptAsServer(configurations) : this.acceptAsClient(configurations);
      return this.params;
    }
    /**
     * Releases all resources used by the extension.
     *
     * @public
     */
    cleanup() {
      if (this._inflate) {
        this._inflate.close();
        this._inflate = null;
      }
      if (this._deflate) {
        const callback = this._deflate[kCallback];
        this._deflate.close();
        this._deflate = null;
        if (callback) {
          callback(
            new Error(
              "The deflate stream was closed while data was being processed"
            )
          );
        }
      }
    }
    /**
     *  Accept an extension negotiation offer.
     *
     * @param {Array} offers The extension negotiation offers
     * @return {Object} Accepted configuration
     * @private
     */
    acceptAsServer(offers) {
      const opts = this._options;
      const accepted = offers.find((params) => {
        if (opts.serverNoContextTakeover === false && params.server_no_context_takeover || params.server_max_window_bits && (opts.serverMaxWindowBits === false || typeof opts.serverMaxWindowBits === "number" && opts.serverMaxWindowBits > params.server_max_window_bits) || typeof opts.clientMaxWindowBits === "number" && !params.client_max_window_bits) {
          return false;
        }
        return true;
      });
      if (!accepted) {
        throw new Error("None of the extension offers can be accepted");
      }
      if (opts.serverNoContextTakeover) {
        accepted.server_no_context_takeover = true;
      }
      if (opts.clientNoContextTakeover) {
        accepted.client_no_context_takeover = true;
      }
      if (typeof opts.serverMaxWindowBits === "number") {
        accepted.server_max_window_bits = opts.serverMaxWindowBits;
      }
      if (typeof opts.clientMaxWindowBits === "number") {
        accepted.client_max_window_bits = opts.clientMaxWindowBits;
      } else if (accepted.client_max_window_bits === true || opts.clientMaxWindowBits === false) {
        delete accepted.client_max_window_bits;
      }
      return accepted;
    }
    /**
     * Accept the extension negotiation response.
     *
     * @param {Array} response The extension negotiation response
     * @return {Object} Accepted configuration
     * @private
     */
    acceptAsClient(response) {
      const params = response[0];
      if (this._options.clientNoContextTakeover === false && params.client_no_context_takeover) {
        throw new Error('Unexpected parameter "client_no_context_takeover"');
      }
      if (!params.client_max_window_bits) {
        if (typeof this._options.clientMaxWindowBits === "number") {
          params.client_max_window_bits = this._options.clientMaxWindowBits;
        }
      } else if (this._options.clientMaxWindowBits === false || typeof this._options.clientMaxWindowBits === "number" && params.client_max_window_bits > this._options.clientMaxWindowBits) {
        throw new Error(
          'Unexpected or invalid parameter "client_max_window_bits"'
        );
      }
      return params;
    }
    /**
     * Normalize parameters.
     *
     * @param {Array} configurations The extension negotiation offers/reponse
     * @return {Array} The offers/response with normalized parameters
     * @private
     */
    normalizeParams(configurations) {
      configurations.forEach((params) => {
        Object.keys(params).forEach((key) => {
          let value = params[key];
          if (value.length > 1) {
            throw new Error(`Parameter "${key}" must have only a single value`);
          }
          value = value[0];
          if (key === "client_max_window_bits") {
            if (value !== true) {
              const num = +value;
              if (!Number.isInteger(num) || num < 8 || num > 15) {
                throw new TypeError(
                  `Invalid value for parameter "${key}": ${value}`
                );
              }
              value = num;
            } else if (!this._isServer) {
              throw new TypeError(
                `Invalid value for parameter "${key}": ${value}`
              );
            }
          } else if (key === "server_max_window_bits") {
            const num = +value;
            if (!Number.isInteger(num) || num < 8 || num > 15) {
              throw new TypeError(
                `Invalid value for parameter "${key}": ${value}`
              );
            }
            value = num;
          } else if (key === "client_no_context_takeover" || key === "server_no_context_takeover") {
            if (value !== true) {
              throw new TypeError(
                `Invalid value for parameter "${key}": ${value}`
              );
            }
          } else {
            throw new Error(`Unknown parameter "${key}"`);
          }
          params[key] = value;
        });
      });
      return configurations;
    }
    /**
     * Decompress data. Concurrency limited.
     *
     * @param {Buffer} data Compressed data
     * @param {Boolean} fin Specifies whether or not this is the last fragment
     * @param {Function} callback Callback
     * @public
     */
    decompress(data, fin, callback) {
      zlibLimiter.add((done) => {
        this._decompress(data, fin, (err, result) => {
          done();
          callback(err, result);
        });
      });
    }
    /**
     * Compress data. Concurrency limited.
     *
     * @param {(Buffer|String)} data Data to compress
     * @param {Boolean} fin Specifies whether or not this is the last fragment
     * @param {Function} callback Callback
     * @public
     */
    compress(data, fin, callback) {
      zlibLimiter.add((done) => {
        this._compress(data, fin, (err, result) => {
          done();
          callback(err, result);
        });
      });
    }
    /**
     * Decompress data.
     *
     * @param {Buffer} data Compressed data
     * @param {Boolean} fin Specifies whether or not this is the last fragment
     * @param {Function} callback Callback
     * @private
     */
    _decompress(data, fin, callback) {
      const endpoint = this._isServer ? "client" : "server";
      if (!this._inflate) {
        const key = `${endpoint}_max_window_bits`;
        const windowBits = typeof this.params[key] !== "number" ? zlib.Z_DEFAULT_WINDOWBITS : this.params[key];
        this._inflate = zlib.createInflateRaw({
          ...this._options.zlibInflateOptions,
          windowBits
        });
        this._inflate[kPerMessageDeflate] = this;
        this._inflate[kTotalLength] = 0;
        this._inflate[kBuffers] = [];
        this._inflate.on("error", inflateOnError);
        this._inflate.on("data", inflateOnData);
      }
      this._inflate[kCallback] = callback;
      this._inflate.write(data);
      if (fin) this._inflate.write(TRAILER);
      this._inflate.flush(() => {
        const err = this._inflate[kError];
        if (err) {
          this._inflate.close();
          this._inflate = null;
          callback(err);
          return;
        }
        const data2 = bufferUtil2.concat(
          this._inflate[kBuffers],
          this._inflate[kTotalLength]
        );
        if (this._inflate._readableState.endEmitted) {
          this._inflate.close();
          this._inflate = null;
        } else {
          this._inflate[kTotalLength] = 0;
          this._inflate[kBuffers] = [];
          if (fin && this.params[`${endpoint}_no_context_takeover`]) {
            this._inflate.reset();
          }
        }
        callback(null, data2);
      });
    }
    /**
     * Compress data.
     *
     * @param {(Buffer|String)} data Data to compress
     * @param {Boolean} fin Specifies whether or not this is the last fragment
     * @param {Function} callback Callback
     * @private
     */
    _compress(data, fin, callback) {
      const endpoint = this._isServer ? "server" : "client";
      if (!this._deflate) {
        const key = `${endpoint}_max_window_bits`;
        const windowBits = typeof this.params[key] !== "number" ? zlib.Z_DEFAULT_WINDOWBITS : this.params[key];
        this._deflate = zlib.createDeflateRaw({
          ...this._options.zlibDeflateOptions,
          windowBits
        });
        this._deflate[kTotalLength] = 0;
        this._deflate[kBuffers] = [];
        this._deflate.on("data", deflateOnData);
      }
      this._deflate[kCallback] = callback;
      this._deflate.write(data);
      this._deflate.flush(zlib.Z_SYNC_FLUSH, () => {
        if (!this._deflate) {
          return;
        }
        let data2 = bufferUtil2.concat(
          this._deflate[kBuffers],
          this._deflate[kTotalLength]
        );
        if (fin) {
          data2 = new FastBuffer(data2.buffer, data2.byteOffset, data2.length - 4);
        }
        this._deflate[kCallback] = null;
        this._deflate[kTotalLength] = 0;
        this._deflate[kBuffers] = [];
        if (fin && this.params[`${endpoint}_no_context_takeover`]) {
          this._deflate.reset();
        }
        callback(null, data2);
      });
    }
  }
  permessageDeflate = PerMessageDeflate;
  function deflateOnData(chunk) {
    this[kBuffers].push(chunk);
    this[kTotalLength] += chunk.length;
  }
  function inflateOnData(chunk) {
    this[kTotalLength] += chunk.length;
    if (this[kPerMessageDeflate]._maxPayload < 1 || this[kTotalLength] <= this[kPerMessageDeflate]._maxPayload) {
      this[kBuffers].push(chunk);
      return;
    }
    this[kError] = new RangeError("Max payload size exceeded");
    this[kError].code = "WS_ERR_UNSUPPORTED_MESSAGE_LENGTH";
    this[kError][kStatusCode] = 1009;
    this.removeListener("data", inflateOnData);
    this.reset();
  }
  function inflateOnError(err) {
    this[kPerMessageDeflate]._inflate = null;
    if (this[kError]) {
      this[kCallback](this[kError]);
      return;
    }
    err[kStatusCode] = 1007;
    this[kCallback](err);
  }
  return permessageDeflate;
}
var validation = { exports: {} };
var utf8Validate = { exports: {} };
var fallback;
var hasRequiredFallback;
function requireFallback() {
  if (hasRequiredFallback) return fallback;
  hasRequiredFallback = 1;
  function isValidUTF8(buf) {
    const len = buf.length;
    let i = 0;
    while (i < len) {
      if ((buf[i] & 128) === 0) {
        i++;
      } else if ((buf[i] & 224) === 192) {
        if (i + 1 === len || (buf[i + 1] & 192) !== 128 || (buf[i] & 254) === 192) {
          return false;
        }
        i += 2;
      } else if ((buf[i] & 240) === 224) {
        if (i + 2 >= len || (buf[i + 1] & 192) !== 128 || (buf[i + 2] & 192) !== 128 || buf[i] === 224 && (buf[i + 1] & 224) === 128 || // overlong
        buf[i] === 237 && (buf[i + 1] & 224) === 160) {
          return false;
        }
        i += 3;
      } else if ((buf[i] & 248) === 240) {
        if (i + 3 >= len || (buf[i + 1] & 192) !== 128 || (buf[i + 2] & 192) !== 128 || (buf[i + 3] & 192) !== 128 || buf[i] === 240 && (buf[i + 1] & 240) === 128 || // overlong
        buf[i] === 244 && buf[i + 1] > 143 || buf[i] > 244) {
          return false;
        }
        i += 4;
      } else {
        return false;
      }
    }
    return true;
  }
  fallback = isValidUTF8;
  return fallback;
}
var hasRequiredUtf8Validate;
function requireUtf8Validate() {
  if (hasRequiredUtf8Validate) return utf8Validate.exports;
  hasRequiredUtf8Validate = 1;
  try {
    utf8Validate.exports = requireNodeGypBuild()(__dirname);
  } catch (e) {
    utf8Validate.exports = requireFallback();
  }
  return utf8Validate.exports;
}
var hasRequiredValidation;
function requireValidation() {
  if (hasRequiredValidation) return validation.exports;
  hasRequiredValidation = 1;
  const { isUtf8 } = require$$0$3;
  const { hasBlob } = requireConstants();
  const tokenChars = [
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    // 0 - 15
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    // 16 - 31
    0,
    1,
    0,
    1,
    1,
    1,
    1,
    1,
    0,
    0,
    1,
    1,
    0,
    1,
    1,
    0,
    // 32 - 47
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    0,
    0,
    0,
    0,
    0,
    0,
    // 48 - 63
    0,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    // 64 - 79
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    0,
    0,
    0,
    1,
    1,
    // 80 - 95
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    // 96 - 111
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    0,
    1,
    0,
    1,
    0
    // 112 - 127
  ];
  function isValidStatusCode(code) {
    return code >= 1e3 && code <= 1014 && code !== 1004 && code !== 1005 && code !== 1006 || code >= 3e3 && code <= 4999;
  }
  function _isValidUTF8(buf) {
    const len = buf.length;
    let i = 0;
    while (i < len) {
      if ((buf[i] & 128) === 0) {
        i++;
      } else if ((buf[i] & 224) === 192) {
        if (i + 1 === len || (buf[i + 1] & 192) !== 128 || (buf[i] & 254) === 192) {
          return false;
        }
        i += 2;
      } else if ((buf[i] & 240) === 224) {
        if (i + 2 >= len || (buf[i + 1] & 192) !== 128 || (buf[i + 2] & 192) !== 128 || buf[i] === 224 && (buf[i + 1] & 224) === 128 || // Overlong
        buf[i] === 237 && (buf[i + 1] & 224) === 160) {
          return false;
        }
        i += 3;
      } else if ((buf[i] & 248) === 240) {
        if (i + 3 >= len || (buf[i + 1] & 192) !== 128 || (buf[i + 2] & 192) !== 128 || (buf[i + 3] & 192) !== 128 || buf[i] === 240 && (buf[i + 1] & 240) === 128 || // Overlong
        buf[i] === 244 && buf[i + 1] > 143 || buf[i] > 244) {
          return false;
        }
        i += 4;
      } else {
        return false;
      }
    }
    return true;
  }
  function isBlob(value) {
    return hasBlob && typeof value === "object" && typeof value.arrayBuffer === "function" && typeof value.type === "string" && typeof value.stream === "function" && (value[Symbol.toStringTag] === "Blob" || value[Symbol.toStringTag] === "File");
  }
  validation.exports = {
    isBlob,
    isValidStatusCode,
    isValidUTF8: _isValidUTF8,
    tokenChars
  };
  if (isUtf8) {
    validation.exports.isValidUTF8 = function(buf) {
      return buf.length < 24 ? _isValidUTF8(buf) : isUtf8(buf);
    };
  } else if (!process.env.WS_NO_UTF_8_VALIDATE) {
    try {
      const isValidUTF8 = requireUtf8Validate();
      validation.exports.isValidUTF8 = function(buf) {
        return buf.length < 32 ? _isValidUTF8(buf) : isValidUTF8(buf);
      };
    } catch (e) {
    }
  }
  return validation.exports;
}
var receiver;
var hasRequiredReceiver;
function requireReceiver() {
  if (hasRequiredReceiver) return receiver;
  hasRequiredReceiver = 1;
  const { Writable } = require$$0$4;
  const PerMessageDeflate = requirePermessageDeflate();
  const {
    BINARY_TYPES,
    EMPTY_BUFFER,
    kStatusCode,
    kWebSocket
  } = requireConstants();
  const { concat, toArrayBuffer, unmask } = requireBufferUtil();
  const { isValidStatusCode, isValidUTF8 } = requireValidation();
  const FastBuffer = Buffer[Symbol.species];
  const GET_INFO = 0;
  const GET_PAYLOAD_LENGTH_16 = 1;
  const GET_PAYLOAD_LENGTH_64 = 2;
  const GET_MASK = 3;
  const GET_DATA = 4;
  const INFLATING = 5;
  const DEFER_EVENT = 6;
  class Receiver extends Writable {
    /**
     * Creates a Receiver instance.
     *
     * @param {Object} [options] Options object
     * @param {Boolean} [options.allowSynchronousEvents=true] Specifies whether
     *     any of the `'message'`, `'ping'`, and `'pong'` events can be emitted
     *     multiple times in the same tick
     * @param {String} [options.binaryType=nodebuffer] The type for binary data
     * @param {Object} [options.extensions] An object containing the negotiated
     *     extensions
     * @param {Boolean} [options.isServer=false] Specifies whether to operate in
     *     client or server mode
     * @param {Number} [options.maxPayload=0] The maximum allowed message length
     * @param {Boolean} [options.skipUTF8Validation=false] Specifies whether or
     *     not to skip UTF-8 validation for text and close messages
     */
    constructor(options = {}) {
      super();
      this._allowSynchronousEvents = options.allowSynchronousEvents !== void 0 ? options.allowSynchronousEvents : true;
      this._binaryType = options.binaryType || BINARY_TYPES[0];
      this._extensions = options.extensions || {};
      this._isServer = !!options.isServer;
      this._maxPayload = options.maxPayload | 0;
      this._skipUTF8Validation = !!options.skipUTF8Validation;
      this[kWebSocket] = void 0;
      this._bufferedBytes = 0;
      this._buffers = [];
      this._compressed = false;
      this._payloadLength = 0;
      this._mask = void 0;
      this._fragmented = 0;
      this._masked = false;
      this._fin = false;
      this._opcode = 0;
      this._totalPayloadLength = 0;
      this._messageLength = 0;
      this._fragments = [];
      this._errored = false;
      this._loop = false;
      this._state = GET_INFO;
    }
    /**
     * Implements `Writable.prototype._write()`.
     *
     * @param {Buffer} chunk The chunk of data to write
     * @param {String} encoding The character encoding of `chunk`
     * @param {Function} cb Callback
     * @private
     */
    _write(chunk, encoding, cb) {
      if (this._opcode === 8 && this._state == GET_INFO) return cb();
      this._bufferedBytes += chunk.length;
      this._buffers.push(chunk);
      this.startLoop(cb);
    }
    /**
     * Consumes `n` bytes from the buffered data.
     *
     * @param {Number} n The number of bytes to consume
     * @return {Buffer} The consumed bytes
     * @private
     */
    consume(n) {
      this._bufferedBytes -= n;
      if (n === this._buffers[0].length) return this._buffers.shift();
      if (n < this._buffers[0].length) {
        const buf = this._buffers[0];
        this._buffers[0] = new FastBuffer(
          buf.buffer,
          buf.byteOffset + n,
          buf.length - n
        );
        return new FastBuffer(buf.buffer, buf.byteOffset, n);
      }
      const dst = Buffer.allocUnsafe(n);
      do {
        const buf = this._buffers[0];
        const offset = dst.length - n;
        if (n >= buf.length) {
          dst.set(this._buffers.shift(), offset);
        } else {
          dst.set(new Uint8Array(buf.buffer, buf.byteOffset, n), offset);
          this._buffers[0] = new FastBuffer(
            buf.buffer,
            buf.byteOffset + n,
            buf.length - n
          );
        }
        n -= buf.length;
      } while (n > 0);
      return dst;
    }
    /**
     * Starts the parsing loop.
     *
     * @param {Function} cb Callback
     * @private
     */
    startLoop(cb) {
      this._loop = true;
      do {
        switch (this._state) {
          case GET_INFO:
            this.getInfo(cb);
            break;
          case GET_PAYLOAD_LENGTH_16:
            this.getPayloadLength16(cb);
            break;
          case GET_PAYLOAD_LENGTH_64:
            this.getPayloadLength64(cb);
            break;
          case GET_MASK:
            this.getMask();
            break;
          case GET_DATA:
            this.getData(cb);
            break;
          case INFLATING:
          case DEFER_EVENT:
            this._loop = false;
            return;
        }
      } while (this._loop);
      if (!this._errored) cb();
    }
    /**
     * Reads the first two bytes of a frame.
     *
     * @param {Function} cb Callback
     * @private
     */
    getInfo(cb) {
      if (this._bufferedBytes < 2) {
        this._loop = false;
        return;
      }
      const buf = this.consume(2);
      if ((buf[0] & 48) !== 0) {
        const error = this.createError(
          RangeError,
          "RSV2 and RSV3 must be clear",
          true,
          1002,
          "WS_ERR_UNEXPECTED_RSV_2_3"
        );
        cb(error);
        return;
      }
      const compressed = (buf[0] & 64) === 64;
      if (compressed && !this._extensions[PerMessageDeflate.extensionName]) {
        const error = this.createError(
          RangeError,
          "RSV1 must be clear",
          true,
          1002,
          "WS_ERR_UNEXPECTED_RSV_1"
        );
        cb(error);
        return;
      }
      this._fin = (buf[0] & 128) === 128;
      this._opcode = buf[0] & 15;
      this._payloadLength = buf[1] & 127;
      if (this._opcode === 0) {
        if (compressed) {
          const error = this.createError(
            RangeError,
            "RSV1 must be clear",
            true,
            1002,
            "WS_ERR_UNEXPECTED_RSV_1"
          );
          cb(error);
          return;
        }
        if (!this._fragmented) {
          const error = this.createError(
            RangeError,
            "invalid opcode 0",
            true,
            1002,
            "WS_ERR_INVALID_OPCODE"
          );
          cb(error);
          return;
        }
        this._opcode = this._fragmented;
      } else if (this._opcode === 1 || this._opcode === 2) {
        if (this._fragmented) {
          const error = this.createError(
            RangeError,
            `invalid opcode ${this._opcode}`,
            true,
            1002,
            "WS_ERR_INVALID_OPCODE"
          );
          cb(error);
          return;
        }
        this._compressed = compressed;
      } else if (this._opcode > 7 && this._opcode < 11) {
        if (!this._fin) {
          const error = this.createError(
            RangeError,
            "FIN must be set",
            true,
            1002,
            "WS_ERR_EXPECTED_FIN"
          );
          cb(error);
          return;
        }
        if (compressed) {
          const error = this.createError(
            RangeError,
            "RSV1 must be clear",
            true,
            1002,
            "WS_ERR_UNEXPECTED_RSV_1"
          );
          cb(error);
          return;
        }
        if (this._payloadLength > 125 || this._opcode === 8 && this._payloadLength === 1) {
          const error = this.createError(
            RangeError,
            `invalid payload length ${this._payloadLength}`,
            true,
            1002,
            "WS_ERR_INVALID_CONTROL_PAYLOAD_LENGTH"
          );
          cb(error);
          return;
        }
      } else {
        const error = this.createError(
          RangeError,
          `invalid opcode ${this._opcode}`,
          true,
          1002,
          "WS_ERR_INVALID_OPCODE"
        );
        cb(error);
        return;
      }
      if (!this._fin && !this._fragmented) this._fragmented = this._opcode;
      this._masked = (buf[1] & 128) === 128;
      if (this._isServer) {
        if (!this._masked) {
          const error = this.createError(
            RangeError,
            "MASK must be set",
            true,
            1002,
            "WS_ERR_EXPECTED_MASK"
          );
          cb(error);
          return;
        }
      } else if (this._masked) {
        const error = this.createError(
          RangeError,
          "MASK must be clear",
          true,
          1002,
          "WS_ERR_UNEXPECTED_MASK"
        );
        cb(error);
        return;
      }
      if (this._payloadLength === 126) this._state = GET_PAYLOAD_LENGTH_16;
      else if (this._payloadLength === 127) this._state = GET_PAYLOAD_LENGTH_64;
      else this.haveLength(cb);
    }
    /**
     * Gets extended payload length (7+16).
     *
     * @param {Function} cb Callback
     * @private
     */
    getPayloadLength16(cb) {
      if (this._bufferedBytes < 2) {
        this._loop = false;
        return;
      }
      this._payloadLength = this.consume(2).readUInt16BE(0);
      this.haveLength(cb);
    }
    /**
     * Gets extended payload length (7+64).
     *
     * @param {Function} cb Callback
     * @private
     */
    getPayloadLength64(cb) {
      if (this._bufferedBytes < 8) {
        this._loop = false;
        return;
      }
      const buf = this.consume(8);
      const num = buf.readUInt32BE(0);
      if (num > Math.pow(2, 53 - 32) - 1) {
        const error = this.createError(
          RangeError,
          "Unsupported WebSocket frame: payload length > 2^53 - 1",
          false,
          1009,
          "WS_ERR_UNSUPPORTED_DATA_PAYLOAD_LENGTH"
        );
        cb(error);
        return;
      }
      this._payloadLength = num * Math.pow(2, 32) + buf.readUInt32BE(4);
      this.haveLength(cb);
    }
    /**
     * Payload length has been read.
     *
     * @param {Function} cb Callback
     * @private
     */
    haveLength(cb) {
      if (this._payloadLength && this._opcode < 8) {
        this._totalPayloadLength += this._payloadLength;
        if (this._totalPayloadLength > this._maxPayload && this._maxPayload > 0) {
          const error = this.createError(
            RangeError,
            "Max payload size exceeded",
            false,
            1009,
            "WS_ERR_UNSUPPORTED_MESSAGE_LENGTH"
          );
          cb(error);
          return;
        }
      }
      if (this._masked) this._state = GET_MASK;
      else this._state = GET_DATA;
    }
    /**
     * Reads mask bytes.
     *
     * @private
     */
    getMask() {
      if (this._bufferedBytes < 4) {
        this._loop = false;
        return;
      }
      this._mask = this.consume(4);
      this._state = GET_DATA;
    }
    /**
     * Reads data bytes.
     *
     * @param {Function} cb Callback
     * @private
     */
    getData(cb) {
      let data = EMPTY_BUFFER;
      if (this._payloadLength) {
        if (this._bufferedBytes < this._payloadLength) {
          this._loop = false;
          return;
        }
        data = this.consume(this._payloadLength);
        if (this._masked && (this._mask[0] | this._mask[1] | this._mask[2] | this._mask[3]) !== 0) {
          unmask(data, this._mask);
        }
      }
      if (this._opcode > 7) {
        this.controlMessage(data, cb);
        return;
      }
      if (this._compressed) {
        this._state = INFLATING;
        this.decompress(data, cb);
        return;
      }
      if (data.length) {
        this._messageLength = this._totalPayloadLength;
        this._fragments.push(data);
      }
      this.dataMessage(cb);
    }
    /**
     * Decompresses data.
     *
     * @param {Buffer} data Compressed data
     * @param {Function} cb Callback
     * @private
     */
    decompress(data, cb) {
      const perMessageDeflate = this._extensions[PerMessageDeflate.extensionName];
      perMessageDeflate.decompress(data, this._fin, (err, buf) => {
        if (err) return cb(err);
        if (buf.length) {
          this._messageLength += buf.length;
          if (this._messageLength > this._maxPayload && this._maxPayload > 0) {
            const error = this.createError(
              RangeError,
              "Max payload size exceeded",
              false,
              1009,
              "WS_ERR_UNSUPPORTED_MESSAGE_LENGTH"
            );
            cb(error);
            return;
          }
          this._fragments.push(buf);
        }
        this.dataMessage(cb);
        if (this._state === GET_INFO) this.startLoop(cb);
      });
    }
    /**
     * Handles a data message.
     *
     * @param {Function} cb Callback
     * @private
     */
    dataMessage(cb) {
      if (!this._fin) {
        this._state = GET_INFO;
        return;
      }
      const messageLength = this._messageLength;
      const fragments = this._fragments;
      this._totalPayloadLength = 0;
      this._messageLength = 0;
      this._fragmented = 0;
      this._fragments = [];
      if (this._opcode === 2) {
        let data;
        if (this._binaryType === "nodebuffer") {
          data = concat(fragments, messageLength);
        } else if (this._binaryType === "arraybuffer") {
          data = toArrayBuffer(concat(fragments, messageLength));
        } else if (this._binaryType === "blob") {
          data = new Blob(fragments);
        } else {
          data = fragments;
        }
        if (this._allowSynchronousEvents) {
          this.emit("message", data, true);
          this._state = GET_INFO;
        } else {
          this._state = DEFER_EVENT;
          setImmediate(() => {
            this.emit("message", data, true);
            this._state = GET_INFO;
            this.startLoop(cb);
          });
        }
      } else {
        const buf = concat(fragments, messageLength);
        if (!this._skipUTF8Validation && !isValidUTF8(buf)) {
          const error = this.createError(
            Error,
            "invalid UTF-8 sequence",
            true,
            1007,
            "WS_ERR_INVALID_UTF8"
          );
          cb(error);
          return;
        }
        if (this._state === INFLATING || this._allowSynchronousEvents) {
          this.emit("message", buf, false);
          this._state = GET_INFO;
        } else {
          this._state = DEFER_EVENT;
          setImmediate(() => {
            this.emit("message", buf, false);
            this._state = GET_INFO;
            this.startLoop(cb);
          });
        }
      }
    }
    /**
     * Handles a control message.
     *
     * @param {Buffer} data Data to handle
     * @return {(Error|RangeError|undefined)} A possible error
     * @private
     */
    controlMessage(data, cb) {
      if (this._opcode === 8) {
        if (data.length === 0) {
          this._loop = false;
          this.emit("conclude", 1005, EMPTY_BUFFER);
          this.end();
        } else {
          const code = data.readUInt16BE(0);
          if (!isValidStatusCode(code)) {
            const error = this.createError(
              RangeError,
              `invalid status code ${code}`,
              true,
              1002,
              "WS_ERR_INVALID_CLOSE_CODE"
            );
            cb(error);
            return;
          }
          const buf = new FastBuffer(
            data.buffer,
            data.byteOffset + 2,
            data.length - 2
          );
          if (!this._skipUTF8Validation && !isValidUTF8(buf)) {
            const error = this.createError(
              Error,
              "invalid UTF-8 sequence",
              true,
              1007,
              "WS_ERR_INVALID_UTF8"
            );
            cb(error);
            return;
          }
          this._loop = false;
          this.emit("conclude", code, buf);
          this.end();
        }
        this._state = GET_INFO;
        return;
      }
      if (this._allowSynchronousEvents) {
        this.emit(this._opcode === 9 ? "ping" : "pong", data);
        this._state = GET_INFO;
      } else {
        this._state = DEFER_EVENT;
        setImmediate(() => {
          this.emit(this._opcode === 9 ? "ping" : "pong", data);
          this._state = GET_INFO;
          this.startLoop(cb);
        });
      }
    }
    /**
     * Builds an error object.
     *
     * @param {function(new:Error|RangeError)} ErrorCtor The error constructor
     * @param {String} message The error message
     * @param {Boolean} prefix Specifies whether or not to add a default prefix to
     *     `message`
     * @param {Number} statusCode The status code
     * @param {String} errorCode The exposed error code
     * @return {(Error|RangeError)} The error
     * @private
     */
    createError(ErrorCtor, message, prefix, statusCode, errorCode) {
      this._loop = false;
      this._errored = true;
      const err = new ErrorCtor(
        prefix ? `Invalid WebSocket frame: ${message}` : message
      );
      Error.captureStackTrace(err, this.createError);
      err.code = errorCode;
      err[kStatusCode] = statusCode;
      return err;
    }
  }
  receiver = Receiver;
  return receiver;
}
var sender;
var hasRequiredSender;
function requireSender() {
  if (hasRequiredSender) return sender;
  hasRequiredSender = 1;
  const { Duplex } = require$$0$4;
  const { randomFillSync } = require$$1$1;
  const PerMessageDeflate = requirePermessageDeflate();
  const { EMPTY_BUFFER, kWebSocket, NOOP } = requireConstants();
  const { isBlob, isValidStatusCode } = requireValidation();
  const { mask: applyMask, toBuffer } = requireBufferUtil();
  const kByteLength = /* @__PURE__ */ Symbol("kByteLength");
  const maskBuffer = Buffer.alloc(4);
  const RANDOM_POOL_SIZE = 8 * 1024;
  let randomPool;
  let randomPoolPointer = RANDOM_POOL_SIZE;
  const DEFAULT = 0;
  const DEFLATING = 1;
  const GET_BLOB_DATA = 2;
  class Sender {
    /**
     * Creates a Sender instance.
     *
     * @param {Duplex} socket The connection socket
     * @param {Object} [extensions] An object containing the negotiated extensions
     * @param {Function} [generateMask] The function used to generate the masking
     *     key
     */
    constructor(socket, extensions, generateMask) {
      this._extensions = extensions || {};
      if (generateMask) {
        this._generateMask = generateMask;
        this._maskBuffer = Buffer.alloc(4);
      }
      this._socket = socket;
      this._firstFragment = true;
      this._compress = false;
      this._bufferedBytes = 0;
      this._queue = [];
      this._state = DEFAULT;
      this.onerror = NOOP;
      this[kWebSocket] = void 0;
    }
    /**
     * Frames a piece of data according to the HyBi WebSocket protocol.
     *
     * @param {(Buffer|String)} data The data to frame
     * @param {Object} options Options object
     * @param {Boolean} [options.fin=false] Specifies whether or not to set the
     *     FIN bit
     * @param {Function} [options.generateMask] The function used to generate the
     *     masking key
     * @param {Boolean} [options.mask=false] Specifies whether or not to mask
     *     `data`
     * @param {Buffer} [options.maskBuffer] The buffer used to store the masking
     *     key
     * @param {Number} options.opcode The opcode
     * @param {Boolean} [options.readOnly=false] Specifies whether `data` can be
     *     modified
     * @param {Boolean} [options.rsv1=false] Specifies whether or not to set the
     *     RSV1 bit
     * @return {(Buffer|String)[]} The framed data
     * @public
     */
    static frame(data, options) {
      let mask;
      let merge = false;
      let offset = 2;
      let skipMasking = false;
      if (options.mask) {
        mask = options.maskBuffer || maskBuffer;
        if (options.generateMask) {
          options.generateMask(mask);
        } else {
          if (randomPoolPointer === RANDOM_POOL_SIZE) {
            if (randomPool === void 0) {
              randomPool = Buffer.alloc(RANDOM_POOL_SIZE);
            }
            randomFillSync(randomPool, 0, RANDOM_POOL_SIZE);
            randomPoolPointer = 0;
          }
          mask[0] = randomPool[randomPoolPointer++];
          mask[1] = randomPool[randomPoolPointer++];
          mask[2] = randomPool[randomPoolPointer++];
          mask[3] = randomPool[randomPoolPointer++];
        }
        skipMasking = (mask[0] | mask[1] | mask[2] | mask[3]) === 0;
        offset = 6;
      }
      let dataLength;
      if (typeof data === "string") {
        if ((!options.mask || skipMasking) && options[kByteLength] !== void 0) {
          dataLength = options[kByteLength];
        } else {
          data = Buffer.from(data);
          dataLength = data.length;
        }
      } else {
        dataLength = data.length;
        merge = options.mask && options.readOnly && !skipMasking;
      }
      let payloadLength = dataLength;
      if (dataLength >= 65536) {
        offset += 8;
        payloadLength = 127;
      } else if (dataLength > 125) {
        offset += 2;
        payloadLength = 126;
      }
      const target = Buffer.allocUnsafe(merge ? dataLength + offset : offset);
      target[0] = options.fin ? options.opcode | 128 : options.opcode;
      if (options.rsv1) target[0] |= 64;
      target[1] = payloadLength;
      if (payloadLength === 126) {
        target.writeUInt16BE(dataLength, 2);
      } else if (payloadLength === 127) {
        target[2] = target[3] = 0;
        target.writeUIntBE(dataLength, 4, 6);
      }
      if (!options.mask) return [target, data];
      target[1] |= 128;
      target[offset - 4] = mask[0];
      target[offset - 3] = mask[1];
      target[offset - 2] = mask[2];
      target[offset - 1] = mask[3];
      if (skipMasking) return [target, data];
      if (merge) {
        applyMask(data, mask, target, offset, dataLength);
        return [target];
      }
      applyMask(data, mask, data, 0, dataLength);
      return [target, data];
    }
    /**
     * Sends a close message to the other peer.
     *
     * @param {Number} [code] The status code component of the body
     * @param {(String|Buffer)} [data] The message component of the body
     * @param {Boolean} [mask=false] Specifies whether or not to mask the message
     * @param {Function} [cb] Callback
     * @public
     */
    close(code, data, mask, cb) {
      let buf;
      if (code === void 0) {
        buf = EMPTY_BUFFER;
      } else if (typeof code !== "number" || !isValidStatusCode(code)) {
        throw new TypeError("First argument must be a valid error code number");
      } else if (data === void 0 || !data.length) {
        buf = Buffer.allocUnsafe(2);
        buf.writeUInt16BE(code, 0);
      } else {
        const length = Buffer.byteLength(data);
        if (length > 123) {
          throw new RangeError("The message must not be greater than 123 bytes");
        }
        buf = Buffer.allocUnsafe(2 + length);
        buf.writeUInt16BE(code, 0);
        if (typeof data === "string") {
          buf.write(data, 2);
        } else {
          buf.set(data, 2);
        }
      }
      const options = {
        [kByteLength]: buf.length,
        fin: true,
        generateMask: this._generateMask,
        mask,
        maskBuffer: this._maskBuffer,
        opcode: 8,
        readOnly: false,
        rsv1: false
      };
      if (this._state !== DEFAULT) {
        this.enqueue([this.dispatch, buf, false, options, cb]);
      } else {
        this.sendFrame(Sender.frame(buf, options), cb);
      }
    }
    /**
     * Sends a ping message to the other peer.
     *
     * @param {*} data The message to send
     * @param {Boolean} [mask=false] Specifies whether or not to mask `data`
     * @param {Function} [cb] Callback
     * @public
     */
    ping(data, mask, cb) {
      let byteLength;
      let readOnly;
      if (typeof data === "string") {
        byteLength = Buffer.byteLength(data);
        readOnly = false;
      } else if (isBlob(data)) {
        byteLength = data.size;
        readOnly = false;
      } else {
        data = toBuffer(data);
        byteLength = data.length;
        readOnly = toBuffer.readOnly;
      }
      if (byteLength > 125) {
        throw new RangeError("The data size must not be greater than 125 bytes");
      }
      const options = {
        [kByteLength]: byteLength,
        fin: true,
        generateMask: this._generateMask,
        mask,
        maskBuffer: this._maskBuffer,
        opcode: 9,
        readOnly,
        rsv1: false
      };
      if (isBlob(data)) {
        if (this._state !== DEFAULT) {
          this.enqueue([this.getBlobData, data, false, options, cb]);
        } else {
          this.getBlobData(data, false, options, cb);
        }
      } else if (this._state !== DEFAULT) {
        this.enqueue([this.dispatch, data, false, options, cb]);
      } else {
        this.sendFrame(Sender.frame(data, options), cb);
      }
    }
    /**
     * Sends a pong message to the other peer.
     *
     * @param {*} data The message to send
     * @param {Boolean} [mask=false] Specifies whether or not to mask `data`
     * @param {Function} [cb] Callback
     * @public
     */
    pong(data, mask, cb) {
      let byteLength;
      let readOnly;
      if (typeof data === "string") {
        byteLength = Buffer.byteLength(data);
        readOnly = false;
      } else if (isBlob(data)) {
        byteLength = data.size;
        readOnly = false;
      } else {
        data = toBuffer(data);
        byteLength = data.length;
        readOnly = toBuffer.readOnly;
      }
      if (byteLength > 125) {
        throw new RangeError("The data size must not be greater than 125 bytes");
      }
      const options = {
        [kByteLength]: byteLength,
        fin: true,
        generateMask: this._generateMask,
        mask,
        maskBuffer: this._maskBuffer,
        opcode: 10,
        readOnly,
        rsv1: false
      };
      if (isBlob(data)) {
        if (this._state !== DEFAULT) {
          this.enqueue([this.getBlobData, data, false, options, cb]);
        } else {
          this.getBlobData(data, false, options, cb);
        }
      } else if (this._state !== DEFAULT) {
        this.enqueue([this.dispatch, data, false, options, cb]);
      } else {
        this.sendFrame(Sender.frame(data, options), cb);
      }
    }
    /**
     * Sends a data message to the other peer.
     *
     * @param {*} data The message to send
     * @param {Object} options Options object
     * @param {Boolean} [options.binary=false] Specifies whether `data` is binary
     *     or text
     * @param {Boolean} [options.compress=false] Specifies whether or not to
     *     compress `data`
     * @param {Boolean} [options.fin=false] Specifies whether the fragment is the
     *     last one
     * @param {Boolean} [options.mask=false] Specifies whether or not to mask
     *     `data`
     * @param {Function} [cb] Callback
     * @public
     */
    send(data, options, cb) {
      const perMessageDeflate = this._extensions[PerMessageDeflate.extensionName];
      let opcode = options.binary ? 2 : 1;
      let rsv1 = options.compress;
      let byteLength;
      let readOnly;
      if (typeof data === "string") {
        byteLength = Buffer.byteLength(data);
        readOnly = false;
      } else if (isBlob(data)) {
        byteLength = data.size;
        readOnly = false;
      } else {
        data = toBuffer(data);
        byteLength = data.length;
        readOnly = toBuffer.readOnly;
      }
      if (this._firstFragment) {
        this._firstFragment = false;
        if (rsv1 && perMessageDeflate && perMessageDeflate.params[perMessageDeflate._isServer ? "server_no_context_takeover" : "client_no_context_takeover"]) {
          rsv1 = byteLength >= perMessageDeflate._threshold;
        }
        this._compress = rsv1;
      } else {
        rsv1 = false;
        opcode = 0;
      }
      if (options.fin) this._firstFragment = true;
      const opts = {
        [kByteLength]: byteLength,
        fin: options.fin,
        generateMask: this._generateMask,
        mask: options.mask,
        maskBuffer: this._maskBuffer,
        opcode,
        readOnly,
        rsv1
      };
      if (isBlob(data)) {
        if (this._state !== DEFAULT) {
          this.enqueue([this.getBlobData, data, this._compress, opts, cb]);
        } else {
          this.getBlobData(data, this._compress, opts, cb);
        }
      } else if (this._state !== DEFAULT) {
        this.enqueue([this.dispatch, data, this._compress, opts, cb]);
      } else {
        this.dispatch(data, this._compress, opts, cb);
      }
    }
    /**
     * Gets the contents of a blob as binary data.
     *
     * @param {Blob} blob The blob
     * @param {Boolean} [compress=false] Specifies whether or not to compress
     *     the data
     * @param {Object} options Options object
     * @param {Boolean} [options.fin=false] Specifies whether or not to set the
     *     FIN bit
     * @param {Function} [options.generateMask] The function used to generate the
     *     masking key
     * @param {Boolean} [options.mask=false] Specifies whether or not to mask
     *     `data`
     * @param {Buffer} [options.maskBuffer] The buffer used to store the masking
     *     key
     * @param {Number} options.opcode The opcode
     * @param {Boolean} [options.readOnly=false] Specifies whether `data` can be
     *     modified
     * @param {Boolean} [options.rsv1=false] Specifies whether or not to set the
     *     RSV1 bit
     * @param {Function} [cb] Callback
     * @private
     */
    getBlobData(blob, compress, options, cb) {
      this._bufferedBytes += options[kByteLength];
      this._state = GET_BLOB_DATA;
      blob.arrayBuffer().then((arrayBuffer) => {
        if (this._socket.destroyed) {
          const err = new Error(
            "The socket was closed while the blob was being read"
          );
          process.nextTick(callCallbacks, this, err, cb);
          return;
        }
        this._bufferedBytes -= options[kByteLength];
        const data = toBuffer(arrayBuffer);
        if (!compress) {
          this._state = DEFAULT;
          this.sendFrame(Sender.frame(data, options), cb);
          this.dequeue();
        } else {
          this.dispatch(data, compress, options, cb);
        }
      }).catch((err) => {
        process.nextTick(onError, this, err, cb);
      });
    }
    /**
     * Dispatches a message.
     *
     * @param {(Buffer|String)} data The message to send
     * @param {Boolean} [compress=false] Specifies whether or not to compress
     *     `data`
     * @param {Object} options Options object
     * @param {Boolean} [options.fin=false] Specifies whether or not to set the
     *     FIN bit
     * @param {Function} [options.generateMask] The function used to generate the
     *     masking key
     * @param {Boolean} [options.mask=false] Specifies whether or not to mask
     *     `data`
     * @param {Buffer} [options.maskBuffer] The buffer used to store the masking
     *     key
     * @param {Number} options.opcode The opcode
     * @param {Boolean} [options.readOnly=false] Specifies whether `data` can be
     *     modified
     * @param {Boolean} [options.rsv1=false] Specifies whether or not to set the
     *     RSV1 bit
     * @param {Function} [cb] Callback
     * @private
     */
    dispatch(data, compress, options, cb) {
      if (!compress) {
        this.sendFrame(Sender.frame(data, options), cb);
        return;
      }
      const perMessageDeflate = this._extensions[PerMessageDeflate.extensionName];
      this._bufferedBytes += options[kByteLength];
      this._state = DEFLATING;
      perMessageDeflate.compress(data, options.fin, (_, buf) => {
        if (this._socket.destroyed) {
          const err = new Error(
            "The socket was closed while data was being compressed"
          );
          callCallbacks(this, err, cb);
          return;
        }
        this._bufferedBytes -= options[kByteLength];
        this._state = DEFAULT;
        options.readOnly = false;
        this.sendFrame(Sender.frame(buf, options), cb);
        this.dequeue();
      });
    }
    /**
     * Executes queued send operations.
     *
     * @private
     */
    dequeue() {
      while (this._state === DEFAULT && this._queue.length) {
        const params = this._queue.shift();
        this._bufferedBytes -= params[3][kByteLength];
        Reflect.apply(params[0], this, params.slice(1));
      }
    }
    /**
     * Enqueues a send operation.
     *
     * @param {Array} params Send operation parameters.
     * @private
     */
    enqueue(params) {
      this._bufferedBytes += params[3][kByteLength];
      this._queue.push(params);
    }
    /**
     * Sends a frame.
     *
     * @param {(Buffer | String)[]} list The frame to send
     * @param {Function} [cb] Callback
     * @private
     */
    sendFrame(list, cb) {
      if (list.length === 2) {
        this._socket.cork();
        this._socket.write(list[0]);
        this._socket.write(list[1], cb);
        this._socket.uncork();
      } else {
        this._socket.write(list[0], cb);
      }
    }
  }
  sender = Sender;
  function callCallbacks(sender2, err, cb) {
    if (typeof cb === "function") cb(err);
    for (let i = 0; i < sender2._queue.length; i++) {
      const params = sender2._queue[i];
      const callback = params[params.length - 1];
      if (typeof callback === "function") callback(err);
    }
  }
  function onError(sender2, err, cb) {
    callCallbacks(sender2, err, cb);
    sender2.onerror(err);
  }
  return sender;
}
var eventTarget;
var hasRequiredEventTarget;
function requireEventTarget() {
  if (hasRequiredEventTarget) return eventTarget;
  hasRequiredEventTarget = 1;
  const { kForOnEventAttribute, kListener } = requireConstants();
  const kCode = /* @__PURE__ */ Symbol("kCode");
  const kData = /* @__PURE__ */ Symbol("kData");
  const kError = /* @__PURE__ */ Symbol("kError");
  const kMessage = /* @__PURE__ */ Symbol("kMessage");
  const kReason = /* @__PURE__ */ Symbol("kReason");
  const kTarget = /* @__PURE__ */ Symbol("kTarget");
  const kType = /* @__PURE__ */ Symbol("kType");
  const kWasClean = /* @__PURE__ */ Symbol("kWasClean");
  class Event {
    /**
     * Create a new `Event`.
     *
     * @param {String} type The name of the event
     * @throws {TypeError} If the `type` argument is not specified
     */
    constructor(type) {
      this[kTarget] = null;
      this[kType] = type;
    }
    /**
     * @type {*}
     */
    get target() {
      return this[kTarget];
    }
    /**
     * @type {String}
     */
    get type() {
      return this[kType];
    }
  }
  Object.defineProperty(Event.prototype, "target", { enumerable: true });
  Object.defineProperty(Event.prototype, "type", { enumerable: true });
  class CloseEvent extends Event {
    /**
     * Create a new `CloseEvent`.
     *
     * @param {String} type The name of the event
     * @param {Object} [options] A dictionary object that allows for setting
     *     attributes via object members of the same name
     * @param {Number} [options.code=0] The status code explaining why the
     *     connection was closed
     * @param {String} [options.reason=''] A human-readable string explaining why
     *     the connection was closed
     * @param {Boolean} [options.wasClean=false] Indicates whether or not the
     *     connection was cleanly closed
     */
    constructor(type, options = {}) {
      super(type);
      this[kCode] = options.code === void 0 ? 0 : options.code;
      this[kReason] = options.reason === void 0 ? "" : options.reason;
      this[kWasClean] = options.wasClean === void 0 ? false : options.wasClean;
    }
    /**
     * @type {Number}
     */
    get code() {
      return this[kCode];
    }
    /**
     * @type {String}
     */
    get reason() {
      return this[kReason];
    }
    /**
     * @type {Boolean}
     */
    get wasClean() {
      return this[kWasClean];
    }
  }
  Object.defineProperty(CloseEvent.prototype, "code", { enumerable: true });
  Object.defineProperty(CloseEvent.prototype, "reason", { enumerable: true });
  Object.defineProperty(CloseEvent.prototype, "wasClean", { enumerable: true });
  class ErrorEvent extends Event {
    /**
     * Create a new `ErrorEvent`.
     *
     * @param {String} type The name of the event
     * @param {Object} [options] A dictionary object that allows for setting
     *     attributes via object members of the same name
     * @param {*} [options.error=null] The error that generated this event
     * @param {String} [options.message=''] The error message
     */
    constructor(type, options = {}) {
      super(type);
      this[kError] = options.error === void 0 ? null : options.error;
      this[kMessage] = options.message === void 0 ? "" : options.message;
    }
    /**
     * @type {*}
     */
    get error() {
      return this[kError];
    }
    /**
     * @type {String}
     */
    get message() {
      return this[kMessage];
    }
  }
  Object.defineProperty(ErrorEvent.prototype, "error", { enumerable: true });
  Object.defineProperty(ErrorEvent.prototype, "message", { enumerable: true });
  class MessageEvent extends Event {
    /**
     * Create a new `MessageEvent`.
     *
     * @param {String} type The name of the event
     * @param {Object} [options] A dictionary object that allows for setting
     *     attributes via object members of the same name
     * @param {*} [options.data=null] The message content
     */
    constructor(type, options = {}) {
      super(type);
      this[kData] = options.data === void 0 ? null : options.data;
    }
    /**
     * @type {*}
     */
    get data() {
      return this[kData];
    }
  }
  Object.defineProperty(MessageEvent.prototype, "data", { enumerable: true });
  const EventTarget = {
    /**
     * Register an event listener.
     *
     * @param {String} type A string representing the event type to listen for
     * @param {(Function|Object)} handler The listener to add
     * @param {Object} [options] An options object specifies characteristics about
     *     the event listener
     * @param {Boolean} [options.once=false] A `Boolean` indicating that the
     *     listener should be invoked at most once after being added. If `true`,
     *     the listener would be automatically removed when invoked.
     * @public
     */
    addEventListener(type, handler, options = {}) {
      for (const listener of this.listeners(type)) {
        if (!options[kForOnEventAttribute] && listener[kListener] === handler && !listener[kForOnEventAttribute]) {
          return;
        }
      }
      let wrapper;
      if (type === "message") {
        wrapper = function onMessage(data, isBinary) {
          const event = new MessageEvent("message", {
            data: isBinary ? data : data.toString()
          });
          event[kTarget] = this;
          callListener(handler, this, event);
        };
      } else if (type === "close") {
        wrapper = function onClose(code, message) {
          const event = new CloseEvent("close", {
            code,
            reason: message.toString(),
            wasClean: this._closeFrameReceived && this._closeFrameSent
          });
          event[kTarget] = this;
          callListener(handler, this, event);
        };
      } else if (type === "error") {
        wrapper = function onError(error) {
          const event = new ErrorEvent("error", {
            error,
            message: error.message
          });
          event[kTarget] = this;
          callListener(handler, this, event);
        };
      } else if (type === "open") {
        wrapper = function onOpen() {
          const event = new Event("open");
          event[kTarget] = this;
          callListener(handler, this, event);
        };
      } else {
        return;
      }
      wrapper[kForOnEventAttribute] = !!options[kForOnEventAttribute];
      wrapper[kListener] = handler;
      if (options.once) {
        this.once(type, wrapper);
      } else {
        this.on(type, wrapper);
      }
    },
    /**
     * Remove an event listener.
     *
     * @param {String} type A string representing the event type to remove
     * @param {(Function|Object)} handler The listener to remove
     * @public
     */
    removeEventListener(type, handler) {
      for (const listener of this.listeners(type)) {
        if (listener[kListener] === handler && !listener[kForOnEventAttribute]) {
          this.removeListener(type, listener);
          break;
        }
      }
    }
  };
  eventTarget = {
    CloseEvent,
    ErrorEvent,
    Event,
    EventTarget,
    MessageEvent
  };
  function callListener(listener, thisArg, event) {
    if (typeof listener === "object" && listener.handleEvent) {
      listener.handleEvent.call(listener, event);
    } else {
      listener.call(thisArg, event);
    }
  }
  return eventTarget;
}
var extension;
var hasRequiredExtension;
function requireExtension() {
  if (hasRequiredExtension) return extension;
  hasRequiredExtension = 1;
  const { tokenChars } = requireValidation();
  function push(dest, name, elem) {
    if (dest[name] === void 0) dest[name] = [elem];
    else dest[name].push(elem);
  }
  function parse(header) {
    const offers = /* @__PURE__ */ Object.create(null);
    let params = /* @__PURE__ */ Object.create(null);
    let mustUnescape = false;
    let isEscaping = false;
    let inQuotes = false;
    let extensionName;
    let paramName;
    let start = -1;
    let code = -1;
    let end = -1;
    let i = 0;
    for (; i < header.length; i++) {
      code = header.charCodeAt(i);
      if (extensionName === void 0) {
        if (end === -1 && tokenChars[code] === 1) {
          if (start === -1) start = i;
        } else if (i !== 0 && (code === 32 || code === 9)) {
          if (end === -1 && start !== -1) end = i;
        } else if (code === 59 || code === 44) {
          if (start === -1) {
            throw new SyntaxError(`Unexpected character at index ${i}`);
          }
          if (end === -1) end = i;
          const name = header.slice(start, end);
          if (code === 44) {
            push(offers, name, params);
            params = /* @__PURE__ */ Object.create(null);
          } else {
            extensionName = name;
          }
          start = end = -1;
        } else {
          throw new SyntaxError(`Unexpected character at index ${i}`);
        }
      } else if (paramName === void 0) {
        if (end === -1 && tokenChars[code] === 1) {
          if (start === -1) start = i;
        } else if (code === 32 || code === 9) {
          if (end === -1 && start !== -1) end = i;
        } else if (code === 59 || code === 44) {
          if (start === -1) {
            throw new SyntaxError(`Unexpected character at index ${i}`);
          }
          if (end === -1) end = i;
          push(params, header.slice(start, end), true);
          if (code === 44) {
            push(offers, extensionName, params);
            params = /* @__PURE__ */ Object.create(null);
            extensionName = void 0;
          }
          start = end = -1;
        } else if (code === 61 && start !== -1 && end === -1) {
          paramName = header.slice(start, i);
          start = end = -1;
        } else {
          throw new SyntaxError(`Unexpected character at index ${i}`);
        }
      } else {
        if (isEscaping) {
          if (tokenChars[code] !== 1) {
            throw new SyntaxError(`Unexpected character at index ${i}`);
          }
          if (start === -1) start = i;
          else if (!mustUnescape) mustUnescape = true;
          isEscaping = false;
        } else if (inQuotes) {
          if (tokenChars[code] === 1) {
            if (start === -1) start = i;
          } else if (code === 34 && start !== -1) {
            inQuotes = false;
            end = i;
          } else if (code === 92) {
            isEscaping = true;
          } else {
            throw new SyntaxError(`Unexpected character at index ${i}`);
          }
        } else if (code === 34 && header.charCodeAt(i - 1) === 61) {
          inQuotes = true;
        } else if (end === -1 && tokenChars[code] === 1) {
          if (start === -1) start = i;
        } else if (start !== -1 && (code === 32 || code === 9)) {
          if (end === -1) end = i;
        } else if (code === 59 || code === 44) {
          if (start === -1) {
            throw new SyntaxError(`Unexpected character at index ${i}`);
          }
          if (end === -1) end = i;
          let value = header.slice(start, end);
          if (mustUnescape) {
            value = value.replace(/\\/g, "");
            mustUnescape = false;
          }
          push(params, paramName, value);
          if (code === 44) {
            push(offers, extensionName, params);
            params = /* @__PURE__ */ Object.create(null);
            extensionName = void 0;
          }
          paramName = void 0;
          start = end = -1;
        } else {
          throw new SyntaxError(`Unexpected character at index ${i}`);
        }
      }
    }
    if (start === -1 || inQuotes || code === 32 || code === 9) {
      throw new SyntaxError("Unexpected end of input");
    }
    if (end === -1) end = i;
    const token = header.slice(start, end);
    if (extensionName === void 0) {
      push(offers, token, params);
    } else {
      if (paramName === void 0) {
        push(params, token, true);
      } else if (mustUnescape) {
        push(params, paramName, token.replace(/\\/g, ""));
      } else {
        push(params, paramName, token);
      }
      push(offers, extensionName, params);
    }
    return offers;
  }
  function format(extensions) {
    return Object.keys(extensions).map((extension2) => {
      let configurations = extensions[extension2];
      if (!Array.isArray(configurations)) configurations = [configurations];
      return configurations.map((params) => {
        return [extension2].concat(
          Object.keys(params).map((k) => {
            let values = params[k];
            if (!Array.isArray(values)) values = [values];
            return values.map((v) => v === true ? k : `${k}=${v}`).join("; ");
          })
        ).join("; ");
      }).join(", ");
    }).join(", ");
  }
  extension = { format, parse };
  return extension;
}
var websocket;
var hasRequiredWebsocket;
function requireWebsocket() {
  if (hasRequiredWebsocket) return websocket;
  hasRequiredWebsocket = 1;
  const EventEmitter = require$$0$5;
  const https = require$$1$2;
  const http2 = require$$2$1;
  const net = require$$3;
  const tls = require$$4;
  const { randomBytes: randomBytes2, createHash } = require$$1$1;
  const { Duplex, Readable } = require$$0$4;
  const { URL: URL2 } = require$$7;
  const PerMessageDeflate = requirePermessageDeflate();
  const Receiver = requireReceiver();
  const Sender = requireSender();
  const { isBlob } = requireValidation();
  const {
    BINARY_TYPES,
    CLOSE_TIMEOUT,
    EMPTY_BUFFER,
    GUID,
    kForOnEventAttribute,
    kListener,
    kStatusCode,
    kWebSocket,
    NOOP
  } = requireConstants();
  const {
    EventTarget: { addEventListener, removeEventListener }
  } = requireEventTarget();
  const { format, parse } = requireExtension();
  const { toBuffer } = requireBufferUtil();
  const kAborted = /* @__PURE__ */ Symbol("kAborted");
  const protocolVersions = [8, 13];
  const readyStates = ["CONNECTING", "OPEN", "CLOSING", "CLOSED"];
  const subprotocolRegex = /^[!#$%&'*+\-.0-9A-Z^_`|a-z~]+$/;
  class WebSocket extends EventEmitter {
    /**
     * Create a new `WebSocket`.
     *
     * @param {(String|URL)} address The URL to which to connect
     * @param {(String|String[])} [protocols] The subprotocols
     * @param {Object} [options] Connection options
     */
    constructor(address, protocols, options) {
      super();
      this._binaryType = BINARY_TYPES[0];
      this._closeCode = 1006;
      this._closeFrameReceived = false;
      this._closeFrameSent = false;
      this._closeMessage = EMPTY_BUFFER;
      this._closeTimer = null;
      this._errorEmitted = false;
      this._extensions = {};
      this._paused = false;
      this._protocol = "";
      this._readyState = WebSocket.CONNECTING;
      this._receiver = null;
      this._sender = null;
      this._socket = null;
      if (address !== null) {
        this._bufferedAmount = 0;
        this._isServer = false;
        this._redirects = 0;
        if (protocols === void 0) {
          protocols = [];
        } else if (!Array.isArray(protocols)) {
          if (typeof protocols === "object" && protocols !== null) {
            options = protocols;
            protocols = [];
          } else {
            protocols = [protocols];
          }
        }
        initAsClient(this, address, protocols, options);
      } else {
        this._autoPong = options.autoPong;
        this._closeTimeout = options.closeTimeout;
        this._isServer = true;
      }
    }
    /**
     * For historical reasons, the custom "nodebuffer" type is used by the default
     * instead of "blob".
     *
     * @type {String}
     */
    get binaryType() {
      return this._binaryType;
    }
    set binaryType(type) {
      if (!BINARY_TYPES.includes(type)) return;
      this._binaryType = type;
      if (this._receiver) this._receiver._binaryType = type;
    }
    /**
     * @type {Number}
     */
    get bufferedAmount() {
      if (!this._socket) return this._bufferedAmount;
      return this._socket._writableState.length + this._sender._bufferedBytes;
    }
    /**
     * @type {String}
     */
    get extensions() {
      return Object.keys(this._extensions).join();
    }
    /**
     * @type {Boolean}
     */
    get isPaused() {
      return this._paused;
    }
    /**
     * @type {Function}
     */
    /* istanbul ignore next */
    get onclose() {
      return null;
    }
    /**
     * @type {Function}
     */
    /* istanbul ignore next */
    get onerror() {
      return null;
    }
    /**
     * @type {Function}
     */
    /* istanbul ignore next */
    get onopen() {
      return null;
    }
    /**
     * @type {Function}
     */
    /* istanbul ignore next */
    get onmessage() {
      return null;
    }
    /**
     * @type {String}
     */
    get protocol() {
      return this._protocol;
    }
    /**
     * @type {Number}
     */
    get readyState() {
      return this._readyState;
    }
    /**
     * @type {String}
     */
    get url() {
      return this._url;
    }
    /**
     * Set up the socket and the internal resources.
     *
     * @param {Duplex} socket The network socket between the server and client
     * @param {Buffer} head The first packet of the upgraded stream
     * @param {Object} options Options object
     * @param {Boolean} [options.allowSynchronousEvents=false] Specifies whether
     *     any of the `'message'`, `'ping'`, and `'pong'` events can be emitted
     *     multiple times in the same tick
     * @param {Function} [options.generateMask] The function used to generate the
     *     masking key
     * @param {Number} [options.maxPayload=0] The maximum allowed message size
     * @param {Boolean} [options.skipUTF8Validation=false] Specifies whether or
     *     not to skip UTF-8 validation for text and close messages
     * @private
     */
    setSocket(socket, head, options) {
      const receiver2 = new Receiver({
        allowSynchronousEvents: options.allowSynchronousEvents,
        binaryType: this.binaryType,
        extensions: this._extensions,
        isServer: this._isServer,
        maxPayload: options.maxPayload,
        skipUTF8Validation: options.skipUTF8Validation
      });
      const sender2 = new Sender(socket, this._extensions, options.generateMask);
      this._receiver = receiver2;
      this._sender = sender2;
      this._socket = socket;
      receiver2[kWebSocket] = this;
      sender2[kWebSocket] = this;
      socket[kWebSocket] = this;
      receiver2.on("conclude", receiverOnConclude);
      receiver2.on("drain", receiverOnDrain);
      receiver2.on("error", receiverOnError);
      receiver2.on("message", receiverOnMessage);
      receiver2.on("ping", receiverOnPing);
      receiver2.on("pong", receiverOnPong);
      sender2.onerror = senderOnError;
      if (socket.setTimeout) socket.setTimeout(0);
      if (socket.setNoDelay) socket.setNoDelay();
      if (head.length > 0) socket.unshift(head);
      socket.on("close", socketOnClose);
      socket.on("data", socketOnData);
      socket.on("end", socketOnEnd);
      socket.on("error", socketOnError);
      this._readyState = WebSocket.OPEN;
      this.emit("open");
    }
    /**
     * Emit the `'close'` event.
     *
     * @private
     */
    emitClose() {
      if (!this._socket) {
        this._readyState = WebSocket.CLOSED;
        this.emit("close", this._closeCode, this._closeMessage);
        return;
      }
      if (this._extensions[PerMessageDeflate.extensionName]) {
        this._extensions[PerMessageDeflate.extensionName].cleanup();
      }
      this._receiver.removeAllListeners();
      this._readyState = WebSocket.CLOSED;
      this.emit("close", this._closeCode, this._closeMessage);
    }
    /**
     * Start a closing handshake.
     *
     *          +----------+   +-----------+   +----------+
     *     - - -|ws.close()|-->|close frame|-->|ws.close()|- - -
     *    |     +----------+   +-----------+   +----------+     |
     *          +----------+   +-----------+         |
     * CLOSING  |ws.close()|<--|close frame|<--+-----+       CLOSING
     *          +----------+   +-----------+   |
     *    |           |                        |   +---+        |
     *                +------------------------+-->|fin| - - - -
     *    |         +---+                      |   +---+
     *     - - - - -|fin|<---------------------+
     *              +---+
     *
     * @param {Number} [code] Status code explaining why the connection is closing
     * @param {(String|Buffer)} [data] The reason why the connection is
     *     closing
     * @public
     */
    close(code, data) {
      if (this.readyState === WebSocket.CLOSED) return;
      if (this.readyState === WebSocket.CONNECTING) {
        const msg = "WebSocket was closed before the connection was established";
        abortHandshake(this, this._req, msg);
        return;
      }
      if (this.readyState === WebSocket.CLOSING) {
        if (this._closeFrameSent && (this._closeFrameReceived || this._receiver._writableState.errorEmitted)) {
          this._socket.end();
        }
        return;
      }
      this._readyState = WebSocket.CLOSING;
      this._sender.close(code, data, !this._isServer, (err) => {
        if (err) return;
        this._closeFrameSent = true;
        if (this._closeFrameReceived || this._receiver._writableState.errorEmitted) {
          this._socket.end();
        }
      });
      setCloseTimer(this);
    }
    /**
     * Pause the socket.
     *
     * @public
     */
    pause() {
      if (this.readyState === WebSocket.CONNECTING || this.readyState === WebSocket.CLOSED) {
        return;
      }
      this._paused = true;
      this._socket.pause();
    }
    /**
     * Send a ping.
     *
     * @param {*} [data] The data to send
     * @param {Boolean} [mask] Indicates whether or not to mask `data`
     * @param {Function} [cb] Callback which is executed when the ping is sent
     * @public
     */
    ping(data, mask, cb) {
      if (this.readyState === WebSocket.CONNECTING) {
        throw new Error("WebSocket is not open: readyState 0 (CONNECTING)");
      }
      if (typeof data === "function") {
        cb = data;
        data = mask = void 0;
      } else if (typeof mask === "function") {
        cb = mask;
        mask = void 0;
      }
      if (typeof data === "number") data = data.toString();
      if (this.readyState !== WebSocket.OPEN) {
        sendAfterClose(this, data, cb);
        return;
      }
      if (mask === void 0) mask = !this._isServer;
      this._sender.ping(data || EMPTY_BUFFER, mask, cb);
    }
    /**
     * Send a pong.
     *
     * @param {*} [data] The data to send
     * @param {Boolean} [mask] Indicates whether or not to mask `data`
     * @param {Function} [cb] Callback which is executed when the pong is sent
     * @public
     */
    pong(data, mask, cb) {
      if (this.readyState === WebSocket.CONNECTING) {
        throw new Error("WebSocket is not open: readyState 0 (CONNECTING)");
      }
      if (typeof data === "function") {
        cb = data;
        data = mask = void 0;
      } else if (typeof mask === "function") {
        cb = mask;
        mask = void 0;
      }
      if (typeof data === "number") data = data.toString();
      if (this.readyState !== WebSocket.OPEN) {
        sendAfterClose(this, data, cb);
        return;
      }
      if (mask === void 0) mask = !this._isServer;
      this._sender.pong(data || EMPTY_BUFFER, mask, cb);
    }
    /**
     * Resume the socket.
     *
     * @public
     */
    resume() {
      if (this.readyState === WebSocket.CONNECTING || this.readyState === WebSocket.CLOSED) {
        return;
      }
      this._paused = false;
      if (!this._receiver._writableState.needDrain) this._socket.resume();
    }
    /**
     * Send a data message.
     *
     * @param {*} data The message to send
     * @param {Object} [options] Options object
     * @param {Boolean} [options.binary] Specifies whether `data` is binary or
     *     text
     * @param {Boolean} [options.compress] Specifies whether or not to compress
     *     `data`
     * @param {Boolean} [options.fin=true] Specifies whether the fragment is the
     *     last one
     * @param {Boolean} [options.mask] Specifies whether or not to mask `data`
     * @param {Function} [cb] Callback which is executed when data is written out
     * @public
     */
    send(data, options, cb) {
      if (this.readyState === WebSocket.CONNECTING) {
        throw new Error("WebSocket is not open: readyState 0 (CONNECTING)");
      }
      if (typeof options === "function") {
        cb = options;
        options = {};
      }
      if (typeof data === "number") data = data.toString();
      if (this.readyState !== WebSocket.OPEN) {
        sendAfterClose(this, data, cb);
        return;
      }
      const opts = {
        binary: typeof data !== "string",
        mask: !this._isServer,
        compress: true,
        fin: true,
        ...options
      };
      if (!this._extensions[PerMessageDeflate.extensionName]) {
        opts.compress = false;
      }
      this._sender.send(data || EMPTY_BUFFER, opts, cb);
    }
    /**
     * Forcibly close the connection.
     *
     * @public
     */
    terminate() {
      if (this.readyState === WebSocket.CLOSED) return;
      if (this.readyState === WebSocket.CONNECTING) {
        const msg = "WebSocket was closed before the connection was established";
        abortHandshake(this, this._req, msg);
        return;
      }
      if (this._socket) {
        this._readyState = WebSocket.CLOSING;
        this._socket.destroy();
      }
    }
  }
  Object.defineProperty(WebSocket, "CONNECTING", {
    enumerable: true,
    value: readyStates.indexOf("CONNECTING")
  });
  Object.defineProperty(WebSocket.prototype, "CONNECTING", {
    enumerable: true,
    value: readyStates.indexOf("CONNECTING")
  });
  Object.defineProperty(WebSocket, "OPEN", {
    enumerable: true,
    value: readyStates.indexOf("OPEN")
  });
  Object.defineProperty(WebSocket.prototype, "OPEN", {
    enumerable: true,
    value: readyStates.indexOf("OPEN")
  });
  Object.defineProperty(WebSocket, "CLOSING", {
    enumerable: true,
    value: readyStates.indexOf("CLOSING")
  });
  Object.defineProperty(WebSocket.prototype, "CLOSING", {
    enumerable: true,
    value: readyStates.indexOf("CLOSING")
  });
  Object.defineProperty(WebSocket, "CLOSED", {
    enumerable: true,
    value: readyStates.indexOf("CLOSED")
  });
  Object.defineProperty(WebSocket.prototype, "CLOSED", {
    enumerable: true,
    value: readyStates.indexOf("CLOSED")
  });
  [
    "binaryType",
    "bufferedAmount",
    "extensions",
    "isPaused",
    "protocol",
    "readyState",
    "url"
  ].forEach((property) => {
    Object.defineProperty(WebSocket.prototype, property, { enumerable: true });
  });
  ["open", "error", "close", "message"].forEach((method) => {
    Object.defineProperty(WebSocket.prototype, `on${method}`, {
      enumerable: true,
      get() {
        for (const listener of this.listeners(method)) {
          if (listener[kForOnEventAttribute]) return listener[kListener];
        }
        return null;
      },
      set(handler) {
        for (const listener of this.listeners(method)) {
          if (listener[kForOnEventAttribute]) {
            this.removeListener(method, listener);
            break;
          }
        }
        if (typeof handler !== "function") return;
        this.addEventListener(method, handler, {
          [kForOnEventAttribute]: true
        });
      }
    });
  });
  WebSocket.prototype.addEventListener = addEventListener;
  WebSocket.prototype.removeEventListener = removeEventListener;
  websocket = WebSocket;
  function initAsClient(websocket2, address, protocols, options) {
    const opts = {
      allowSynchronousEvents: true,
      autoPong: true,
      closeTimeout: CLOSE_TIMEOUT,
      protocolVersion: protocolVersions[1],
      maxPayload: 100 * 1024 * 1024,
      skipUTF8Validation: false,
      perMessageDeflate: true,
      followRedirects: false,
      maxRedirects: 10,
      ...options,
      socketPath: void 0,
      hostname: void 0,
      protocol: void 0,
      timeout: void 0,
      method: "GET",
      host: void 0,
      path: void 0,
      port: void 0
    };
    websocket2._autoPong = opts.autoPong;
    websocket2._closeTimeout = opts.closeTimeout;
    if (!protocolVersions.includes(opts.protocolVersion)) {
      throw new RangeError(
        `Unsupported protocol version: ${opts.protocolVersion} (supported versions: ${protocolVersions.join(", ")})`
      );
    }
    let parsedUrl;
    if (address instanceof URL2) {
      parsedUrl = address;
    } else {
      try {
        parsedUrl = new URL2(address);
      } catch (e) {
        throw new SyntaxError(`Invalid URL: ${address}`);
      }
    }
    if (parsedUrl.protocol === "http:") {
      parsedUrl.protocol = "ws:";
    } else if (parsedUrl.protocol === "https:") {
      parsedUrl.protocol = "wss:";
    }
    websocket2._url = parsedUrl.href;
    const isSecure = parsedUrl.protocol === "wss:";
    const isIpcUrl = parsedUrl.protocol === "ws+unix:";
    let invalidUrlMessage;
    if (parsedUrl.protocol !== "ws:" && !isSecure && !isIpcUrl) {
      invalidUrlMessage = `The URL's protocol must be one of "ws:", "wss:", "http:", "https:", or "ws+unix:"`;
    } else if (isIpcUrl && !parsedUrl.pathname) {
      invalidUrlMessage = "The URL's pathname is empty";
    } else if (parsedUrl.hash) {
      invalidUrlMessage = "The URL contains a fragment identifier";
    }
    if (invalidUrlMessage) {
      const err = new SyntaxError(invalidUrlMessage);
      if (websocket2._redirects === 0) {
        throw err;
      } else {
        emitErrorAndClose(websocket2, err);
        return;
      }
    }
    const defaultPort2 = isSecure ? 443 : 80;
    const key = randomBytes2(16).toString("base64");
    const request = isSecure ? https.request : http2.request;
    const protocolSet = /* @__PURE__ */ new Set();
    let perMessageDeflate;
    opts.createConnection = opts.createConnection || (isSecure ? tlsConnect : netConnect);
    opts.defaultPort = opts.defaultPort || defaultPort2;
    opts.port = parsedUrl.port || defaultPort2;
    opts.host = parsedUrl.hostname.startsWith("[") ? parsedUrl.hostname.slice(1, -1) : parsedUrl.hostname;
    opts.headers = {
      ...opts.headers,
      "Sec-WebSocket-Version": opts.protocolVersion,
      "Sec-WebSocket-Key": key,
      Connection: "Upgrade",
      Upgrade: "websocket"
    };
    opts.path = parsedUrl.pathname + parsedUrl.search;
    opts.timeout = opts.handshakeTimeout;
    if (opts.perMessageDeflate) {
      perMessageDeflate = new PerMessageDeflate(
        opts.perMessageDeflate !== true ? opts.perMessageDeflate : {},
        false,
        opts.maxPayload
      );
      opts.headers["Sec-WebSocket-Extensions"] = format({
        [PerMessageDeflate.extensionName]: perMessageDeflate.offer()
      });
    }
    if (protocols.length) {
      for (const protocol of protocols) {
        if (typeof protocol !== "string" || !subprotocolRegex.test(protocol) || protocolSet.has(protocol)) {
          throw new SyntaxError(
            "An invalid or duplicated subprotocol was specified"
          );
        }
        protocolSet.add(protocol);
      }
      opts.headers["Sec-WebSocket-Protocol"] = protocols.join(",");
    }
    if (opts.origin) {
      if (opts.protocolVersion < 13) {
        opts.headers["Sec-WebSocket-Origin"] = opts.origin;
      } else {
        opts.headers.Origin = opts.origin;
      }
    }
    if (parsedUrl.username || parsedUrl.password) {
      opts.auth = `${parsedUrl.username}:${parsedUrl.password}`;
    }
    if (isIpcUrl) {
      const parts = opts.path.split(":");
      opts.socketPath = parts[0];
      opts.path = parts[1];
    }
    let req;
    if (opts.followRedirects) {
      if (websocket2._redirects === 0) {
        websocket2._originalIpc = isIpcUrl;
        websocket2._originalSecure = isSecure;
        websocket2._originalHostOrSocketPath = isIpcUrl ? opts.socketPath : parsedUrl.host;
        const headers = options && options.headers;
        options = { ...options, headers: {} };
        if (headers) {
          for (const [key2, value] of Object.entries(headers)) {
            options.headers[key2.toLowerCase()] = value;
          }
        }
      } else if (websocket2.listenerCount("redirect") === 0) {
        const isSameHost = isIpcUrl ? websocket2._originalIpc ? opts.socketPath === websocket2._originalHostOrSocketPath : false : websocket2._originalIpc ? false : parsedUrl.host === websocket2._originalHostOrSocketPath;
        if (!isSameHost || websocket2._originalSecure && !isSecure) {
          delete opts.headers.authorization;
          delete opts.headers.cookie;
          if (!isSameHost) delete opts.headers.host;
          opts.auth = void 0;
        }
      }
      if (opts.auth && !options.headers.authorization) {
        options.headers.authorization = "Basic " + Buffer.from(opts.auth).toString("base64");
      }
      req = websocket2._req = request(opts);
      if (websocket2._redirects) {
        websocket2.emit("redirect", websocket2.url, req);
      }
    } else {
      req = websocket2._req = request(opts);
    }
    if (opts.timeout) {
      req.on("timeout", () => {
        abortHandshake(websocket2, req, "Opening handshake has timed out");
      });
    }
    req.on("error", (err) => {
      if (req === null || req[kAborted]) return;
      req = websocket2._req = null;
      emitErrorAndClose(websocket2, err);
    });
    req.on("response", (res) => {
      const location = res.headers.location;
      const statusCode = res.statusCode;
      if (location && opts.followRedirects && statusCode >= 300 && statusCode < 400) {
        if (++websocket2._redirects > opts.maxRedirects) {
          abortHandshake(websocket2, req, "Maximum redirects exceeded");
          return;
        }
        req.abort();
        let addr;
        try {
          addr = new URL2(location, address);
        } catch (e) {
          const err = new SyntaxError(`Invalid URL: ${location}`);
          emitErrorAndClose(websocket2, err);
          return;
        }
        initAsClient(websocket2, addr, protocols, options);
      } else if (!websocket2.emit("unexpected-response", req, res)) {
        abortHandshake(
          websocket2,
          req,
          `Unexpected server response: ${res.statusCode}`
        );
      }
    });
    req.on("upgrade", (res, socket, head) => {
      websocket2.emit("upgrade", res);
      if (websocket2.readyState !== WebSocket.CONNECTING) return;
      req = websocket2._req = null;
      const upgrade = res.headers.upgrade;
      if (upgrade === void 0 || upgrade.toLowerCase() !== "websocket") {
        abortHandshake(websocket2, socket, "Invalid Upgrade header");
        return;
      }
      const digest = createHash("sha1").update(key + GUID).digest("base64");
      if (res.headers["sec-websocket-accept"] !== digest) {
        abortHandshake(websocket2, socket, "Invalid Sec-WebSocket-Accept header");
        return;
      }
      const serverProt = res.headers["sec-websocket-protocol"];
      let protError;
      if (serverProt !== void 0) {
        if (!protocolSet.size) {
          protError = "Server sent a subprotocol but none was requested";
        } else if (!protocolSet.has(serverProt)) {
          protError = "Server sent an invalid subprotocol";
        }
      } else if (protocolSet.size) {
        protError = "Server sent no subprotocol";
      }
      if (protError) {
        abortHandshake(websocket2, socket, protError);
        return;
      }
      if (serverProt) websocket2._protocol = serverProt;
      const secWebSocketExtensions = res.headers["sec-websocket-extensions"];
      if (secWebSocketExtensions !== void 0) {
        if (!perMessageDeflate) {
          const message = "Server sent a Sec-WebSocket-Extensions header but no extension was requested";
          abortHandshake(websocket2, socket, message);
          return;
        }
        let extensions;
        try {
          extensions = parse(secWebSocketExtensions);
        } catch (err) {
          const message = "Invalid Sec-WebSocket-Extensions header";
          abortHandshake(websocket2, socket, message);
          return;
        }
        const extensionNames = Object.keys(extensions);
        if (extensionNames.length !== 1 || extensionNames[0] !== PerMessageDeflate.extensionName) {
          const message = "Server indicated an extension that was not requested";
          abortHandshake(websocket2, socket, message);
          return;
        }
        try {
          perMessageDeflate.accept(extensions[PerMessageDeflate.extensionName]);
        } catch (err) {
          const message = "Invalid Sec-WebSocket-Extensions header";
          abortHandshake(websocket2, socket, message);
          return;
        }
        websocket2._extensions[PerMessageDeflate.extensionName] = perMessageDeflate;
      }
      websocket2.setSocket(socket, head, {
        allowSynchronousEvents: opts.allowSynchronousEvents,
        generateMask: opts.generateMask,
        maxPayload: opts.maxPayload,
        skipUTF8Validation: opts.skipUTF8Validation
      });
    });
    if (opts.finishRequest) {
      opts.finishRequest(req, websocket2);
    } else {
      req.end();
    }
  }
  function emitErrorAndClose(websocket2, err) {
    websocket2._readyState = WebSocket.CLOSING;
    websocket2._errorEmitted = true;
    websocket2.emit("error", err);
    websocket2.emitClose();
  }
  function netConnect(options) {
    options.path = options.socketPath;
    return net.connect(options);
  }
  function tlsConnect(options) {
    options.path = void 0;
    if (!options.servername && options.servername !== "") {
      options.servername = net.isIP(options.host) ? "" : options.host;
    }
    return tls.connect(options);
  }
  function abortHandshake(websocket2, stream2, message) {
    websocket2._readyState = WebSocket.CLOSING;
    const err = new Error(message);
    Error.captureStackTrace(err, abortHandshake);
    if (stream2.setHeader) {
      stream2[kAborted] = true;
      stream2.abort();
      if (stream2.socket && !stream2.socket.destroyed) {
        stream2.socket.destroy();
      }
      process.nextTick(emitErrorAndClose, websocket2, err);
    } else {
      stream2.destroy(err);
      stream2.once("error", websocket2.emit.bind(websocket2, "error"));
      stream2.once("close", websocket2.emitClose.bind(websocket2));
    }
  }
  function sendAfterClose(websocket2, data, cb) {
    if (data) {
      const length = isBlob(data) ? data.size : toBuffer(data).length;
      if (websocket2._socket) websocket2._sender._bufferedBytes += length;
      else websocket2._bufferedAmount += length;
    }
    if (cb) {
      const err = new Error(
        `WebSocket is not open: readyState ${websocket2.readyState} (${readyStates[websocket2.readyState]})`
      );
      process.nextTick(cb, err);
    }
  }
  function receiverOnConclude(code, reason) {
    const websocket2 = this[kWebSocket];
    websocket2._closeFrameReceived = true;
    websocket2._closeMessage = reason;
    websocket2._closeCode = code;
    if (websocket2._socket[kWebSocket] === void 0) return;
    websocket2._socket.removeListener("data", socketOnData);
    process.nextTick(resume, websocket2._socket);
    if (code === 1005) websocket2.close();
    else websocket2.close(code, reason);
  }
  function receiverOnDrain() {
    const websocket2 = this[kWebSocket];
    if (!websocket2.isPaused) websocket2._socket.resume();
  }
  function receiverOnError(err) {
    const websocket2 = this[kWebSocket];
    if (websocket2._socket[kWebSocket] !== void 0) {
      websocket2._socket.removeListener("data", socketOnData);
      process.nextTick(resume, websocket2._socket);
      websocket2.close(err[kStatusCode]);
    }
    if (!websocket2._errorEmitted) {
      websocket2._errorEmitted = true;
      websocket2.emit("error", err);
    }
  }
  function receiverOnFinish() {
    this[kWebSocket].emitClose();
  }
  function receiverOnMessage(data, isBinary) {
    this[kWebSocket].emit("message", data, isBinary);
  }
  function receiverOnPing(data) {
    const websocket2 = this[kWebSocket];
    if (websocket2._autoPong) websocket2.pong(data, !this._isServer, NOOP);
    websocket2.emit("ping", data);
  }
  function receiverOnPong(data) {
    this[kWebSocket].emit("pong", data);
  }
  function resume(stream2) {
    stream2.resume();
  }
  function senderOnError(err) {
    const websocket2 = this[kWebSocket];
    if (websocket2.readyState === WebSocket.CLOSED) return;
    if (websocket2.readyState === WebSocket.OPEN) {
      websocket2._readyState = WebSocket.CLOSING;
      setCloseTimer(websocket2);
    }
    this._socket.end();
    if (!websocket2._errorEmitted) {
      websocket2._errorEmitted = true;
      websocket2.emit("error", err);
    }
  }
  function setCloseTimer(websocket2) {
    websocket2._closeTimer = setTimeout(
      websocket2._socket.destroy.bind(websocket2._socket),
      websocket2._closeTimeout
    );
  }
  function socketOnClose() {
    const websocket2 = this[kWebSocket];
    this.removeListener("close", socketOnClose);
    this.removeListener("data", socketOnData);
    this.removeListener("end", socketOnEnd);
    websocket2._readyState = WebSocket.CLOSING;
    if (!this._readableState.endEmitted && !websocket2._closeFrameReceived && !websocket2._receiver._writableState.errorEmitted && this._readableState.length !== 0) {
      const chunk = this.read(this._readableState.length);
      websocket2._receiver.write(chunk);
    }
    websocket2._receiver.end();
    this[kWebSocket] = void 0;
    clearTimeout(websocket2._closeTimer);
    if (websocket2._receiver._writableState.finished || websocket2._receiver._writableState.errorEmitted) {
      websocket2.emitClose();
    } else {
      websocket2._receiver.on("error", receiverOnFinish);
      websocket2._receiver.on("finish", receiverOnFinish);
    }
  }
  function socketOnData(chunk) {
    if (!this[kWebSocket]._receiver.write(chunk)) {
      this.pause();
    }
  }
  function socketOnEnd() {
    const websocket2 = this[kWebSocket];
    websocket2._readyState = WebSocket.CLOSING;
    websocket2._receiver.end();
    this.end();
  }
  function socketOnError() {
    const websocket2 = this[kWebSocket];
    this.removeListener("error", socketOnError);
    this.on("error", NOOP);
    if (websocket2) {
      websocket2._readyState = WebSocket.CLOSING;
      this.destroy();
    }
  }
  return websocket;
}
var stream;
var hasRequiredStream;
function requireStream() {
  if (hasRequiredStream) return stream;
  hasRequiredStream = 1;
  requireWebsocket();
  const { Duplex } = require$$0$4;
  function emitClose(stream2) {
    stream2.emit("close");
  }
  function duplexOnEnd() {
    if (!this.destroyed && this._writableState.finished) {
      this.destroy();
    }
  }
  function duplexOnError(err) {
    this.removeListener("error", duplexOnError);
    this.destroy();
    if (this.listenerCount("error") === 0) {
      this.emit("error", err);
    }
  }
  function createWebSocketStream(ws2, options) {
    let terminateOnDestroy = true;
    const duplex = new Duplex({
      ...options,
      autoDestroy: false,
      emitClose: false,
      objectMode: false,
      writableObjectMode: false
    });
    ws2.on("message", function message(msg, isBinary) {
      const data = !isBinary && duplex._readableState.objectMode ? msg.toString() : msg;
      if (!duplex.push(data)) ws2.pause();
    });
    ws2.once("error", function error(err) {
      if (duplex.destroyed) return;
      terminateOnDestroy = false;
      duplex.destroy(err);
    });
    ws2.once("close", function close() {
      if (duplex.destroyed) return;
      duplex.push(null);
    });
    duplex._destroy = function(err, callback) {
      if (ws2.readyState === ws2.CLOSED) {
        callback(err);
        process.nextTick(emitClose, duplex);
        return;
      }
      let called = false;
      ws2.once("error", function error(err2) {
        called = true;
        callback(err2);
      });
      ws2.once("close", function close() {
        if (!called) callback(err);
        process.nextTick(emitClose, duplex);
      });
      if (terminateOnDestroy) ws2.terminate();
    };
    duplex._final = function(callback) {
      if (ws2.readyState === ws2.CONNECTING) {
        ws2.once("open", function open() {
          duplex._final(callback);
        });
        return;
      }
      if (ws2._socket === null) return;
      if (ws2._socket._writableState.finished) {
        callback();
        if (duplex._readableState.endEmitted) duplex.destroy();
      } else {
        ws2._socket.once("finish", function finish() {
          callback();
        });
        ws2.close();
      }
    };
    duplex._read = function() {
      if (ws2.isPaused) ws2.resume();
    };
    duplex._write = function(chunk, encoding, callback) {
      if (ws2.readyState === ws2.CONNECTING) {
        ws2.once("open", function open() {
          duplex._write(chunk, encoding, callback);
        });
        return;
      }
      ws2.send(chunk, callback);
    };
    duplex.on("end", duplexOnEnd);
    duplex.on("error", duplexOnError);
    return duplex;
  }
  stream = createWebSocketStream;
  return stream;
}
var subprotocol;
var hasRequiredSubprotocol;
function requireSubprotocol() {
  if (hasRequiredSubprotocol) return subprotocol;
  hasRequiredSubprotocol = 1;
  const { tokenChars } = requireValidation();
  function parse(header) {
    const protocols = /* @__PURE__ */ new Set();
    let start = -1;
    let end = -1;
    let i = 0;
    for (i; i < header.length; i++) {
      const code = header.charCodeAt(i);
      if (end === -1 && tokenChars[code] === 1) {
        if (start === -1) start = i;
      } else if (i !== 0 && (code === 32 || code === 9)) {
        if (end === -1 && start !== -1) end = i;
      } else if (code === 44) {
        if (start === -1) {
          throw new SyntaxError(`Unexpected character at index ${i}`);
        }
        if (end === -1) end = i;
        const protocol2 = header.slice(start, end);
        if (protocols.has(protocol2)) {
          throw new SyntaxError(`The "${protocol2}" subprotocol is duplicated`);
        }
        protocols.add(protocol2);
        start = end = -1;
      } else {
        throw new SyntaxError(`Unexpected character at index ${i}`);
      }
    }
    if (start === -1 || end !== -1) {
      throw new SyntaxError("Unexpected end of input");
    }
    const protocol = header.slice(start, i);
    if (protocols.has(protocol)) {
      throw new SyntaxError(`The "${protocol}" subprotocol is duplicated`);
    }
    protocols.add(protocol);
    return protocols;
  }
  subprotocol = { parse };
  return subprotocol;
}
var websocketServer;
var hasRequiredWebsocketServer;
function requireWebsocketServer() {
  if (hasRequiredWebsocketServer) return websocketServer;
  hasRequiredWebsocketServer = 1;
  const EventEmitter = require$$0$5;
  const http2 = require$$2$1;
  const { Duplex } = require$$0$4;
  const { createHash } = require$$1$1;
  const extension2 = requireExtension();
  const PerMessageDeflate = requirePermessageDeflate();
  const subprotocol2 = requireSubprotocol();
  const WebSocket = requireWebsocket();
  const { CLOSE_TIMEOUT, GUID, kWebSocket } = requireConstants();
  const keyRegex = /^[+/0-9A-Za-z]{22}==$/;
  const RUNNING = 0;
  const CLOSING = 1;
  const CLOSED = 2;
  class WebSocketServer extends EventEmitter {
    /**
     * Create a `WebSocketServer` instance.
     *
     * @param {Object} options Configuration options
     * @param {Boolean} [options.allowSynchronousEvents=true] Specifies whether
     *     any of the `'message'`, `'ping'`, and `'pong'` events can be emitted
     *     multiple times in the same tick
     * @param {Boolean} [options.autoPong=true] Specifies whether or not to
     *     automatically send a pong in response to a ping
     * @param {Number} [options.backlog=511] The maximum length of the queue of
     *     pending connections
     * @param {Boolean} [options.clientTracking=true] Specifies whether or not to
     *     track clients
     * @param {Number} [options.closeTimeout=30000] Duration in milliseconds to
     *     wait for the closing handshake to finish after `websocket.close()` is
     *     called
     * @param {Function} [options.handleProtocols] A hook to handle protocols
     * @param {String} [options.host] The hostname where to bind the server
     * @param {Number} [options.maxPayload=104857600] The maximum allowed message
     *     size
     * @param {Boolean} [options.noServer=false] Enable no server mode
     * @param {String} [options.path] Accept only connections matching this path
     * @param {(Boolean|Object)} [options.perMessageDeflate=false] Enable/disable
     *     permessage-deflate
     * @param {Number} [options.port] The port where to bind the server
     * @param {(http.Server|https.Server)} [options.server] A pre-created HTTP/S
     *     server to use
     * @param {Boolean} [options.skipUTF8Validation=false] Specifies whether or
     *     not to skip UTF-8 validation for text and close messages
     * @param {Function} [options.verifyClient] A hook to reject connections
     * @param {Function} [options.WebSocket=WebSocket] Specifies the `WebSocket`
     *     class to use. It must be the `WebSocket` class or class that extends it
     * @param {Function} [callback] A listener for the `listening` event
     */
    constructor(options, callback) {
      super();
      options = {
        allowSynchronousEvents: true,
        autoPong: true,
        maxPayload: 100 * 1024 * 1024,
        skipUTF8Validation: false,
        perMessageDeflate: false,
        handleProtocols: null,
        clientTracking: true,
        closeTimeout: CLOSE_TIMEOUT,
        verifyClient: null,
        noServer: false,
        backlog: null,
        // use default (511 as implemented in net.js)
        server: null,
        host: null,
        path: null,
        port: null,
        WebSocket,
        ...options
      };
      if (options.port == null && !options.server && !options.noServer || options.port != null && (options.server || options.noServer) || options.server && options.noServer) {
        throw new TypeError(
          'One and only one of the "port", "server", or "noServer" options must be specified'
        );
      }
      if (options.port != null) {
        this._server = http2.createServer((req, res) => {
          const body = http2.STATUS_CODES[426];
          res.writeHead(426, {
            "Content-Length": body.length,
            "Content-Type": "text/plain"
          });
          res.end(body);
        });
        this._server.listen(
          options.port,
          options.host,
          options.backlog,
          callback
        );
      } else if (options.server) {
        this._server = options.server;
      }
      if (this._server) {
        const emitConnection = this.emit.bind(this, "connection");
        this._removeListeners = addListeners(this._server, {
          listening: this.emit.bind(this, "listening"),
          error: this.emit.bind(this, "error"),
          upgrade: (req, socket, head) => {
            this.handleUpgrade(req, socket, head, emitConnection);
          }
        });
      }
      if (options.perMessageDeflate === true) options.perMessageDeflate = {};
      if (options.clientTracking) {
        this.clients = /* @__PURE__ */ new Set();
        this._shouldEmitClose = false;
      }
      this.options = options;
      this._state = RUNNING;
    }
    /**
     * Returns the bound address, the address family name, and port of the server
     * as reported by the operating system if listening on an IP socket.
     * If the server is listening on a pipe or UNIX domain socket, the name is
     * returned as a string.
     *
     * @return {(Object|String|null)} The address of the server
     * @public
     */
    address() {
      if (this.options.noServer) {
        throw new Error('The server is operating in "noServer" mode');
      }
      if (!this._server) return null;
      return this._server.address();
    }
    /**
     * Stop the server from accepting new connections and emit the `'close'` event
     * when all existing connections are closed.
     *
     * @param {Function} [cb] A one-time listener for the `'close'` event
     * @public
     */
    close(cb) {
      if (this._state === CLOSED) {
        if (cb) {
          this.once("close", () => {
            cb(new Error("The server is not running"));
          });
        }
        process.nextTick(emitClose, this);
        return;
      }
      if (cb) this.once("close", cb);
      if (this._state === CLOSING) return;
      this._state = CLOSING;
      if (this.options.noServer || this.options.server) {
        if (this._server) {
          this._removeListeners();
          this._removeListeners = this._server = null;
        }
        if (this.clients) {
          if (!this.clients.size) {
            process.nextTick(emitClose, this);
          } else {
            this._shouldEmitClose = true;
          }
        } else {
          process.nextTick(emitClose, this);
        }
      } else {
        const server = this._server;
        this._removeListeners();
        this._removeListeners = this._server = null;
        server.close(() => {
          emitClose(this);
        });
      }
    }
    /**
     * See if a given request should be handled by this server instance.
     *
     * @param {http.IncomingMessage} req Request object to inspect
     * @return {Boolean} `true` if the request is valid, else `false`
     * @public
     */
    shouldHandle(req) {
      if (this.options.path) {
        const index = req.url.indexOf("?");
        const pathname = index !== -1 ? req.url.slice(0, index) : req.url;
        if (pathname !== this.options.path) return false;
      }
      return true;
    }
    /**
     * Handle a HTTP Upgrade request.
     *
     * @param {http.IncomingMessage} req The request object
     * @param {Duplex} socket The network socket between the server and client
     * @param {Buffer} head The first packet of the upgraded stream
     * @param {Function} cb Callback
     * @public
     */
    handleUpgrade(req, socket, head, cb) {
      socket.on("error", socketOnError);
      const key = req.headers["sec-websocket-key"];
      const upgrade = req.headers.upgrade;
      const version2 = +req.headers["sec-websocket-version"];
      if (req.method !== "GET") {
        const message = "Invalid HTTP method";
        abortHandshakeOrEmitwsClientError(this, req, socket, 405, message);
        return;
      }
      if (upgrade === void 0 || upgrade.toLowerCase() !== "websocket") {
        const message = "Invalid Upgrade header";
        abortHandshakeOrEmitwsClientError(this, req, socket, 400, message);
        return;
      }
      if (key === void 0 || !keyRegex.test(key)) {
        const message = "Missing or invalid Sec-WebSocket-Key header";
        abortHandshakeOrEmitwsClientError(this, req, socket, 400, message);
        return;
      }
      if (version2 !== 13 && version2 !== 8) {
        const message = "Missing or invalid Sec-WebSocket-Version header";
        abortHandshakeOrEmitwsClientError(this, req, socket, 400, message, {
          "Sec-WebSocket-Version": "13, 8"
        });
        return;
      }
      if (!this.shouldHandle(req)) {
        abortHandshake(socket, 400);
        return;
      }
      const secWebSocketProtocol = req.headers["sec-websocket-protocol"];
      let protocols = /* @__PURE__ */ new Set();
      if (secWebSocketProtocol !== void 0) {
        try {
          protocols = subprotocol2.parse(secWebSocketProtocol);
        } catch (err) {
          const message = "Invalid Sec-WebSocket-Protocol header";
          abortHandshakeOrEmitwsClientError(this, req, socket, 400, message);
          return;
        }
      }
      const secWebSocketExtensions = req.headers["sec-websocket-extensions"];
      const extensions = {};
      if (this.options.perMessageDeflate && secWebSocketExtensions !== void 0) {
        const perMessageDeflate = new PerMessageDeflate(
          this.options.perMessageDeflate,
          true,
          this.options.maxPayload
        );
        try {
          const offers = extension2.parse(secWebSocketExtensions);
          if (offers[PerMessageDeflate.extensionName]) {
            perMessageDeflate.accept(offers[PerMessageDeflate.extensionName]);
            extensions[PerMessageDeflate.extensionName] = perMessageDeflate;
          }
        } catch (err) {
          const message = "Invalid or unacceptable Sec-WebSocket-Extensions header";
          abortHandshakeOrEmitwsClientError(this, req, socket, 400, message);
          return;
        }
      }
      if (this.options.verifyClient) {
        const info = {
          origin: req.headers[`${version2 === 8 ? "sec-websocket-origin" : "origin"}`],
          secure: !!(req.socket.authorized || req.socket.encrypted),
          req
        };
        if (this.options.verifyClient.length === 2) {
          this.options.verifyClient(info, (verified, code, message, headers) => {
            if (!verified) {
              return abortHandshake(socket, code || 401, message, headers);
            }
            this.completeUpgrade(
              extensions,
              key,
              protocols,
              req,
              socket,
              head,
              cb
            );
          });
          return;
        }
        if (!this.options.verifyClient(info)) return abortHandshake(socket, 401);
      }
      this.completeUpgrade(extensions, key, protocols, req, socket, head, cb);
    }
    /**
     * Upgrade the connection to WebSocket.
     *
     * @param {Object} extensions The accepted extensions
     * @param {String} key The value of the `Sec-WebSocket-Key` header
     * @param {Set} protocols The subprotocols
     * @param {http.IncomingMessage} req The request object
     * @param {Duplex} socket The network socket between the server and client
     * @param {Buffer} head The first packet of the upgraded stream
     * @param {Function} cb Callback
     * @throws {Error} If called more than once with the same socket
     * @private
     */
    completeUpgrade(extensions, key, protocols, req, socket, head, cb) {
      if (!socket.readable || !socket.writable) return socket.destroy();
      if (socket[kWebSocket]) {
        throw new Error(
          "server.handleUpgrade() was called more than once with the same socket, possibly due to a misconfiguration"
        );
      }
      if (this._state > RUNNING) return abortHandshake(socket, 503);
      const digest = createHash("sha1").update(key + GUID).digest("base64");
      const headers = [
        "HTTP/1.1 101 Switching Protocols",
        "Upgrade: websocket",
        "Connection: Upgrade",
        `Sec-WebSocket-Accept: ${digest}`
      ];
      const ws2 = new this.options.WebSocket(null, void 0, this.options);
      if (protocols.size) {
        const protocol = this.options.handleProtocols ? this.options.handleProtocols(protocols, req) : protocols.values().next().value;
        if (protocol) {
          headers.push(`Sec-WebSocket-Protocol: ${protocol}`);
          ws2._protocol = protocol;
        }
      }
      if (extensions[PerMessageDeflate.extensionName]) {
        const params = extensions[PerMessageDeflate.extensionName].params;
        const value = extension2.format({
          [PerMessageDeflate.extensionName]: [params]
        });
        headers.push(`Sec-WebSocket-Extensions: ${value}`);
        ws2._extensions = extensions;
      }
      this.emit("headers", headers, req);
      socket.write(headers.concat("\r\n").join("\r\n"));
      socket.removeListener("error", socketOnError);
      ws2.setSocket(socket, head, {
        allowSynchronousEvents: this.options.allowSynchronousEvents,
        maxPayload: this.options.maxPayload,
        skipUTF8Validation: this.options.skipUTF8Validation
      });
      if (this.clients) {
        this.clients.add(ws2);
        ws2.on("close", () => {
          this.clients.delete(ws2);
          if (this._shouldEmitClose && !this.clients.size) {
            process.nextTick(emitClose, this);
          }
        });
      }
      cb(ws2, req);
    }
  }
  websocketServer = WebSocketServer;
  function addListeners(server, map) {
    for (const event of Object.keys(map)) server.on(event, map[event]);
    return function removeListeners() {
      for (const event of Object.keys(map)) {
        server.removeListener(event, map[event]);
      }
    };
  }
  function emitClose(server) {
    server._state = CLOSED;
    server.emit("close");
  }
  function socketOnError() {
    this.destroy();
  }
  function abortHandshake(socket, code, message, headers) {
    message = message || http2.STATUS_CODES[code];
    headers = {
      Connection: "close",
      "Content-Type": "text/html",
      "Content-Length": Buffer.byteLength(message),
      ...headers
    };
    socket.once("finish", socket.destroy);
    socket.end(
      `HTTP/1.1 ${code} ${http2.STATUS_CODES[code]}\r
` + Object.keys(headers).map((h) => `${h}: ${headers[h]}`).join("\r\n") + "\r\n\r\n" + message
    );
  }
  function abortHandshakeOrEmitwsClientError(server, req, socket, code, message, headers) {
    if (server.listenerCount("wsClientError")) {
      const err = new Error(message);
      Error.captureStackTrace(err, abortHandshakeOrEmitwsClientError);
      server.emit("wsClientError", err, socket, req);
    } else {
      abortHandshake(socket, code, message, headers);
    }
  }
  return websocketServer;
}
var ws;
var hasRequiredWs;
function requireWs() {
  if (hasRequiredWs) return ws;
  hasRequiredWs = 1;
  const WebSocket = requireWebsocket();
  WebSocket.createWebSocketStream = requireStream();
  WebSocket.Server = requireWebsocketServer();
  WebSocket.Receiver = requireReceiver();
  WebSocket.Sender = requireSender();
  WebSocket.WebSocket = WebSocket;
  WebSocket.WebSocketServer = WebSocket.Server;
  ws = WebSocket;
  return ws;
}
var config = {};
var url = {};
var hasRequiredUrl;
function requireUrl() {
  if (hasRequiredUrl) return url;
  hasRequiredUrl = 1;
  Object.defineProperty(url, "__esModule", { value: true });
  url.pathToFunc = pathToFunc;
  const hasOwn = Object.prototype.hasOwnProperty;
  function pathToFunc(pathPattern, options) {
    const paramRE = /\{([a-zA-Z0-9_][a-zA-Z0-9_-]*?)\}/g;
    return function buildURLPath(params = {}) {
      return pathPattern.replace(paramRE, function(_, placeholder) {
        if (!hasOwn.call(params, placeholder)) {
          throw new Error(`Parameter '${placeholder}' is required`);
        }
        const value = params[placeholder];
        if (typeof value !== "string" && typeof value !== "number") {
          throw new Error(`Parameter '${placeholder}' must be a string or number`);
        }
        return options?.charEncoding === "percent" ? encodeURIComponent(`${value}`) : `${value}`;
      });
    };
  }
  return url;
}
var hasRequiredConfig;
function requireConfig() {
  if (hasRequiredConfig) return config;
  hasRequiredConfig = 1;
  (function(exports$1) {
    Object.defineProperty(exports$1, "__esModule", { value: true });
    exports$1.SDK_METADATA = exports$1.ServerList = exports$1.ServerEu = void 0;
    exports$1.serverURLFromOptions = serverURLFromOptions;
    const url_js_1 = /* @__PURE__ */ requireUrl();
    exports$1.ServerEu = "eu";
    exports$1.ServerList = {
      [exports$1.ServerEu]: "https://api.mistral.ai"
    };
    function serverURLFromOptions(options) {
      let serverURL = options.serverURL;
      const params = {};
      if (!serverURL) {
        const server = options.server ?? exports$1.ServerEu;
        serverURL = exports$1.ServerList[server] || "";
      }
      const u = (0, url_js_1.pathToFunc)(serverURL)(params);
      return new URL(u);
    }
    exports$1.SDK_METADATA = {
      language: "typescript",
      openapiDocVersion: "1.0.0",
      sdkVersion: "1.14.0",
      genVersion: "2.797.1",
      userAgent: "speakeasy-sdk/typescript 1.14.0 2.797.1 1.0.0 @mistralai/mistralai"
    };
  })(config);
  return config;
}
var sdks = {};
var hooks = {};
var registration = {};
var custom_user_agent = {};
var hasRequiredCustom_user_agent;
function requireCustom_user_agent() {
  if (hasRequiredCustom_user_agent) return custom_user_agent;
  hasRequiredCustom_user_agent = 1;
  Object.defineProperty(custom_user_agent, "__esModule", { value: true });
  custom_user_agent.CustomUserAgentHook = void 0;
  const config_1 = /* @__PURE__ */ requireConfig();
  class CustomUserAgentHook {
    beforeRequest(_, request) {
      const version2 = config_1.SDK_METADATA.sdkVersion;
      const ua = `mistral-client-typescript/${version2}`;
      request.headers.set("user-agent", ua);
      if (!request.headers.get("user-agent")) {
        request.headers.set("x-mistral-user-agent", ua);
      }
      return request;
    }
  }
  custom_user_agent.CustomUserAgentHook = CustomUserAgentHook;
  return custom_user_agent;
}
var deprecation_warning = {};
var hasRequiredDeprecation_warning;
function requireDeprecation_warning() {
  if (hasRequiredDeprecation_warning) return deprecation_warning;
  hasRequiredDeprecation_warning = 1;
  Object.defineProperty(deprecation_warning, "__esModule", { value: true });
  deprecation_warning.DeprecationWarningHook = void 0;
  const HEADER_MODEL_DEPRECATION_TIMESTAMP = "x-model-deprecation-timestamp";
  class DeprecationWarningHook {
    afterSuccess(_, response) {
      if (response.headers.has(HEADER_MODEL_DEPRECATION_TIMESTAMP)) {
        response.clone().json().then((body) => {
          const model = body.model;
          console.warn(`WARNING: The model ${model} is deprecated and will be removed on ${response.headers.get(HEADER_MODEL_DEPRECATION_TIMESTAMP)}. Please refer to https://docs.mistral.ai/getting-started/models/#api-versioning for more information.`);
        });
      }
      return response;
    }
  }
  deprecation_warning.DeprecationWarningHook = DeprecationWarningHook;
  return deprecation_warning;
}
var hasRequiredRegistration;
function requireRegistration() {
  if (hasRequiredRegistration) return registration;
  hasRequiredRegistration = 1;
  Object.defineProperty(registration, "__esModule", { value: true });
  registration.initHooks = initHooks;
  const custom_user_agent_1 = /* @__PURE__ */ requireCustom_user_agent();
  const deprecation_warning_1 = /* @__PURE__ */ requireDeprecation_warning();
  function initHooks(hooks2) {
    const customUserAgentHook = new custom_user_agent_1.CustomUserAgentHook();
    hooks2.registerBeforeRequestHook(customUserAgentHook);
    const deprecationWarningHook = new deprecation_warning_1.DeprecationWarningHook();
    hooks2.registerAfterSuccessHook(deprecationWarningHook);
  }
  return registration;
}
var hasRequiredHooks;
function requireHooks() {
  if (hasRequiredHooks) return hooks;
  hasRequiredHooks = 1;
  Object.defineProperty(hooks, "__esModule", { value: true });
  hooks.SDKHooks = void 0;
  const registration_js_1 = /* @__PURE__ */ requireRegistration();
  class SDKHooks {
    constructor() {
      this.sdkInitHooks = [];
      this.beforeCreateRequestHooks = [];
      this.beforeRequestHooks = [];
      this.afterSuccessHooks = [];
      this.afterErrorHooks = [];
      const presetHooks = [];
      for (const hook of presetHooks) {
        if ("sdkInit" in hook) {
          this.registerSDKInitHook(hook);
        }
        if ("beforeCreateRequest" in hook) {
          this.registerBeforeCreateRequestHook(hook);
        }
        if ("beforeRequest" in hook) {
          this.registerBeforeRequestHook(hook);
        }
        if ("afterSuccess" in hook) {
          this.registerAfterSuccessHook(hook);
        }
        if ("afterError" in hook) {
          this.registerAfterErrorHook(hook);
        }
      }
      (0, registration_js_1.initHooks)(this);
    }
    registerSDKInitHook(hook) {
      this.sdkInitHooks.push(hook);
    }
    registerBeforeCreateRequestHook(hook) {
      this.beforeCreateRequestHooks.push(hook);
    }
    registerBeforeRequestHook(hook) {
      this.beforeRequestHooks.push(hook);
    }
    registerAfterSuccessHook(hook) {
      this.afterSuccessHooks.push(hook);
    }
    registerAfterErrorHook(hook) {
      this.afterErrorHooks.push(hook);
    }
    sdkInit(opts) {
      return this.sdkInitHooks.reduce((opts2, hook) => hook.sdkInit(opts2), opts);
    }
    beforeCreateRequest(hookCtx, input) {
      let inp = input;
      for (const hook of this.beforeCreateRequestHooks) {
        inp = hook.beforeCreateRequest(hookCtx, inp);
      }
      return inp;
    }
    async beforeRequest(hookCtx, request) {
      let req = request;
      for (const hook of this.beforeRequestHooks) {
        req = await hook.beforeRequest(hookCtx, req);
      }
      return req;
    }
    async afterSuccess(hookCtx, response) {
      let res = response;
      for (const hook of this.afterSuccessHooks) {
        res = await hook.afterSuccess(hookCtx, res);
      }
      return res;
    }
    async afterError(hookCtx, response, error) {
      let res = response;
      let err = error;
      for (const hook of this.afterErrorHooks) {
        const result = await hook.afterError(hookCtx, res, err);
        res = result.response;
        err = result.error;
      }
      return { response: res, error: err };
    }
  }
  hooks.SDKHooks = SDKHooks;
  return hooks;
}
var httpclienterrors = {};
var hasRequiredHttpclienterrors;
function requireHttpclienterrors() {
  if (hasRequiredHttpclienterrors) return httpclienterrors;
  hasRequiredHttpclienterrors = 1;
  Object.defineProperty(httpclienterrors, "__esModule", { value: true });
  httpclienterrors.ConnectionError = httpclienterrors.RequestTimeoutError = httpclienterrors.RequestAbortedError = httpclienterrors.InvalidRequestError = httpclienterrors.UnexpectedClientError = httpclienterrors.HTTPClientError = void 0;
  class HTTPClientError extends Error {
    constructor(message, opts) {
      let msg = message;
      if (opts?.cause) {
        msg += `: ${opts.cause}`;
      }
      super(msg, opts);
      this.name = "HTTPClientError";
      if (typeof this.cause === "undefined") {
        this.cause = opts?.cause;
      }
    }
  }
  httpclienterrors.HTTPClientError = HTTPClientError;
  class UnexpectedClientError extends HTTPClientError {
    constructor() {
      super(...arguments);
      this.name = "UnexpectedClientError";
    }
  }
  httpclienterrors.UnexpectedClientError = UnexpectedClientError;
  class InvalidRequestError extends HTTPClientError {
    constructor() {
      super(...arguments);
      this.name = "InvalidRequestError";
    }
  }
  httpclienterrors.InvalidRequestError = InvalidRequestError;
  class RequestAbortedError extends HTTPClientError {
    constructor() {
      super(...arguments);
      this.name = "RequestAbortedError";
    }
  }
  httpclienterrors.RequestAbortedError = RequestAbortedError;
  class RequestTimeoutError extends HTTPClientError {
    constructor() {
      super(...arguments);
      this.name = "RequestTimeoutError";
    }
  }
  httpclienterrors.RequestTimeoutError = RequestTimeoutError;
  class ConnectionError extends HTTPClientError {
    constructor() {
      super(...arguments);
      this.name = "ConnectionError";
    }
  }
  httpclienterrors.ConnectionError = ConnectionError;
  return httpclienterrors;
}
var base64 = {};
var hasRequiredBase64;
function requireBase64() {
  if (hasRequiredBase64) return base64;
  hasRequiredBase64 = 1;
  var __createBinding = base64 && base64.__createBinding || (Object.create ? (function(o, m, k, k2) {
    if (k2 === void 0) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() {
        return m[k];
      } };
    }
    Object.defineProperty(o, k2, desc);
  }) : (function(o, m, k, k2) {
    if (k2 === void 0) k2 = k;
    o[k2] = m[k];
  }));
  var __setModuleDefault = base64 && base64.__setModuleDefault || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
  }) : function(o, v) {
    o["default"] = v;
  });
  var __importStar = base64 && base64.__importStar || /* @__PURE__ */ (function() {
    var ownKeys = function(o) {
      ownKeys = Object.getOwnPropertyNames || function(o2) {
        var ar = [];
        for (var k in o2) if (Object.prototype.hasOwnProperty.call(o2, k)) ar[ar.length] = k;
        return ar;
      };
      return ownKeys(o);
    };
    return function(mod) {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null) {
        for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
      }
      __setModuleDefault(result, mod);
      return result;
    };
  })();
  Object.defineProperty(base64, "__esModule", { value: true });
  base64.zodInbound = base64.zodOutbound = void 0;
  base64.bytesToBase64 = bytesToBase64;
  base64.bytesFromBase64 = bytesFromBase64;
  base64.stringToBytes = stringToBytes;
  base64.stringFromBytes = stringFromBytes;
  base64.stringToBase64 = stringToBase64;
  base64.stringFromBase64 = stringFromBase64;
  const z = __importStar(/* @__PURE__ */ requireV3());
  function bytesToBase64(u8arr) {
    return btoa(String.fromCodePoint(...u8arr));
  }
  function bytesFromBase64(encoded) {
    return Uint8Array.from(atob(encoded), (c) => c.charCodeAt(0));
  }
  function stringToBytes(str) {
    return new TextEncoder().encode(str);
  }
  function stringFromBytes(u8arr) {
    return new TextDecoder().decode(u8arr);
  }
  function stringToBase64(str) {
    return bytesToBase64(stringToBytes(str));
  }
  function stringFromBase64(b64str) {
    return stringFromBytes(bytesFromBase64(b64str));
  }
  base64.zodOutbound = z.instanceof(Uint8Array).or(z.string().transform(stringToBytes));
  base64.zodInbound = z.instanceof(Uint8Array).or(z.string().transform(bytesFromBase64));
  return base64;
}
var encodings = {};
var isPlainObject = {};
var hasRequiredIsPlainObject;
function requireIsPlainObject() {
  if (hasRequiredIsPlainObject) return isPlainObject;
  hasRequiredIsPlainObject = 1;
  Object.defineProperty(isPlainObject, "__esModule", { value: true });
  isPlainObject.isPlainObject = isPlainObject$1;
  function isPlainObject$1(value) {
    if (typeof value !== "object" || value === null) {
      return false;
    }
    const prototype = Object.getPrototypeOf(value);
    return (prototype === null || prototype === Object.prototype || Object.getPrototypeOf(prototype) === null) && !(Symbol.toStringTag in value) && !(Symbol.iterator in value);
  }
  return isPlainObject;
}
var hasRequiredEncodings;
function requireEncodings() {
  if (hasRequiredEncodings) return encodings;
  hasRequiredEncodings = 1;
  (function(exports$1) {
    Object.defineProperty(exports$1, "__esModule", { value: true });
    exports$1.encodeDeepObjectQuery = exports$1.encodePipeDelimitedQuery = exports$1.encodeSpaceDelimitedQuery = exports$1.encodeFormQuery = exports$1.encodeJSONQuery = exports$1.encodeSimple = exports$1.encodePipeDelimited = exports$1.encodeSpaceDelimited = exports$1.encodeForm = exports$1.EncodingError = void 0;
    exports$1.encodeMatrix = encodeMatrix;
    exports$1.encodeLabel = encodeLabel;
    exports$1.encodeBodyForm = encodeBodyForm;
    exports$1.encodeDeepObject = encodeDeepObject;
    exports$1.encodeDeepObjectObject = encodeDeepObjectObject;
    exports$1.encodeJSON = encodeJSON;
    exports$1.queryJoin = queryJoin;
    exports$1.queryEncoder = queryEncoder;
    exports$1.appendForm = appendForm;
    const base64_js_1 = /* @__PURE__ */ requireBase64();
    const is_plain_object_js_1 = /* @__PURE__ */ requireIsPlainObject();
    class EncodingError extends Error {
      constructor(message) {
        super(message);
        this.name = "EncodingError";
      }
    }
    exports$1.EncodingError = EncodingError;
    function encodeMatrix(key, value, options) {
      let out = "";
      const pairs = options?.explode ? explode(key, value) : [[key, value]];
      if (pairs.every(([_, v]) => v == null)) {
        return;
      }
      const encodeString = (v) => {
        return options?.charEncoding === "percent" ? encodeURIComponent(v) : v;
      };
      const encodeValue = (v) => encodeString(serializeValue(v));
      pairs.forEach(([pk, pv]) => {
        let tmp = "";
        let encValue = null;
        if (pv == null) {
          return;
        } else if (Array.isArray(pv)) {
          encValue = mapDefined(pv, (v) => `${encodeValue(v)}`)?.join(",");
        } else if ((0, is_plain_object_js_1.isPlainObject)(pv)) {
          const mapped = mapDefinedEntries(Object.entries(pv), ([k, v]) => {
            return `,${encodeString(k)},${encodeValue(v)}`;
          });
          encValue = mapped?.join("").slice(1);
        } else {
          encValue = `${encodeValue(pv)}`;
        }
        if (encValue == null) {
          return;
        }
        const keyPrefix = encodeString(pk);
        tmp = `${keyPrefix}=${encValue}`;
        if (tmp === `${keyPrefix}=`) {
          tmp = tmp.slice(0, -1);
        }
        if (!tmp) {
          return;
        }
        out += `;${tmp}`;
      });
      return out;
    }
    function encodeLabel(key, value, options) {
      let out = "";
      const pairs = options?.explode ? explode(key, value) : [[key, value]];
      if (pairs.every(([_, v]) => v == null)) {
        return;
      }
      const encodeString = (v) => {
        return options?.charEncoding === "percent" ? encodeURIComponent(v) : v;
      };
      const encodeValue = (v) => encodeString(serializeValue(v));
      pairs.forEach(([pk, pv]) => {
        let encValue = "";
        if (pv == null) {
          return;
        } else if (Array.isArray(pv)) {
          encValue = mapDefined(pv, (v) => `${encodeValue(v)}`)?.join(".");
        } else if ((0, is_plain_object_js_1.isPlainObject)(pv)) {
          const mapped = mapDefinedEntries(Object.entries(pv), ([k, v]) => {
            return `.${encodeString(k)}.${encodeValue(v)}`;
          });
          encValue = mapped?.join("").slice(1);
        } else {
          const k = options?.explode && (0, is_plain_object_js_1.isPlainObject)(value) ? `${encodeString(pk)}=` : "";
          encValue = `${k}${encodeValue(pv)}`;
        }
        out += encValue == null ? "" : `.${encValue}`;
      });
      return out;
    }
    function formEncoder(sep) {
      return (key, value, options) => {
        let out = "";
        const pairs = options?.explode ? explode(key, value) : [[key, value]];
        if (pairs.every(([_, v]) => v == null)) {
          return;
        }
        const encodeString = (v) => {
          return options?.charEncoding === "percent" ? encodeURIComponent(v) : v;
        };
        const encodeValue = (v) => encodeString(serializeValue(v));
        const encodedSep = encodeString(sep);
        pairs.forEach(([pk, pv]) => {
          let tmp = "";
          let encValue = null;
          if (pv == null) {
            return;
          } else if (Array.isArray(pv)) {
            encValue = mapDefined(pv, (v) => `${encodeValue(v)}`)?.join(encodedSep);
          } else if ((0, is_plain_object_js_1.isPlainObject)(pv)) {
            encValue = mapDefinedEntries(Object.entries(pv), ([k, v]) => {
              return `${encodeString(k)}${encodedSep}${encodeValue(v)}`;
            })?.join(encodedSep);
          } else {
            encValue = `${encodeValue(pv)}`;
          }
          if (encValue == null) {
            return;
          }
          tmp = `${encodeString(pk)}=${encValue}`;
          if (!tmp || tmp === "=") {
            return;
          }
          out += `&${tmp}`;
        });
        return out.slice(1);
      };
    }
    exports$1.encodeForm = formEncoder(",");
    exports$1.encodeSpaceDelimited = formEncoder(" ");
    exports$1.encodePipeDelimited = formEncoder("|");
    function encodeBodyForm(key, value, options) {
      let out = "";
      const pairs = options?.explode ? explode(key, value) : [[key, value]];
      const encodeString = (v) => {
        return options?.charEncoding === "percent" ? encodeURIComponent(v) : v;
      };
      const encodeValue = (v) => encodeString(serializeValue(v));
      pairs.forEach(([pk, pv]) => {
        let tmp = "";
        let encValue = "";
        if (pv == null) {
          return;
        } else if (Array.isArray(pv)) {
          encValue = JSON.stringify(pv, jsonReplacer);
        } else if ((0, is_plain_object_js_1.isPlainObject)(pv)) {
          encValue = JSON.stringify(pv, jsonReplacer);
        } else {
          encValue = `${encodeValue(pv)}`;
        }
        tmp = `${encodeString(pk)}=${encValue}`;
        if (!tmp || tmp === "=") {
          return;
        }
        out += `&${tmp}`;
      });
      return out.slice(1);
    }
    function encodeDeepObject(key, value, options) {
      if (value == null) {
        return;
      }
      if (!(0, is_plain_object_js_1.isPlainObject)(value)) {
        throw new EncodingError(`Value of parameter '${key}' which uses deepObject encoding must be an object or null`);
      }
      return encodeDeepObjectObject(key, value, options);
    }
    function encodeDeepObjectObject(key, value, options) {
      if (value == null) {
        return;
      }
      let out = "";
      const encodeString = (v) => {
        return options?.charEncoding === "percent" ? encodeURIComponent(v) : v;
      };
      if (!(0, is_plain_object_js_1.isPlainObject)(value)) {
        throw new EncodingError(`Expected parameter '${key}' to be an object.`);
      }
      Object.entries(value).forEach(([ck, cv]) => {
        if (cv == null) {
          return;
        }
        const pk = `${key}[${ck}]`;
        if ((0, is_plain_object_js_1.isPlainObject)(cv)) {
          const objOut = encodeDeepObjectObject(pk, cv, options);
          out += objOut == null ? "" : `&${objOut}`;
          return;
        }
        const pairs = Array.isArray(cv) ? cv : [cv];
        const encoded = mapDefined(pairs, (v) => {
          return `${encodeString(pk)}=${encodeString(serializeValue(v))}`;
        })?.join("&");
        out += encoded == null ? "" : `&${encoded}`;
      });
      return out.slice(1);
    }
    function encodeJSON(key, value, options) {
      if (typeof value === "undefined") {
        return;
      }
      const encodeString = (v) => {
        return options?.charEncoding === "percent" ? encodeURIComponent(v) : v;
      };
      const encVal = encodeString(JSON.stringify(value, jsonReplacer));
      return options?.explode ? encVal : `${encodeString(key)}=${encVal}`;
    }
    const encodeSimple = (key, value, options) => {
      let out = "";
      const pairs = options?.explode ? explode(key, value) : [[key, value]];
      if (pairs.every(([_, v]) => v == null)) {
        return;
      }
      const encodeString = (v) => {
        return options?.charEncoding === "percent" ? encodeURIComponent(v) : v;
      };
      const encodeValue = (v) => encodeString(serializeValue(v));
      pairs.forEach(([pk, pv]) => {
        let tmp = "";
        if (pv == null) {
          return;
        } else if (Array.isArray(pv)) {
          tmp = mapDefined(pv, (v) => `${encodeValue(v)}`)?.join(",");
        } else if ((0, is_plain_object_js_1.isPlainObject)(pv)) {
          const mapped = mapDefinedEntries(Object.entries(pv), ([k, v]) => {
            return `,${encodeString(k)},${encodeValue(v)}`;
          });
          tmp = mapped?.join("").slice(1);
        } else {
          const k = options?.explode && (0, is_plain_object_js_1.isPlainObject)(value) ? `${pk}=` : "";
          tmp = `${k}${encodeValue(pv)}`;
        }
        out += tmp ? `,${tmp}` : "";
      });
      return out.slice(1);
    };
    exports$1.encodeSimple = encodeSimple;
    function explode(key, value) {
      if (Array.isArray(value)) {
        return value.map((v) => [key, v]);
      } else if ((0, is_plain_object_js_1.isPlainObject)(value)) {
        const o = value ?? {};
        return Object.entries(o).map(([k, v]) => [k, v]);
      } else {
        return [[key, value]];
      }
    }
    function serializeValue(value) {
      if (value == null) {
        return "";
      } else if (value instanceof Date) {
        return value.toISOString();
      } else if (value instanceof Uint8Array) {
        return (0, base64_js_1.bytesToBase64)(value);
      } else if (typeof value === "object") {
        return JSON.stringify(value, jsonReplacer);
      }
      return `${value}`;
    }
    function jsonReplacer(_, value) {
      if (value instanceof Uint8Array) {
        return (0, base64_js_1.bytesToBase64)(value);
      } else {
        return value;
      }
    }
    function mapDefined(inp, mapper) {
      const res = inp.reduce((acc, v) => {
        if (v == null) {
          return acc;
        }
        const m = mapper(v);
        if (m == null) {
          return acc;
        }
        acc.push(m);
        return acc;
      }, []);
      return res.length ? res : null;
    }
    function mapDefinedEntries(inp, mapper) {
      const acc = [];
      for (const [k, v] of inp) {
        if (v == null) {
          continue;
        }
        const m = mapper([k, v]);
        if (m == null) {
          continue;
        }
        acc.push(m);
      }
      return acc.length ? acc : null;
    }
    function queryJoin(...args) {
      return args.filter(Boolean).join("&");
    }
    function queryEncoder(f) {
      const bulkEncode = function(values, options) {
        const opts = {
          ...options,
          explode: options?.explode ?? true,
          charEncoding: options?.charEncoding ?? "percent"
        };
        const allowEmptySet = new Set(options?.allowEmptyValue ?? []);
        const encoded = Object.entries(values).map(([key, value]) => {
          if (allowEmptySet.has(key)) {
            if (value === void 0 || value === null || value === "" || Array.isArray(value) && value.length === 0) {
              return `${encodeURIComponent(key)}=`;
            }
          }
          return f(key, value, opts);
        });
        return queryJoin(...encoded);
      };
      return bulkEncode;
    }
    exports$1.encodeJSONQuery = queryEncoder(encodeJSON);
    exports$1.encodeFormQuery = queryEncoder(exports$1.encodeForm);
    exports$1.encodeSpaceDelimitedQuery = queryEncoder(exports$1.encodeSpaceDelimited);
    exports$1.encodePipeDelimitedQuery = queryEncoder(exports$1.encodePipeDelimited);
    exports$1.encodeDeepObjectQuery = queryEncoder(encodeDeepObject);
    function appendForm(fd, key, value, fileName) {
      if (value == null) {
        return;
      } else if (value instanceof Blob && fileName) {
        fd.append(key, value, fileName);
      } else if (value instanceof Blob) {
        fd.append(key, value);
      } else {
        fd.append(key, String(value));
      }
    }
  })(encodings);
  return encodings;
}
var env = {};
var dlv = {};
var hasRequiredDlv;
function requireDlv() {
  if (hasRequiredDlv) return dlv;
  hasRequiredDlv = 1;
  Object.defineProperty(dlv, "__esModule", { value: true });
  dlv.dlv = dlv$1;
  function dlv$1(obj, key, def, p, undef) {
    key = Array.isArray(key) ? key : key.split(".");
    for (p = 0; p < key.length; p++) {
      const k = key[p];
      obj = k != null && obj ? obj[k] : undef;
    }
    return obj === undef ? def : obj;
  }
  return dlv;
}
var hasRequiredEnv;
function requireEnv() {
  if (hasRequiredEnv) return env;
  hasRequiredEnv = 1;
  (function(exports$1) {
    var __createBinding = env && env.__createBinding || (Object.create ? (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    }) : (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    }));
    var __setModuleDefault = env && env.__setModuleDefault || (Object.create ? (function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    }) : function(o, v) {
      o["default"] = v;
    });
    var __importStar = env && env.__importStar || /* @__PURE__ */ (function() {
      var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function(o2) {
          var ar = [];
          for (var k in o2) if (Object.prototype.hasOwnProperty.call(o2, k)) ar[ar.length] = k;
          return ar;
        };
        return ownKeys(o);
      };
      return function(mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) {
          for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        }
        __setModuleDefault(result, mod);
        return result;
      };
    })();
    Object.defineProperty(exports$1, "__esModule", { value: true });
    exports$1.envSchema = void 0;
    exports$1.env = env$1;
    exports$1.resetEnv = resetEnv;
    const z = __importStar(/* @__PURE__ */ requireV3());
    const dlv_js_1 = /* @__PURE__ */ requireDlv();
    exports$1.envSchema = z.object({
      MISTRAL_API_KEY: z.string().optional(),
      MISTRAL_DEBUG: z.coerce.boolean().optional()
    });
    function isDeno() {
      if ("Deno" in globalThis) {
        return true;
      }
      return false;
    }
    let envMemo = void 0;
    function env$1() {
      if (envMemo) {
        return envMemo;
      }
      let envObject = {};
      if (isDeno()) {
        envObject = globalThis.Deno?.env?.toObject?.() ?? {};
      } else {
        envObject = (0, dlv_js_1.dlv)(globalThis, "process.env") ?? {};
      }
      envMemo = exports$1.envSchema.parse(envObject);
      return envMemo;
    }
    function resetEnv() {
      envMemo = void 0;
    }
  })(env);
  return env;
}
var http = {};
var hasRequiredHttp;
function requireHttp() {
  if (hasRequiredHttp) return http;
  hasRequiredHttp = 1;
  Object.defineProperty(http, "__esModule", { value: true });
  http.HTTPClient = void 0;
  http.matchContentType = matchContentType;
  http.matchStatusCode = matchStatusCode;
  http.matchResponse = matchResponse;
  http.isConnectionError = isConnectionError;
  http.isTimeoutError = isTimeoutError;
  http.isAbortError = isAbortError;
  const DEFAULT_FETCHER = (input, init) => {
    if (init == null) {
      return fetch(input);
    } else {
      return fetch(input, init);
    }
  };
  class HTTPClient {
    constructor(options = {}) {
      this.options = options;
      this.requestHooks = [];
      this.requestErrorHooks = [];
      this.responseHooks = [];
      this.fetcher = options.fetcher || DEFAULT_FETCHER;
    }
    async request(request) {
      let req = request;
      for (const hook of this.requestHooks) {
        const nextRequest = await hook(req);
        if (nextRequest) {
          req = nextRequest;
        }
      }
      try {
        const res = await this.fetcher(req);
        for (const hook of this.responseHooks) {
          await hook(res, req);
        }
        return res;
      } catch (err) {
        for (const hook of this.requestErrorHooks) {
          await hook(err, req);
        }
        throw err;
      }
    }
    addHook(...args) {
      if (args[0] === "beforeRequest") {
        this.requestHooks.push(args[1]);
      } else if (args[0] === "requestError") {
        this.requestErrorHooks.push(args[1]);
      } else if (args[0] === "response") {
        this.responseHooks.push(args[1]);
      } else {
        throw new Error(`Invalid hook type: ${args[0]}`);
      }
      return this;
    }
    removeHook(...args) {
      let target;
      if (args[0] === "beforeRequest") {
        target = this.requestHooks;
      } else if (args[0] === "requestError") {
        target = this.requestErrorHooks;
      } else if (args[0] === "response") {
        target = this.responseHooks;
      } else {
        throw new Error(`Invalid hook type: ${args[0]}`);
      }
      const index = target.findIndex((v) => v === args[1]);
      if (index >= 0) {
        target.splice(index, 1);
      }
      return this;
    }
    clone() {
      const child = new HTTPClient(this.options);
      child.requestHooks = this.requestHooks.slice();
      child.requestErrorHooks = this.requestErrorHooks.slice();
      child.responseHooks = this.responseHooks.slice();
      return child;
    }
  }
  http.HTTPClient = HTTPClient;
  const mediaParamSeparator = /\s*;\s*/g;
  function matchContentType(response, pattern) {
    if (pattern === "*") {
      return true;
    }
    let contentType = response.headers.get("content-type")?.trim() || "application/octet-stream";
    contentType = contentType.toLowerCase();
    const wantParts = pattern.toLowerCase().trim().split(mediaParamSeparator);
    const [wantType = "", ...wantParams] = wantParts;
    if (wantType.split("/").length !== 2) {
      return false;
    }
    const gotParts = contentType.split(mediaParamSeparator);
    const [gotType = "", ...gotParams] = gotParts;
    const [type = "", subtype = ""] = gotType.split("/");
    if (!type || !subtype) {
      return false;
    }
    if (wantType !== "*/*" && gotType !== wantType && `${type}/*` !== wantType && `*/${subtype}` !== wantType) {
      return false;
    }
    if (gotParams.length < wantParams.length) {
      return false;
    }
    const params = new Set(gotParams);
    for (const wantParam of wantParams) {
      if (!params.has(wantParam)) {
        return false;
      }
    }
    return true;
  }
  const codeRangeRE = new RegExp("^[0-9]xx$", "i");
  function matchStatusCode(response, codes) {
    const actual = `${response.status}`;
    const expectedCodes = Array.isArray(codes) ? codes : [codes];
    if (!expectedCodes.length) {
      return false;
    }
    return expectedCodes.some((ec) => {
      const code = `${ec}`;
      if (code === "default") {
        return true;
      }
      if (!codeRangeRE.test(`${code}`)) {
        return code === actual;
      }
      const expectFamily = code.charAt(0);
      if (!expectFamily) {
        throw new Error("Invalid status code range");
      }
      const actualFamily = actual.charAt(0);
      if (!actualFamily) {
        throw new Error(`Invalid response status code: ${actual}`);
      }
      return actualFamily === expectFamily;
    });
  }
  function matchResponse(response, code, contentTypePattern) {
    return matchStatusCode(response, code) && matchContentType(response, contentTypePattern);
  }
  function isConnectionError(err) {
    if (typeof err !== "object" || err == null) {
      return false;
    }
    const isBrowserErr = err instanceof TypeError && err.message.toLowerCase().startsWith("failed to fetch");
    const isNodeErr = err instanceof TypeError && err.message.toLowerCase().startsWith("fetch failed");
    const isBunErr = "name" in err && err.name === "ConnectionError";
    const isGenericErr = "code" in err && typeof err.code === "string" && err.code.toLowerCase() === "econnreset";
    return isBrowserErr || isNodeErr || isGenericErr || isBunErr;
  }
  function isTimeoutError(err) {
    if (typeof err !== "object" || err == null) {
      return false;
    }
    const isNative = "name" in err && err.name === "TimeoutError";
    const isLegacyNative = "code" in err && err.code === 23;
    const isGenericErr = "code" in err && typeof err.code === "string" && err.code.toLowerCase() === "econnaborted";
    return isNative || isLegacyNative || isGenericErr;
  }
  function isAbortError(err) {
    if (typeof err !== "object" || err == null) {
      return false;
    }
    const isNative = "name" in err && err.name === "AbortError";
    const isLegacyNative = "code" in err && err.code === 20;
    const isGenericErr = "code" in err && typeof err.code === "string" && err.code.toLowerCase() === "econnaborted";
    return isNative || isLegacyNative || isGenericErr;
  }
  return http;
}
var retries = {};
var hasRequiredRetries;
function requireRetries() {
  if (hasRequiredRetries) return retries;
  hasRequiredRetries = 1;
  Object.defineProperty(retries, "__esModule", { value: true });
  retries.TemporaryError = retries.PermanentError = void 0;
  retries.retry = retry;
  const http_js_1 = /* @__PURE__ */ requireHttp();
  const defaultBackoff = {
    initialInterval: 500,
    maxInterval: 6e4,
    exponent: 1.5,
    maxElapsedTime: 36e5
  };
  class PermanentError extends Error {
    constructor(message, options) {
      let msg = message;
      if (options?.cause) {
        msg += `: ${options.cause}`;
      }
      super(msg, options);
      this.name = "PermanentError";
      if (typeof this.cause === "undefined") {
        this.cause = options?.cause;
      }
      Object.setPrototypeOf(this, PermanentError.prototype);
    }
  }
  retries.PermanentError = PermanentError;
  class TemporaryError extends Error {
    constructor(message, response) {
      super(message);
      this.response = response;
      this.name = "TemporaryError";
      Object.setPrototypeOf(this, TemporaryError.prototype);
    }
  }
  retries.TemporaryError = TemporaryError;
  async function retry(fetchFn, options) {
    switch (options.config.strategy) {
      case "backoff":
        return retryBackoff(wrapFetcher(fetchFn, {
          statusCodes: options.statusCodes,
          retryConnectionErrors: !!options.config.retryConnectionErrors
        }), options.config.backoff ?? defaultBackoff);
      default:
        return await fetchFn();
    }
  }
  function wrapFetcher(fn, options) {
    return async () => {
      try {
        const res = await fn();
        if (isRetryableResponse(res, options.statusCodes)) {
          throw new TemporaryError("Response failed with retryable status code", res);
        }
        return res;
      } catch (err) {
        if (err instanceof TemporaryError) {
          throw err;
        }
        if (options.retryConnectionErrors && ((0, http_js_1.isTimeoutError)(err) || (0, http_js_1.isConnectionError)(err))) {
          throw err;
        }
        throw new PermanentError("Permanent error", { cause: err });
      }
    };
  }
  const codeRangeRE = new RegExp("^[0-9]xx$", "i");
  function isRetryableResponse(res, statusCodes) {
    const actual = `${res.status}`;
    return statusCodes.some((code) => {
      if (!codeRangeRE.test(code)) {
        return code === actual;
      }
      const expectFamily = code.charAt(0);
      if (!expectFamily) {
        throw new Error("Invalid status code range");
      }
      const actualFamily = actual.charAt(0);
      if (!actualFamily) {
        throw new Error(`Invalid response status code: ${actual}`);
      }
      return actualFamily === expectFamily;
    });
  }
  async function retryBackoff(fn, strategy) {
    const { maxElapsedTime, initialInterval, exponent, maxInterval } = strategy;
    const start = Date.now();
    let x = 0;
    while (true) {
      try {
        const res = await fn();
        return res;
      } catch (err) {
        if (err instanceof PermanentError) {
          throw err.cause;
        }
        const elapsed = Date.now() - start;
        if (elapsed > maxElapsedTime) {
          if (err instanceof TemporaryError) {
            return err.response;
          }
          throw err;
        }
        let retryInterval = 0;
        if (err instanceof TemporaryError) {
          retryInterval = retryIntervalFromResponse(err.response);
        }
        if (retryInterval <= 0) {
          retryInterval = initialInterval * Math.pow(x, exponent) + Math.random() * 1e3;
        }
        const d = Math.min(retryInterval, maxInterval);
        await delay(d);
        x++;
      }
    }
  }
  function retryIntervalFromResponse(res) {
    const retryVal = res.headers.get("retry-after") || "";
    if (!retryVal) {
      return 0;
    }
    const parsedNumber = Number(retryVal);
    if (Number.isInteger(parsedNumber)) {
      return parsedNumber * 1e3;
    }
    const parsedDate = Date.parse(retryVal);
    if (Number.isInteger(parsedDate)) {
      const deltaMS = parsedDate - Date.now();
      return deltaMS > 0 ? Math.ceil(deltaMS) : 0;
    }
    return 0;
  }
  async function delay(delay2) {
    return new Promise((resolve2) => setTimeout(resolve2, delay2));
  }
  return retries;
}
var hasRequiredSdks;
function requireSdks() {
  if (hasRequiredSdks) return sdks;
  hasRequiredSdks = 1;
  var __classPrivateFieldSet = sdks && sdks.__classPrivateFieldSet || function(receiver2, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver2 !== state || !f : !state.has(receiver2)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return kind === "a" ? f.call(receiver2, value) : f ? f.value = value : state.set(receiver2, value), value;
  };
  var __classPrivateFieldGet = sdks && sdks.__classPrivateFieldGet || function(receiver2, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver2 !== state || !f : !state.has(receiver2)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver2) : f ? f.value : state.get(receiver2);
  };
  var _ClientSDK_httpClient, _ClientSDK_hooks, _ClientSDK_logger;
  Object.defineProperty(sdks, "__esModule", { value: true });
  sdks.ClientSDK = void 0;
  const hooks_js_1 = /* @__PURE__ */ requireHooks();
  const httpclienterrors_js_1 = /* @__PURE__ */ requireHttpclienterrors();
  const fp_js_1 = /* @__PURE__ */ requireFp();
  const base64_js_1 = /* @__PURE__ */ requireBase64();
  const config_js_1 = /* @__PURE__ */ requireConfig();
  const encodings_js_1 = /* @__PURE__ */ requireEncodings();
  const env_js_1 = /* @__PURE__ */ requireEnv();
  const http_js_1 = /* @__PURE__ */ requireHttp();
  const retries_js_1 = /* @__PURE__ */ requireRetries();
  const gt = typeof globalThis === "undefined" ? null : globalThis;
  const webWorkerLike = typeof gt === "object" && gt != null && "importScripts" in gt && typeof gt["importScripts"] === "function";
  const isBrowserLike = webWorkerLike || typeof navigator !== "undefined" && "serviceWorker" in navigator || typeof window === "object" && typeof window.document !== "undefined";
  class ClientSDK {
    constructor(options = {}) {
      _ClientSDK_httpClient.set(this, void 0);
      _ClientSDK_hooks.set(this, void 0);
      _ClientSDK_logger.set(this, void 0);
      const opt = options;
      if (typeof opt === "object" && opt != null && "hooks" in opt && opt.hooks instanceof hooks_js_1.SDKHooks) {
        __classPrivateFieldSet(this, _ClientSDK_hooks, opt.hooks, "f");
      } else {
        __classPrivateFieldSet(this, _ClientSDK_hooks, new hooks_js_1.SDKHooks(), "f");
      }
      const url2 = (0, config_js_1.serverURLFromOptions)(options);
      if (url2) {
        url2.pathname = url2.pathname.replace(/\/+$/, "") + "/";
      }
      const { baseURL, client } = __classPrivateFieldGet(this, _ClientSDK_hooks, "f").sdkInit({
        baseURL: url2,
        client: options.httpClient || new http_js_1.HTTPClient()
      });
      this._baseURL = baseURL;
      __classPrivateFieldSet(this, _ClientSDK_httpClient, client, "f");
      this._options = { ...options, hooks: __classPrivateFieldGet(this, _ClientSDK_hooks, "f") };
      __classPrivateFieldSet(this, _ClientSDK_logger, this._options.debugLogger, "f");
      if (!__classPrivateFieldGet(this, _ClientSDK_logger, "f") && (0, env_js_1.env)().MISTRAL_DEBUG) {
        __classPrivateFieldSet(this, _ClientSDK_logger, console, "f");
      }
    }
    _createRequest(context, conf, options) {
      const { method, path: path2, query, headers: opHeaders, security: security2 } = conf;
      const base = conf.baseURL ?? this._baseURL;
      if (!base) {
        return (0, fp_js_1.ERR)(new httpclienterrors_js_1.InvalidRequestError("No base URL provided for operation"));
      }
      const reqURL = new URL(base);
      const inputURL = new URL(path2, reqURL);
      if (path2) {
        reqURL.pathname += reqURL.pathname.endsWith("/") ? "" : "/";
        reqURL.pathname += inputURL.pathname.replace(/^\/+/, "");
      }
      let finalQuery = query || "";
      const secQuery = [];
      for (const [k, v] of Object.entries(security2?.queryParams || {})) {
        const q = (0, encodings_js_1.encodeForm)(k, v, { charEncoding: "percent" });
        if (typeof q !== "undefined") {
          secQuery.push(q);
        }
      }
      if (secQuery.length) {
        finalQuery += `&${secQuery.join("&")}`;
      }
      if (finalQuery) {
        const q = finalQuery.startsWith("&") ? finalQuery.slice(1) : finalQuery;
        reqURL.search = `?${q}`;
      }
      const headers = new Headers(opHeaders);
      const username = security2?.basic.username;
      const password = security2?.basic.password;
      if (username != null || password != null) {
        const encoded = (0, base64_js_1.stringToBase64)([username || "", password || ""].join(":"));
        headers.set("Authorization", `Basic ${encoded}`);
      }
      const securityHeaders = new Headers(security2?.headers || {});
      for (const [k, v] of securityHeaders) {
        headers.set(k, v);
      }
      let cookie = headers.get("cookie") || "";
      for (const [k, v] of Object.entries(security2?.cookies || {})) {
        cookie += `; ${k}=${v}`;
      }
      cookie = cookie.startsWith("; ") ? cookie.slice(2) : cookie;
      headers.set("cookie", cookie);
      const userHeaders = new Headers(options?.headers ?? options?.fetchOptions?.headers);
      for (const [k, v] of userHeaders) {
        headers.set(k, v);
      }
      if (!isBrowserLike) {
        headers.set(conf.uaHeader ?? "user-agent", conf.userAgent ?? config_js_1.SDK_METADATA.userAgent);
      }
      const fetchOptions = {
        ...options?.fetchOptions,
        ...options
      };
      if (!fetchOptions?.signal && conf.timeoutMs && conf.timeoutMs > 0) {
        const timeoutSignal = AbortSignal.timeout(conf.timeoutMs);
        fetchOptions.signal = timeoutSignal;
      }
      if (conf.body instanceof ReadableStream) {
        Object.assign(fetchOptions, { duplex: "half" });
      }
      let input;
      try {
        input = __classPrivateFieldGet(this, _ClientSDK_hooks, "f").beforeCreateRequest(context, {
          url: reqURL,
          options: {
            ...fetchOptions,
            body: conf.body ?? null,
            headers,
            method
          }
        });
      } catch (err) {
        return (0, fp_js_1.ERR)(new httpclienterrors_js_1.UnexpectedClientError("Create request hook failed to execute", {
          cause: err
        }));
      }
      return (0, fp_js_1.OK)(new Request(input.url, input.options));
    }
    async _do(request, options) {
      const { context, errorCodes } = options;
      return (0, retries_js_1.retry)(async () => {
        const req = await __classPrivateFieldGet(this, _ClientSDK_hooks, "f").beforeRequest(context, request.clone());
        await logRequest(__classPrivateFieldGet(this, _ClientSDK_logger, "f"), req).catch((e) => __classPrivateFieldGet(this, _ClientSDK_logger, "f")?.log("Failed to log request:", e));
        let response = await __classPrivateFieldGet(this, _ClientSDK_httpClient, "f").request(req);
        try {
          if ((0, http_js_1.matchStatusCode)(response, errorCodes)) {
            const result = await __classPrivateFieldGet(this, _ClientSDK_hooks, "f").afterError(context, response, null);
            if (result.error) {
              throw result.error;
            }
            response = result.response || response;
          } else {
            response = await __classPrivateFieldGet(this, _ClientSDK_hooks, "f").afterSuccess(context, response);
          }
        } finally {
          await logResponse(__classPrivateFieldGet(this, _ClientSDK_logger, "f"), response, req).catch((e) => __classPrivateFieldGet(this, _ClientSDK_logger, "f")?.log("Failed to log response:", e));
        }
        return response;
      }, { config: options.retryConfig, statusCodes: options.retryCodes }).then((r) => (0, fp_js_1.OK)(r), (err) => {
        switch (true) {
          case (0, http_js_1.isAbortError)(err):
            return (0, fp_js_1.ERR)(new httpclienterrors_js_1.RequestAbortedError("Request aborted by client", {
              cause: err
            }));
          case (0, http_js_1.isTimeoutError)(err):
            return (0, fp_js_1.ERR)(new httpclienterrors_js_1.RequestTimeoutError("Request timed out", { cause: err }));
          case (0, http_js_1.isConnectionError)(err):
            return (0, fp_js_1.ERR)(new httpclienterrors_js_1.ConnectionError("Unable to make request", { cause: err }));
          default:
            return (0, fp_js_1.ERR)(new httpclienterrors_js_1.UnexpectedClientError("Unexpected HTTP client error", {
              cause: err
            }));
        }
      });
    }
  }
  sdks.ClientSDK = ClientSDK;
  _ClientSDK_httpClient = /* @__PURE__ */ new WeakMap(), _ClientSDK_hooks = /* @__PURE__ */ new WeakMap(), _ClientSDK_logger = /* @__PURE__ */ new WeakMap();
  const jsonLikeContentTypeRE = /^(application|text)\/([^+]+\+)*json.*/;
  const jsonlLikeContentTypeRE = /^(application|text)\/([^+]+\+)*(jsonl|x-ndjson)\b.*/;
  async function logRequest(logger, req) {
    if (!logger) {
      return;
    }
    const contentType = req.headers.get("content-type");
    const ct = contentType?.split(";")[0] || "";
    logger.group(`> Request: ${req.method} ${req.url}`);
    logger.group("Headers:");
    for (const [k, v] of req.headers.entries()) {
      logger.log(`${k}: ${v}`);
    }
    logger.groupEnd();
    logger.group("Body:");
    switch (true) {
      case jsonLikeContentTypeRE.test(ct):
        logger.log(await req.clone().json());
        break;
      case ct.startsWith("text/"):
        logger.log(await req.clone().text());
        break;
      case ct === "multipart/form-data": {
        const body = await req.clone().formData();
        for (const [k, v] of body) {
          const vlabel = v instanceof Blob ? "<Blob>" : v;
          logger.log(`${k}: ${vlabel}`);
        }
        break;
      }
      default:
        logger.log(`<${contentType}>`);
        break;
    }
    logger.groupEnd();
    logger.groupEnd();
  }
  async function logResponse(logger, res, req) {
    if (!logger) {
      return;
    }
    const contentType = res.headers.get("content-type");
    const ct = contentType?.split(";")[0] || "";
    logger.group(`< Response: ${req.method} ${req.url}`);
    logger.log("Status Code:", res.status, res.statusText);
    logger.group("Headers:");
    for (const [k, v] of res.headers.entries()) {
      logger.log(`${k}: ${v}`);
    }
    logger.groupEnd();
    logger.group("Body:");
    switch (true) {
      case ((0, http_js_1.matchContentType)(res, "application/json") || jsonLikeContentTypeRE.test(ct) && !jsonlLikeContentTypeRE.test(ct)):
        logger.log(await res.clone().json());
        break;
      case ((0, http_js_1.matchContentType)(res, "application/jsonl") || jsonlLikeContentTypeRE.test(ct)):
        logger.log(await res.clone().text());
        break;
      case (0, http_js_1.matchContentType)(res, "text/event-stream"):
        logger.log(`<${contentType}>`);
        break;
      case (0, http_js_1.matchContentType)(res, "text/*"):
        logger.log(await res.clone().text());
        break;
      case (0, http_js_1.matchContentType)(res, "multipart/form-data"): {
        const body = await res.clone().formData();
        for (const [k, v] of body) {
          const vlabel = v instanceof Blob ? "<Blob>" : v;
          logger.log(`${k}: ${vlabel}`);
        }
        break;
      }
      default:
        logger.log(`<${contentType}>`);
        break;
    }
    logger.groupEnd();
    logger.groupEnd();
  }
  return sdks;
}
var security = {};
var hasRequiredSecurity;
function requireSecurity() {
  if (hasRequiredSecurity) return security;
  hasRequiredSecurity = 1;
  Object.defineProperty(security, "__esModule", { value: true });
  security.SecurityError = security.SecurityErrorCode = void 0;
  security.resolveSecurity = resolveSecurity;
  security.resolveGlobalSecurity = resolveGlobalSecurity;
  security.extractSecurity = extractSecurity;
  const env_js_1 = /* @__PURE__ */ requireEnv();
  var SecurityErrorCode;
  (function(SecurityErrorCode2) {
    SecurityErrorCode2["Incomplete"] = "incomplete";
    SecurityErrorCode2["UnrecognisedSecurityType"] = "unrecognized_security_type";
  })(SecurityErrorCode || (security.SecurityErrorCode = SecurityErrorCode = {}));
  class SecurityError extends Error {
    constructor(code, message) {
      super(message);
      this.code = code;
      this.name = "SecurityError";
    }
    static incomplete() {
      return new SecurityError(SecurityErrorCode.Incomplete, "Security requirements not met in order to perform the operation");
    }
    static unrecognizedType(type) {
      return new SecurityError(SecurityErrorCode.UnrecognisedSecurityType, `Unrecognised security type: ${type}`);
    }
  }
  security.SecurityError = SecurityError;
  function resolveSecurity(...options) {
    const state = {
      basic: {},
      headers: {},
      queryParams: {},
      cookies: {},
      oauth2: { type: "none" }
    };
    const option = options.find((opts) => {
      return opts.every((o) => {
        if (o.value == null) {
          return false;
        } else if (o.type === "http:basic") {
          return o.value.username != null || o.value.password != null;
        } else if (o.type === "http:custom") {
          return null;
        } else if (o.type === "oauth2:password") {
          return typeof o.value === "string" && !!o.value;
        } else if (o.type === "oauth2:client_credentials") {
          if (typeof o.value == "string") {
            return !!o.value;
          }
          return o.value.clientID != null || o.value.clientSecret != null;
        } else if (typeof o.value === "string") {
          return !!o.value;
        } else {
          throw new Error(`Unrecognized security type: ${o.type} (value type: ${typeof o.value})`);
        }
      });
    });
    if (option == null) {
      return null;
    }
    option.forEach((spec) => {
      if (spec.value == null) {
        return;
      }
      const { type } = spec;
      switch (type) {
        case "apiKey:header":
          state.headers[spec.fieldName] = spec.value;
          break;
        case "apiKey:query":
          state.queryParams[spec.fieldName] = spec.value;
          break;
        case "apiKey:cookie":
          state.cookies[spec.fieldName] = spec.value;
          break;
        case "http:basic":
          applyBasic(state, spec);
          break;
        case "http:custom":
          break;
        case "http:bearer":
          applyBearer(state, spec);
          break;
        case "oauth2":
          applyBearer(state, spec);
          break;
        case "oauth2:password":
          applyBearer(state, spec);
          break;
        case "oauth2:client_credentials":
          break;
        case "openIdConnect":
          applyBearer(state, spec);
          break;
        default:
          throw SecurityError.unrecognizedType(type);
      }
    });
    return state;
  }
  function applyBasic(state, spec) {
    if (spec.value == null) {
      return;
    }
    state.basic = spec.value;
  }
  function applyBearer(state, spec) {
    if (typeof spec.value !== "string" || !spec.value) {
      return;
    }
    let value = spec.value;
    if (value.slice(0, 7).toLowerCase() !== "bearer ") {
      value = `Bearer ${value}`;
    }
    if (spec.fieldName !== void 0) {
      state.headers[spec.fieldName] = value;
    }
  }
  function resolveGlobalSecurity(security2) {
    return resolveSecurity([
      {
        fieldName: "Authorization",
        type: "http:bearer",
        value: security2?.apiKey ?? (0, env_js_1.env)().MISTRAL_API_KEY
      }
    ]);
  }
  async function extractSecurity(sec) {
    if (sec == null) {
      return;
    }
    return typeof sec === "function" ? sec() : sec;
  }
  return security;
}
var errors = {};
var hasRequiredErrors;
function requireErrors() {
  if (hasRequiredErrors) return errors;
  hasRequiredErrors = 1;
  Object.defineProperty(errors, "__esModule", { value: true });
  errors.RealtimeTranscriptionWSError = errors.RealtimeTranscriptionException = void 0;
  class RealtimeTranscriptionException extends Error {
    constructor(message, options) {
      super(message, options);
      this.name = "RealtimeTranscriptionException";
    }
  }
  errors.RealtimeTranscriptionException = RealtimeTranscriptionException;
  class RealtimeTranscriptionWSError extends RealtimeTranscriptionException {
    constructor(message, options) {
      super(message, { cause: options?.cause });
      this.name = "RealtimeTranscriptionWSError";
      this.payload = options?.payload;
      this.rawPayload = options?.rawPayload;
      this.code = options?.code ?? options?.payload?.error?.code;
    }
  }
  errors.RealtimeTranscriptionWSError = RealtimeTranscriptionWSError;
  return errors;
}
var hasRequiredTranscription;
function requireTranscription() {
  if (hasRequiredTranscription) return transcription;
  hasRequiredTranscription = 1;
  var __importDefault = transcription && transcription.__importDefault || function(mod) {
    return mod && mod.__esModule ? mod : { "default": mod };
  };
  Object.defineProperty(transcription, "__esModule", { value: true });
  transcription.RealtimeTranscription = void 0;
  const ws_1 = __importDefault(requireWs());
  const config_js_1 = /* @__PURE__ */ requireConfig();
  const sdks_js_1 = /* @__PURE__ */ requireSdks();
  const security_js_1 = /* @__PURE__ */ requireSecurity();
  const connection_js_1 = /* @__PURE__ */ requireConnection();
  const errors_js_1 = /* @__PURE__ */ requireErrors();
  class RealtimeTranscription extends sdks_js_1.ClientSDK {
    async connect(model, options = {}) {
      const securityInput = await (0, security_js_1.extractSecurity)(this._options.apiKey);
      const resolvedSecurity = (0, security_js_1.resolveGlobalSecurity)(securityInput == null ? {} : { apiKey: securityInput });
      const headers = {};
      headers["User-Agent"] = this._options.userAgent ?? config_js_1.SDK_METADATA.userAgent;
      if (resolvedSecurity?.headers) {
        Object.assign(headers, resolvedSecurity.headers);
      }
      if (options.httpHeaders) {
        Object.assign(headers, options.httpHeaders);
      }
      const url2 = this.getWsUrl(model, {
        serverUrl: options.serverUrl,
        queryParams: resolvedSecurity?.queryParams ?? {}
      });
      let websocket2;
      try {
        websocket2 = new ws_1.default(url2, { headers });
        const { session, initialEvents } = await recvSession(websocket2, options.timeoutMs ?? this._options.timeoutMs);
        const connection2 = new connection_js_1.RealtimeConnection(websocket2, session, initialEvents);
        if (options.audioFormat) {
          await connection2.updateSession(options.audioFormat);
        }
        return connection2;
      } catch (err) {
        if (err instanceof errors_js_1.RealtimeTranscriptionException) {
          throw err;
        }
        if (websocket2) {
          websocket2.close();
        }
        throw new errors_js_1.RealtimeTranscriptionException(`Failed to connect to transcription service: ${String(err)}`, { cause: err });
      }
    }
    async *transcribeStream(audioStream, model, options = {}) {
      const connection2 = await this.connect(model, options);
      let stopRequested = false;
      const sendAudioTask = (async () => {
        try {
          for await (const chunk of audioStream) {
            if (stopRequested || connection2.isClosed) {
              break;
            }
            await connection2.sendAudio(chunk);
          }
        } finally {
          await connection2.endAudio();
        }
      })();
      try {
        for await (const event of connection2) {
          yield event;
          if (event.type === "transcription.done") {
            break;
          }
          if (event.type === "error") {
            break;
          }
        }
      } finally {
        stopRequested = true;
        await connection2.close();
        await sendAudioTask;
        const maybeReturn = audioStream.return;
        if (typeof maybeReturn === "function") {
          await maybeReturn.call(audioStream);
        }
      }
    }
    getWsUrl(model, options) {
      const baseUrl = options.serverUrl ?? this._baseURL?.toString();
      if (!baseUrl) {
        throw new errors_js_1.RealtimeTranscriptionException("No server URL configured.");
      }
      const wsUrl = new URL("v1/audio/transcriptions/realtime", normalizeBaseUrl(baseUrl));
      const params = new URLSearchParams({ model });
      for (const [key, value] of Object.entries(options.queryParams)) {
        if (value) {
          params.set(key, value);
        }
      }
      wsUrl.search = params.toString();
      return wsUrl.toString();
    }
  }
  transcription.RealtimeTranscription = RealtimeTranscription;
  async function recvSession(websocket2, timeoutMs) {
    let timeoutId;
    const initialEvents = [];
    return new Promise((resolve2, reject) => {
      const cleanup = () => {
        websocket2.removeEventListener("message", handleMessage);
        websocket2.removeEventListener("close", handleClose);
        websocket2.removeEventListener("error", handleError);
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
      };
      const fail = (error) => {
        cleanup();
        try {
          websocket2.close();
        } catch (closeError) {
        }
        reject(error);
      };
      const handleMessage = (event) => {
        const parsed = (0, connection_js_1.parseRealtimeEventFromData)(event.data);
        initialEvents.push(parsed);
        if (parsed.type === "error") {
          if ((0, connection_js_1.isUnknownRealtimeEvent)(parsed)) {
            fail(new errors_js_1.RealtimeTranscriptionWSError(parsed.error?.message ?? "Realtime transcription error during handshake.", {
              rawPayload: parsed.raw,
              cause: parsed.error
            }));
            return;
          }
          if (isRealtimeErrorEvent(parsed)) {
            const errorMessage = typeof parsed.error.message === "string" ? parsed.error.message : JSON.stringify(parsed.error.message);
            fail(new errors_js_1.RealtimeTranscriptionWSError(errorMessage, {
              payload: parsed,
              code: parsed.error.code
            }));
            return;
          }
        }
        if ((0, connection_js_1.isUnknownRealtimeEvent)(parsed)) {
          return;
        }
        if (isSessionCreatedEvent(parsed)) {
          cleanup();
          resolve2({ session: parsed.session, initialEvents });
        }
      };
      const handleClose = () => {
        fail(new errors_js_1.RealtimeTranscriptionException("Unexpected websocket handshake close."));
      };
      const handleError = (event) => {
        fail(new errors_js_1.RealtimeTranscriptionException("Failed to connect to transcription service.", { cause: normalizeWsError(event) }));
      };
      websocket2.addEventListener("message", handleMessage);
      websocket2.addEventListener("close", handleClose);
      websocket2.addEventListener("error", handleError);
      if (timeoutMs && timeoutMs > 0) {
        timeoutId = setTimeout(() => {
          fail(new errors_js_1.RealtimeTranscriptionException("Timeout waiting for session creation."));
        }, timeoutMs);
      }
    });
  }
  function normalizeWsError(event) {
    if (event instanceof Error) {
      return event;
    }
    if (typeof event === "object" && event !== null && "error" in event && event.error instanceof Error) {
      return event.error;
    }
    return new Error("WebSocket connection error");
  }
  function isRealtimeErrorEvent(event) {
    return !(0, connection_js_1.isUnknownRealtimeEvent)(event) && "error" in event;
  }
  function isSessionCreatedEvent(event) {
    return !(0, connection_js_1.isUnknownRealtimeEvent)(event) && "session" in event && event.type === "session.created";
  }
  function normalizeBaseUrl(baseUrl) {
    const url2 = new URL(baseUrl);
    url2.pathname = url2.pathname.replace(/\/+$/, "") + "/";
    return url2;
  }
  return transcription;
}
var hasRequiredRealtime;
function requireRealtime() {
  if (hasRequiredRealtime) return realtime;
  hasRequiredRealtime = 1;
  (function(exports$1) {
    Object.defineProperty(exports$1, "__esModule", { value: true });
    exports$1.RealtimeTranscription = exports$1.RealtimeConnection = exports$1.AudioEncoding = void 0;
    var audioencoding_js_1 = /* @__PURE__ */ requireAudioencoding();
    Object.defineProperty(exports$1, "AudioEncoding", { enumerable: true, get: function() {
      return audioencoding_js_1.AudioEncoding;
    } });
    var connection_js_1 = /* @__PURE__ */ requireConnection();
    Object.defineProperty(exports$1, "RealtimeConnection", { enumerable: true, get: function() {
      return connection_js_1.RealtimeConnection;
    } });
    var transcription_js_1 = /* @__PURE__ */ requireTranscription();
    Object.defineProperty(exports$1, "RealtimeTranscription", { enumerable: true, get: function() {
      return transcription_js_1.RealtimeTranscription;
    } });
  })(realtime);
  return realtime;
}
var realtimeExports = /* @__PURE__ */ requireRealtime();
const normalizeChunk = (chunk) => {
  if (chunk instanceof Uint8Array) {
    return chunk;
  }
  if (chunk instanceof ArrayBuffer) {
    return new Uint8Array(chunk);
  }
  if (Array.isArray(chunk)) {
    return new Uint8Array(chunk);
  }
  throw new Error("Invalid audio chunk format");
};
const toErrorMessage = (error) => {
  if (error instanceof Error) {
    return error.message;
  }
  return "Realtime transcription failed";
};
class MistralRealtimeTranscriptionService {
  constructor(emitEvent) {
    this.emitEvent = emitEvent;
  }
  sessions = /* @__PURE__ */ new Map();
  async startSession(payload) {
    const apiKey = payload.apiKey.trim();
    if (!apiKey) {
      throw new Error("Mistral API key is required");
    }
    const model = payload.model.trim();
    if (!model) {
      throw new Error("Mistral model is required");
    }
    const sampleRate = Number(payload.sampleRate) || 16e3;
    const sessionId = randomUUID();
    const session = {
      id: sessionId,
      queue: [],
      waiters: [],
      ended: false,
      runPromise: Promise.resolve()
    };
    const audioStream = this.createAudioStream(session);
    const client = new realtimeExports.RealtimeTranscription({ apiKey });
    session.runPromise = (async () => {
      try {
        for await (const event of client.transcribeStream(
          audioStream,
          model,
          {
            audioFormat: {
              encoding: realtimeExports.AudioEncoding.PcmS16le,
              sampleRate
            }
          }
        )) {
          if (event.type === "transcription.text.delta" && "text" in event && typeof event.text === "string") {
            this.emitEvent({
              sessionId,
              type: "transcription.text.delta",
              text: event.text
            });
            continue;
          }
          if (event.type === "transcription.done") {
            this.emitEvent({
              sessionId,
              type: "transcription.done"
            });
            break;
          }
          if (event.type === "error") {
            const error = "error" in event ? event.error : void 0;
            const message = typeof error?.message === "string" ? error.message : JSON.stringify(error?.message);
            this.emitEvent({
              sessionId,
              type: "error",
              message: message || "Realtime transcription error"
            });
            break;
          }
        }
      } catch (error) {
        this.emitEvent({
          sessionId,
          type: "error",
          message: toErrorMessage(error)
        });
      } finally {
        await audioStream.return?.();
        this.cleanupSession(sessionId);
      }
    })();
    this.sessions.set(sessionId, session);
    return { sessionId };
  }
  async pushChunk(sessionId, chunk) {
    const session = this.sessions.get(sessionId);
    if (!session || session.ended) {
      return;
    }
    session.queue.push(normalizeChunk(chunk));
    this.notifyWaiters(session);
  }
  async stopSession(sessionId) {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return;
    }
    session.ended = true;
    this.notifyWaiters(session);
    await session.runPromise;
  }
  async stopAll() {
    const ids = Array.from(this.sessions.keys());
    for (const id of ids) {
      await this.stopSession(id);
    }
  }
  createAudioStream(session) {
    const waitForChunk = () => new Promise((resolve2) => {
      session.waiters.push(resolve2);
    });
    return (async function* stream2() {
      while (true) {
        if (session.queue.length > 0) {
          const chunk = session.queue.shift();
          if (chunk) {
            yield chunk;
            continue;
          }
        }
        if (session.ended) {
          break;
        }
        await waitForChunk();
      }
    })();
  }
  notifyWaiters(session) {
    while (session.waiters.length > 0) {
      const resolve2 = session.waiters.shift();
      resolve2?.();
    }
  }
  cleanupSession(sessionId) {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return;
    }
    session.ended = true;
    this.notifyWaiters(session);
    this.sessions.delete(sessionId);
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
let ollamaService;
let mistralRealtimeTranscriptionService;
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
  const extension2 = path.extname(filePath).toLowerCase();
  return mimeByExtension[extension2] || "application/octet-stream";
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
  const base642 = src.slice(markerIndex + marker.length);
  return {
    mimeType,
    buffer: Buffer.from(base642, "base64")
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
    void mistralRealtimeTranscriptionService?.stopAll();
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
  ollamaService = new OllamaService();
  mistralRealtimeTranscriptionService = new MistralRealtimeTranscriptionService((eventPayload) => {
    win?.webContents.send(
      "app:voice-transcription-event",
      eventPayload
    );
  });
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
    "app:ollama-stream-chat",
    async (_event, payload) => {
      const token = userDataService.getBootData().userProfile.ollamaToken;
      return ollamaService.streamChat(payload, token);
    }
  );
  ipcMain.handle(
    "app:proxy-http-request",
    async (_event, payload) => {
      const url2 = typeof payload?.url === "string" ? payload.url.trim() : "";
      const method = typeof payload?.method === "string" ? payload.method.trim().toUpperCase() : "GET";
      const headers = payload && typeof payload.headers === "object" ? payload.headers : void 0;
      const requestBodyText = typeof payload?.bodyText === "string" ? payload.bodyText : void 0;
      if (!url2) {
        return {
          ok: false,
          status: 0,
          statusText: "URL is required",
          bodyText: ""
        };
      }
      try {
        const response = await fetch(url2, {
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
    "app:voice-transcription-start",
    async (_event, payload) => {
      return mistralRealtimeTranscriptionService.startSession(
        payload
      );
    }
  );
  ipcMain.handle(
    "app:voice-transcription-push-chunk",
    async (_event, sessionId, chunk) => {
      await mistralRealtimeTranscriptionService.pushChunk(
        sessionId,
        chunk
      );
    }
  );
  ipcMain.handle(
    "app:voice-transcription-stop",
    async (_event, sessionId) => {
      await mistralRealtimeTranscriptionService.stopSession(
        sessionId
      );
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
  ipcMain.handle("app:open-external-url", async (_event, url2) => {
    if (!url2 || typeof url2 !== "string") {
      return false;
    }
    try {
      await shell.openExternal(url2);
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
    (_event, url2, timeoutMs) => browserService.openUrl(url2, timeoutMs)
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
