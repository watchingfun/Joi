import { ipcMain, dialog, Tray, app, MessageBoxOptions } from "electron";
import { BrowserWindow } from "electron-acrylic-window";
import { MessagingOptions } from "child_process";

export function setupTitleBarHandler(win: BrowserWindow) {
  ipcMain.handle("titleBarControl:minimize", (event, args) => {
    win.minimize();
  });
  ipcMain.handle("titleBarControl:setting", (event, args) => {});
  ipcMain.handle("titleBarControl:close", (event, args) => {
    //todo 读取app配置，根据配置判断直接退出还是最小化到托盘
    exitAsk(event, win);
  });

  const exitAsk = (e, win) => {
    e.preventDefault(); //阻止默认行为
    dialog
      .showMessageBox({
        type: "info",
        title: "Information",
        cancelId: 2,
        defaultId: 0,
        message: "确定要关闭吗？",
        buttons: ["最小化到托盘", "直接退出"],
        checkboxLabel: "记住我的选择",
      })
      .then((result) => {
        if (result.checkboxChecked && result.response !== 2) {
          //todo 写入app配置
        }
        if (result.response === 0) {
          e.preventDefault(); //阻止默认行为
          win.hide(); //调用 最小化实例方法
        } else if (result.response === 1) {
          win = null;
          app.quit();
          //app.exit(); //exit()直接关闭客户端，不会执行quit();
        }
      });
  };
}
