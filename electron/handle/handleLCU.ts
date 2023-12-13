import * as lcuRequestModule from "../lcu/lcuRequest";
import { ipcMain } from "electron";
import logger from "../lib/logger";
import { getLeagueWebSocket } from "../lcu/connector";
import { Handle } from "../const/const";
import { executeCommand } from "../util/util";
import { setting } from "../config";
import child_process from "child_process";

export function setupHandleLCU() {
	// 遍历并注册handle导入的函数
	for (const key in lcuRequestModule) {
		//logger.info("register handler", key, typeof lcuRequestModule[key]);
		if (typeof lcuRequestModule[key] === "function") {
			ipcMain.handle("lcu:" + key, (event, ...args) => {
				return lcuRequestModule[key](...args);
			});
		}
	}

	//处理查询连接状态请求
	ipcMain.handle(Handle.queryConnectStatus, (event, args) => {
		try {
			return !!getLeagueWebSocket();
		} catch (e) {
			return false;
		}
	});

	//处理killRender进程请求
	ipcMain.handle(Handle.killRender, (event, args) => {
		return new Promise((resolve, reject) => {
			executeCommand("taskkill /F /IM LeagueClientUxRender.exe")
				.then(() => {
					logger.info(`成功杀死进程 LeagueClientUxRender.exe`);
					resolve(null);
				})
				.catch((e) => {
					logger.error(`无法杀死进程 LeagueClientUxRender.exe: ${e.message}`);
					reject(e.message);
				});
		});
	});

	if (setting.model.autoStartLOLClient && setting.model.lolClientPath) {
		child_process.exec('"' + setting.model.lolClientPath + '"', (error, stdout, stderr) => {
			if (error) {
				logger.error("启动lol客户端失败", error);
				return;
			}
		});
	}
}
