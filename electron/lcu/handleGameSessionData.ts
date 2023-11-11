import { ChampSelectPhaseSession } from "../types/lcuType";
import { parseGameSessionData } from "./utils";
import { GameMode } from "../types/opgg_rank_type";
import { sendToWebContent, showMainWindow } from "../util/util";
import { lcuConst } from "../const/const";

let champId = 0;

export function handleGameSessionData(
  data: ChampSelectPhaseSession,
  gameMode: GameMode,
) {
  const sessionData = parseGameSessionData(data, gameMode);
  const currentChampId = sessionData.selectedResult.championId;
  sendToWebContent(lcuConst.gameSessionData, sessionData);
  //todo 根据会话数据 自动锁定英雄 自动发起交换 自动ban英雄
  //发送给前台自动设置符文
  if (currentChampId && currentChampId !== champId) {
    champId = currentChampId;
    showMainWindow({ name: "inGame" });
    sendToWebContent(lcuConst.champSelect, currentChampId);
  }
}
