import { app, Menu, Tray } from "electron";
import path from "node:path";
import { showMainWindow } from "../util/util";

export function setupTray() {
	// 创建托盘图标
	const tray = new Tray(path.join(process.env.VITE_PUBLIC, "icon.ico"));

	const contextMenu = Menu.buildFromTemplate([
		{
			label: "主页",
			click: () => {
				showMainWindow({ name: "index" });
			}
		},
		{
			label: "战绩查询",
			click: () => {
				showMainWindow({ name: "historyMatch" });
			}
		},
		{
			label: "设置",
			click: () => {
				showMainWindow({ name: "setting" });
			}
		},
		{
			label: "退出",
			click: () => {
				// 单击托盘菜单的退出按钮时直接退出应用程序
				app.exit();
			}
		}
	]);

	tray.setToolTip("Joi 你的英雄联盟助手");
	tray.setContextMenu(contextMenu);
	// 添加双击事件监听器
	tray.on("click", () => {
		showMainWindow();
	});
}
