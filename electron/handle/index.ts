import { setupHandleRunes } from "./handleRunes";
import { setupTray } from "./handleTray";
import { setupHandleLCU } from "./handleLCU";
import { app, ipcMain } from "electron";
import { Handle } from "../const/const";
import path from "node:path";
import { spawn } from "child_process";
import { showMainWindow } from "../util/util";
import logger from "../lib/logger";
import { setupHandleHotkey } from "./handleHotkey";

export function setupHandles() {
	setupTray();
	setupHandleRunes();
	setupHandleLCU();
	setupHandleHotkey();
	ipcMain.handle(Handle.openLogDir, () => {
		let dir: string;
		if (!app.isPackaged) {
			dir = path.join(app.getAppPath(), "logs");
		} else {
			dir = path.join(app.getPath("userData"), "logs");
		}
		spawn("explorer.exe", [dir]);
	});
	ipcMain.handle(Handle.showMainWindow, (event) => {
		showMainWindow();
	});
	ipcMain.handle(Handle.log, (event, { level, message }: { level: string; message: string }) => {
		logger.log(level, "renderer error occurred: " + message);
	});
}
