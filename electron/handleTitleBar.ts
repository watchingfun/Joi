import { app, dialog, ipcMain } from "electron";
import { BrowserWindow } from "electron-acrylic-window";
import { setting } from "./config";

export function setupTitleBarHandler(win: BrowserWindow) {
  ipcMain.handle("titleBarControl:minimize", (event, args) => {
    win.minimize();
  });
  ipcMain.handle("titleBarControl:setting", (event, args) => {});
  ipcMain.handle("titleBarControl:close", (event, args) => {
    if (setting.model.exitAsk) {
      exitAsk(event, win);
    } else if (setting.model.exitDirectly) {
      app.quit();
    } else {
      win.hide();
    }
  });

  const exitAsk = (e: Electron.IpcMainInvokeEvent, win: BrowserWindow) => {
    e.preventDefault(); //阻止默认行为
    dialog
      .showMessageBox({
        type: "info",
        title: "Information",
        cancelId: 2,
        defaultId: 0,
        message: "确定要关闭吗？",
        buttons: ["最小化到托盘", "直接退出"],
        //checkboxLabel: "记住我的选择",
      })
      .then(async (result) => {
        if (result.checkboxChecked && result.response !== 2) {
          setting.model.exitAsk = false;
          setting.model.exitDirectly = result.response === 1;
          //todo 重构计划，原生弹窗询问改为 前端自定义弹窗询问
          // await win.webContents.executeJavaScript(
          //   `localStorage.setItem('JOI-SETTING',${JSON.stringify(
          //     setting.model,
          //   )})`,
          // );
        }
        if (result.response === 0) {
          e.preventDefault(); //阻止默认行为
          win.hide(); //调用 最小化实例方法
        } else if (result.response === 1) {
          app.quit();
          //app.exit(); //exit()直接关闭客户端，不会执行quit();
        }
      });
  };
}
