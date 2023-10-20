import { app, BrowserWindow } from "electron";
import sudo from "sudo-prompt";

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
