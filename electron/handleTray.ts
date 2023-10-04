import { app, BrowserWindow, Tray, Menu } from "electron";
import path from "node:path";
import { createWindow } from "./main";

function showMainWindow(){
  // 获取当前的窗口  目前程序只做一个窗口
  const windows = BrowserWindow.getAllWindows();
  if (windows.length) {
    const win = windows.at(0);
    win.restore();
    win.show();
  }
}

export function setupTray() {
  // 创建托盘图标
  const tray = new Tray(path.join(process.env.VITE_PUBLIC, "icon.ico"));

  const contextMenu = Menu.buildFromTemplate([
    {
      label: "主页",
      click: () => {
        showMainWindow()
      },
    },
    {
      label: "战绩查询",
      click: () => {},
    },
    {
      label: "设置",
      click: () => {},
    },
    {
      label: "退出",
      click: () => {
        // 单击托盘菜单的退出按钮时直接退出应用程序
        app.exit();
      },
    },
  ]);

  tray.setToolTip("Joi 你的英雄联盟助手");
  tray.setContextMenu(contextMenu);
  // 添加双击事件监听器
  tray.on('click', () => {
    showMainWindow()
  });
}
