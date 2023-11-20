import { setupHandleRunes } from "./handleRunes";
import { setupTray } from "./handleTray";
import { setupHandleLCU } from "./handleLCU";
import { app, ipcMain } from "electron";
import { Handle } from "../const/const";
import path from "node:path";
import { spawn } from "child_process";

export function setupHandles() {
	setupTray();
	setupHandleRunes();
	setupHandleLCU();
	ipcMain.handle(Handle.openLogDir, () => {
		let dir: string;
		if (!app.isPackaged) {
			dir = path.join(app.getAppPath(), "logs");
		} else {
			dir = path.join(app.getPath("userData"), "logs");
		}
		spawn("explorer.exe", [dir]);
	});
}
