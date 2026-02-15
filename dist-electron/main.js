import path from "node:path";
import { app, BrowserWindow } from "electron";
import { fileURLToPath } from "node:url";
import fs from "node:fs";
const DEFAULT_RESOURCES_TREE = {
  themes: {}
};
class InitService {
  basePath;
  resourcesTree;
  constructor(basePath) {
    this.basePath = basePath;
    this.resourcesTree = DEFAULT_RESOURCES_TREE;
  }
  initialize() {
    this.buildTree();
  }
  buildTree() {
    this.createDirectoryStructure(
      {
        resources: this.resourcesTree
      },
      this.basePath
    );
  }
  createDirectoryStructure(tree, targetBasePath) {
    for (const [name, node] of Object.entries(tree)) {
      const currentPath = path.join(targetBasePath, name);
      if (typeof node === "string") {
        if (!fs.existsSync(currentPath)) {
          fs.writeFileSync(currentPath, node);
        }
        continue;
      }
      if (!fs.existsSync(currentPath)) {
        fs.mkdirSync(currentPath, { recursive: true });
      }
      this.createDirectoryStructure(node, currentPath);
    }
  }
}
const __dirname$1 = path.dirname(fileURLToPath(import.meta.url));
process.env.APP_ROOT = path.join(__dirname$1, "..");
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, "public") : RENDERER_DIST;
let win;
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
  createWindow();
});
export {
  MAIN_DIST,
  RENDERER_DIST,
  VITE_DEV_SERVER_URL
};
