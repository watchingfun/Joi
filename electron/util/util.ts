import { app, BrowserWindow } from "electron";

export function sendToWebContent(channel: string, data?: any) {
  const windows = BrowserWindow.getAllWindows();
  if (windows.length) {
    const win = windows.at(0);
    win.webContents.send(channel, data);
  }
}

export function getPath(unpackPath: boolean = false) {
  if (!app.isPackaged) {
    return __dirname;
  }
  return unpackPath
    ? __dirname.replace("app.asar", "app.asar.unpacked")
    : __dirname;
}
