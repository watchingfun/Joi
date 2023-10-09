import { getAuthInfo } from "./util/authUtil";
import { exec } from "child_process";
import { BrowserWindow, ipcMain } from "electron";
import {
  DEPRECATED_connect,
  Credentials,
  createHttp1Request,
  LeagueWebSocket,
} from "./lib/league-connect";
import ProcessChecker from "./util/processChecker";

let credentials: Credentials | null;

ipcMain.handle("lcu:connect", async (event, args) => {
  credentials = await getAuthInfo();
  const ws = await DEPRECATED_connect(credentials);
  wsSubscribe(ws, credentials);
});

ipcMain.handle("lcu:killRender", (event, args) => {
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

ipcMain.handle("lcu:getCurrentSummoner", (event, args) => {
  return getCurrentSummoner(credentials);
});

function wsSubscribe(ws: LeagueWebSocket, credentials: Credentials) {
  ws.subscribe("/lol-gameflow/v1/gameflow-phase", async (data) => {
    // 自动接受对局
    if (data == "ReadyCheck") {
      autoAcceptGame(credentials);
    }
  });
  ws.subscribe("close", () => {
    console.debug("ws close");
    sendToWebContent("lcu:disconnect");
  });
  ws.subscribe("error", (e) => {
    console.debug("ws error", e);
    sendToWebContent("lcu:disconnect", e.message);
  });

  //监听客户端是否运行
  // const processChecker = new ProcessChecker(credentials.pid, 5000);
  // processChecker.on("running", () => {
  //   console.debug("running");
  // });
  // processChecker.on("stopped", () => {
  //   console.log("disconnect");
  //   processChecker.stop();
  //   sendToWebContent("lcu:disconnect");
  // });
  // processChecker.start();
}

function sendToWebContent(channel: string, data?: any) {
  const windows = BrowserWindow.getAllWindows();
  if (windows.length) {
    const win = windows.at(0);
    win.webContents.send(channel, data);
  }
}

async function getCurrentSummoner(credentials: Credentials) {
  return (
    await createHttp1Request(
      {
        method: "GET",
        url: "/lol-summoner/v1/current-summoner",
      },
      credentials,
    )
  ).json();
}

// 自动接受对局
const autoAcceptGame = (credentials: Credentials) => {
  const setTime = 600;
  setTimeout(async () => {
    try {
      await createHttp1Request(
        {
          method: "POST",
          url: "/lol-matchmaking/v1/ready-check/accept",
          body: null,
        },
        credentials,
      );
    } catch (e) {
      console.log(e);
    }
  }, setTime);
};
