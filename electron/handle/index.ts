import { setupHandleRunes } from "./handleRunes";
import { setupTray } from "./handleTray";
import { setupHandleLCU } from "./handleLCU";
import { app, dialog, ipcMain } from "electron";
import { Handle } from "../const/const";
import path from "node:path";
import { spawn } from "child_process";
import { showMainWindow } from "../util/util";
import logger from "../lib/logger";
import { setupHandleHotkey } from "./handleHotkey";
import { getAramBuffData } from "../lcu/aramBuff";
import FileFilter = Electron.FileFilter;
import {setupHandlePlayerNotes} from "./handlePlayerNotes";

export function setupHandles() {
	setupTray();
	setupHandleRunes();
	setupHandleLCU();
	setupHandleHotkey();
  setupHandlePlayerNotes();
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
	ipcMain.handle(Handle.getAramBuffData, (event) => {
		return getAramBuffData();
	});
	ipcMain.handle(Handle.selectFile, async (event, extension: FileFilter[] = [{ name: "*", extensions: ["*"] }]) => {
		return dialog
			.showOpenDialog({
				properties: ["openFile"],
				filters: extension
			})
			.then((result) => {
				if (result.canceled) {
					return;
				} else {
					return result.filePaths[0];
				}
			});
	});
}
