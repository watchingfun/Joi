import { app, BrowserWindow } from "electron";
import sudo from "sudo-prompt";
import logger from "../lib/logger";

export function showMainWindow(route?: string | { name: string }) {
	// 获取当前的窗口  目前程序只做一个窗口
	const windows = BrowserWindow.getAllWindows();
	if (windows.length) {
		const win = windows.at(0);
		if (route) {
			win?.webContents.send("jumpRoute", route);
		}
		//win.restore();
		win?.show();
	}
}

export function sendToWebContent(channel: string, data?: any) {
	const windows = BrowserWindow.getAllWindows();
	if (windows.length) {
		const win = windows.at(0);
		win?.webContents.send(channel, data);
	}
}

export function getPath(unpackPath: boolean = false) {
	if (!app.isPackaged) {
		return __dirname;
	}
	return unpackPath ? __dirname.replace("app.asar", "app.asar.unpacked") : __dirname;
}

export function executeCommand(cmd: string): Promise<string> {
	return new Promise((resolve, reject) => {
		sudo.exec(cmd, { name: "joi" }, (err, stdout, stderr) => {
			if (err) {
				reject(err);
			} else if (stderr) {
				reject(stderr);
			} else {
				resolve(stdout?.toString() || "");
			}
		});
	});
}

/**
 * 错误重试包装器
 *
 * @param  asyncFunc 要包装的异步函数
 * @param  defaultRetryTime 默认的重试次数
 * @param  retryInterval 重试间隔时常
 * @returns Promise<T> 会自动进行错误重试的异步函数
 */
export const retryWrapper = function <T>(
	asyncFunc: (...args: any[]) => Promise<T>,
	defaultRetryTime: number = 3,
	retryInterval: number = 1000
) {
	// 内部重试计数器
	let retryTime = defaultRetryTime;

	const retryCallback = async function (...args: any[]): Promise<T> {
		try {
			return await asyncFunc(...args);
		} catch (e: any) {
			if (retryTime <= 0) throw e;
			logger.error(
				`error occurred:${e.message}, retryWrapper, 将在 ${retryInterval} 毫秒后重试，剩余重试次数 ${retryTime}`
			);
			retryTime -= 1;
			await new Promise((resolve) => setTimeout(resolve, retryInterval));
			return await retryCallback(...args);
		}
	};

	return retryCallback;
};
