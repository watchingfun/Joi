import { Hardware } from "keysender";

import { ipcMain } from "electron";
import { Handle } from "../const/const";
import { uIOhook, UiohookKey } from "uiohook-napi";

const scoreMsg: { friend: string[]; their: string[] } = {
	friend: [],
	their: []
};

export function setupHandleHotkey() {
	const hardware = new Hardware();
	ipcMain.handle(Handle.setFriendScoreMsg, (event, str: string[]) => {
		scoreMsg.friend = str;
	});
	ipcMain.handle(Handle.setTheirScoreMsg, (event, str: string[]) => {
		scoreMsg.their = str;
	});

	async function sendMsg(msg: string) {
    await hardware.keyboard.sendKey("enter", 0, 100);
		await hardware.keyboard.printText(msg, 0);
    await hardware.keyboard.sendKey("enter", 0, 100);
	}

	uIOhook.on("keyup", async (e) => {
		if (e.keycode === UiohookKey.Insert) {
			await sendMsg("--友方队伍评分--");
			for (const msg of scoreMsg.friend) {
				await sendMsg(msg);
			}
		} else if (e.keycode === UiohookKey.Delete) {
			await sendMsg("--敌方队伍评分--");
			for (const msg of scoreMsg.their) {
				await sendMsg(msg);
			}
		}
	});
	uIOhook.start();
}
