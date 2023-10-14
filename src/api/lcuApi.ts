import { lcuConst } from "../../electron/config/const";
import {
  SummonerInfo,
  PageRange,
  MatchHistoryQueryResult, GameDetail,
} from "../../electron/lcu/interface";

export default {
  lcuKillRender: () =>
    window.ipcRenderer.invoke(lcuConst.killRender) as Promise<void>,
  getCurrentSummoner: () =>
    window.ipcRenderer.invoke(
      lcuConst.getCurrentSummoner,
    ) as Promise<SummonerInfo>,
  queryMatchHistory: (puuid: string, page: PageRange) =>
    window.ipcRenderer.invoke(
      lcuConst.queryMatchHistory,
      puuid,
      page,
    ) as Promise<MatchHistoryQueryResult[]>,
  queryGameDetails: (gameId: number) =>
    window.ipcRenderer.invoke(lcuConst.queryGameDetails, gameId) as Promise<GameDetail>,
};
