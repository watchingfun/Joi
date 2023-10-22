import { getAuthInfo } from "../util/authUtil";
import { ipcMain } from "electron";
import {
  createWebSocketConnection,
  Credentials,
  LeagueWebSocket,
} from "../lib/league-connect";
import ProcessChecker, {
  checkProcessExistByName,
} from "../util/processChecker";
import { executeCommand, retryWrapper, sendToWebContent } from "../util/util";
import LCUEventHandlers from "./handleEvent";
import { lcuConst } from "../const/const";
import * as lcuRequestModule from "./lcuRequest";
import logger from "../lib/logger";

let credentials: Credentials | null;
let ws: LeagueWebSocket | null;
let processChecker: ProcessChecker | null;
let wsIsConnecting = false;
//重试包装
const createWebSocketConnectionRetry = retryWrapper(createWebSocketConnection);

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
export function startGuardTask() {
  if (processChecker) {
    processChecker.stop();
    processChecker = null;
  }
  processChecker = new ProcessChecker("LeagueClient.exe", 3000);
  processChecker.on("running", async () => {
    if (!ws && !wsIsConnecting) {
      wsIsConnecting = true;
      //等待1.5s检测下进程再尝试连接，因为lcu客户端退出先关闭ws连接，但是进程还未推出
      await new Promise((resolve) => setTimeout(resolve, 1500));
      if (!(await checkProcessExistByName("LeagueClient.exe"))) {
        wsIsConnecting = false;
        return;
      }
      logger.info("guardTask", "LeagueClient is running, try connect");
      sendToWebContent(lcuConst.connecting);
      try {
        await initLeagueWebSocket();
        sendToWebContent(lcuConst.connected);
        logger.info("guardTask", "connected to LeagueClient");
      } catch (e) {
        logger.error("guardTask", e instanceof Error ? e.message : e);
        sendToWebContent(lcuConst.disconnect);
      }
      wsIsConnecting = false;
    }
  });
  processChecker.on("stopped", () => {
    logger.debug("guardTask", "LeagueClient exit");
    ws = null;
    credentials = null;
    sendToWebContent(lcuConst.disconnect);
  });
  processChecker.start(true);
  return processChecker;
}

export async function initLeagueWebSocket() {
  if (ws) {
    return;
  }
  credentials = await getAuthInfo();
  //使用重试包装的版本，客户端刚启动的时候可能没法直接连上，因为lcu客户端可能还未初始化ws
  ws = await createWebSocketConnectionRetry(credentials);
  ws.onclose = () => {
    sendToWebContent(lcuConst.disconnect);
    ws = null;
  };
  wsSubscribe(ws);
}

//处理查询连接状态请求
ipcMain.handle(lcuConst.queryConnectStatus, (event, args) => {
  return !!ws;
});

export function setupLCUHandler() {}

//处理killRender进程请求
ipcMain.handle(lcuConst.killRender, (event, args) => {
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

// ipcMain.handle(lcuConst.getCurrentSummoner, (event, args) => {
//   return getCurrentSummoner();
// });

//ws连接并监听事件
function wsSubscribe(ws: LeagueWebSocket) {
  ws.subscribe("/lol-gameflow/v1/gameflow-phase", async (data) => {
    logger.info("gameflow-phase", data);
    Object.values(LCUEventHandlers).forEach((handler) => handler(data));
  });
}

// 遍历并注册handle导入的函数
for (const key in lcuRequestModule) {
  logger.info("register handler", key, typeof lcuRequestModule[key]);
  if (typeof lcuRequestModule[key] === "function") {
    ipcMain.handle("lcu:" + key, (event, ...args) => {
      return lcuRequestModule[key](...args);
    });
  }
}
