import { getAuthInfo } from "../util/authUtil";
import { exec } from "child_process";
import { BrowserWindow, ipcMain } from "electron";
import {
  createWebSocketConnection,
  Credentials,
  createHttp1Request,
  LeagueWebSocket,
} from "../lib/league-connect";
import ProcessChecker from "../util/processChecker";
import { sendToWebContent } from "../util/util";
import { getCurrentSummoner } from "./lcuRequest";
import LCUEventHandlers from "./handleEvent";
import { lcuConst } from "../config/const";
import * as lcuRequestModule from "./lcuRequest";

let credentials: Credentials | null;
let ws: LeagueWebSocket | null;
let processChecker: ProcessChecker | null;
let wsIsConnecting = false;

export function getCredentials() {
  if (!credentials) {
    throw new Error("credentials unset!");
  }
  return credentials;
}

export function getLeagueWebSocket() {
  if (!ws) {
    throw new Error("LeagueWebSocket not connected!");
  }
  return ws;
}

//监听客户端是否运行, 运行就进行连接
export async function startGuardTask() {
  processChecker = new ProcessChecker("LeagueClient.exe", 2000);
  processChecker.on("running", async () => {
    if (!ws && !wsIsConnecting) {
      wsIsConnecting = true;
      console.debug("LeagueClient running");
      sendToWebContent(lcuConst.connecting);
      try {
        await initLeagueWebSocket();
        sendToWebContent(lcuConst.connected);
        console.log('connected to LeagueClient');
      } catch (e) {
        console.debug(e);
        sendToWebContent(lcuConst.disconnect);
      }
      wsIsConnecting = false;
    }
  });
  processChecker.on("stopped", () => {
    console.debug("LeagueClient exit");
    ws = null;
    credentials = null;
    sendToWebContent(lcuConst.disconnect);
  });
  processChecker.start();
}

export async function initLeagueWebSocket() {
  if (ws) {
    return;
  }
  credentials = await getAuthInfo();
  ws = await createWebSocketConnection(credentials);
  ws.onclose = () => {
    sendToWebContent(lcuConst.disconnect);
    ws = null;
  };
  wsSubscribe(ws);
}

//处理连接请求
// ipcMain.handle("lcu:connect", async (event, args) => {
//   await initLeagueWebSocket();
// });

export function setupLCUHandler() {}

//处理killRender进程请求
ipcMain.handle(lcuConst.killRender, (event, args) => {
  return new Promise((resolve, reject) => {
    exec(
      `cd ${process.env.VITE_PUBLIC} && killLCURender.bat`,
      (error, stdout, stderr) => {
        if (error) {
          console.error(
            `无法杀死进程 LeagueClientUxRender.exe: ${error.message}`,
          );
          reject(error.message);
        } else {
          console.log(`成功杀死进程 LeagueClientUxRender.exe`);
          resolve(null);
        }
      },
    );
  });
});

ipcMain.handle(lcuConst.getCurrentSummoner, (event, args) => {
  return getCurrentSummoner();
});

//ws连接并监听事件
function wsSubscribe(ws: LeagueWebSocket) {
  ws.subscribe("/lol-gameflow/v1/gameflow-phase", async (data) => {
    console.log("gameflow-phase", data);
    Object.values(LCUEventHandlers).forEach((handler) => handler(data));
  });
}

// 遍历并注册handle导入的函数
for (const key in lcuRequestModule) {
  console.log(key, typeof lcuRequestModule[key]);
  if (typeof lcuRequestModule[key] === "function") {
    ipcMain.handle(key, (event, ...args) => {
      return lcuRequestModule[key](...args);
    });
  }
}
