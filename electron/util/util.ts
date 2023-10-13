import { BrowserWindow } from "electron";

export function sendToWebContent(channel: string, data?: any) {
  const windows = BrowserWindow.getAllWindows();
  if (windows.length) {
    const win = windows.at(0);
    win.webContents.send(channel, data);
  }
}
