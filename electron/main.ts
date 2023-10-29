import path from "path";
import { app, ipcMain, shell } from "electron";
import { setupTitleBarHandler } from "./handle/handleTitleBar";
import { setupTray } from "./handle/handleTray";
import "./lcu/handleLCU";
import { startGuardTask } from "./lcu/handleLCU";
import installExtension from "electron-devtools-installer";
import logger from "./lib/logger";
import { getPath } from "./util/util";
import { initDb } from "./db";
import { setupRunesListener } from "./handle/handleRunes";
import Input = Electron.Input;

const VUEJS3_DEVTOOLS = "nhdogjmejiglipccpnnnanhbledajbpd";

process.env["ELECTRON_DISABLE_SECURITY_WARNINGS"] = "true";

process.on("uncaughtException", (err) => {
  logger.error(err);
  throw err;
});
const BrowserWindow = require("electron-acrylic-window").BrowserWindow;
// The built directory structure
//
// ├─┬ dist
// │ ├─┬ electron
// │ │ ├── main.js
// │ │ └── preload.js
// │ ├── index.html
// │ ├── ...other-static-files-from-public
// │
process.env.DIST = path.join(getPath(), "../dist");
process.env.VITE_PUBLIC = app.isPackaged
  ? process.env.DIST
  : path.join(process.env.DIST, "../public");

let win: typeof BrowserWindow | null;

if (!app.requestSingleInstanceLock()) {
  app.quit();
  process.exit(0);
} else {
  app.on("second-instance", (event, commandLine, workingDirectory) => {
    // Someone tried to run a second instance, we should focus our window.
    if (win) {
      win.show();
    }
  });
}

export function createWindow() {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      preload: path.join(__dirname, "./preload.js"),
    },
    titleBarStyle: "hidden",
    resizable: false,
    maximizable: false,
    fullscreenable: false,
    //transparent:true,
    vibrancy: {
      theme: "dark",
      effect: "acrylic",
      useCustomWindowRefreshMethod: false,
      disableOnBlur: false,
    },
    show: false,
  });
  //在加载页面时，渲染进程第一次完成绘制时，如果窗口还没有被显示，渲染进程会发出 ready-to-show 事件 。 在此事件后显示窗口将没有视觉闪烁：
  win.once("ready-to-show", () => {
    win.show();
  });
  // 当窗口准备完毕
  win.webContents.once("did-finish-load", async () => {
    logger.debug("webContents did-finish-load");
    initDb();
    startGuardTask();
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL);
    //win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(process.env.DIST, "index.html"));
    //拦截快捷键Control+R
    win.webContents.on("before-input-event", (event: Event, input: Input) => {
      if (input.control && input.key.toLowerCase() === "r") {
        event.preventDefault();
      }
    });
  }
  setupTitleBarHandler(win);
}

app.on("window-all-closed", () => {
  app.quit();
  win = null;
});

ipcMain.on("open-url", (e, args) => {
  shell.openExternal(args);
});

app.whenReady().then(() => {
  createWindow();
  setupTray();
  setupRunesListener();
  installExtension(VUEJS3_DEVTOOLS)
    .then((name) => logger.debug(`Added Extension:  ${name}`))
    .catch((err) => logger.debug("An error occurred: ", err));
});
