import { lcuConst } from "@@/config/const";
import {
  GameDetail,
  MatchHistoryQueryResult,
  PageRange,
  SummonerInfo,
} from "@@/lcu/interface";
import { ElMessage } from "element-plus";
import useLCUStore, { ConnectStatusEnum } from "@/store/lcu";

async function captureError<T>(func: Function | Promise<T>, ...args: any[]) {
  if (useLCUStore().connectStatus !== ConnectStatusEnum.connected) {
    ElMessage.error("客户端未连接，LCU api不可用！");
    return;
  }
  if (func instanceof Promise) {
    try {
      return await func;
    } catch (err) {
      if (err instanceof Error) {
        ElMessage.error(err.message);
      }
      throw err;
    }
  } else {
    return func(...args) as T;
  }
}

export default {
  lcuKillRender: () =>
    captureError<void>(window.ipcRenderer.invoke(lcuConst.killRender)),
  getCurrentSummoner: () =>
    captureError<SummonerInfo>(
      window.ipcRenderer.invoke(lcuConst.getCurrentSummoner),
    ),
  queryMatchHistory: (puuid: string, page: PageRange) =>
    captureError<MatchHistoryQueryResult[]>(
      window.ipcRenderer.invoke(lcuConst.queryMatchHistory, puuid, page),
    ),
  queryGameDetails: (gameId: number) =>
    captureError<GameDetail>(
      window.ipcRenderer.invoke(lcuConst.queryGameDetails, gameId),
    ),
};
