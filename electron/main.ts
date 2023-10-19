import path from "path";
import { app, ipcMain, shell } from "electron";
import { getSqlite3 } from "./better-sqlite3";
import { setupTitleBarHandler } from "./handleTitleBar";
import { setupTray } from "./handleTray";
import "./lcu/handleLCU";
import { startGuardTask } from "./lcu/handleLCU";
import installExtension from "electron-devtools-installer";
import Input = Electron.Input;
import logger from "./lib/logger";
import { getPath } from "./util/util";

const VUEJS3_DEVTOOLS = "nhdogjmejiglipccpnnnanhbledajbpd";

process.env["ELECTRON_DISABLE_SECURITY_WARNINGS"] = "true";

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

if (!app.requestSingleInstanceLock()) {
  app.quit();
  process.exit(0);
}

let win: typeof BrowserWindow | null;

export function createWindow() {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      preload: path.join(__dirname, "./preload.js"),
    },
    titleBarStyle: "hidden",
    //frame:false,
    resizable: false,
    maximizable: false,
    fullscreenable: false,
    //transparent:true,
    vibrancy: {
      theme: "#F5692DA3",
      effect: "acrylic",
      useCustomWindowRefreshMethod: false,
      disableOnBlur: false,
    },
  });

  // 当窗口准备完毕
  win.webContents.on("did-finish-load", () => {
    win?.webContents.send("main-process-message", new Date().toLocaleString());
    startGuardTask();
  });
  win.webContents.openDevTools();
  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL);
    //win.webContents.openDevTools();
  } else {
    // win.loadFile('dist/index.html')
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
  installExtension(VUEJS3_DEVTOOLS)
    .then((name) => logger.debug(`Added Extension:  ${name}`))
    .catch((err) => logger.debug("An error occurred: ", err));
  // ensure did-finish-load
  // setTimeout(() => {
  //   const db = getSqlite3();
  //   win?.webContents.send(
  //     "main-process-message",
  //     `[better-sqlite3] ${JSON.stringify(db.pragma("journal_mode = WAL"))}`,
  //   );
  //
  // }, 999);
});
