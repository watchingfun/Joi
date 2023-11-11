import { ChampSelectPhaseSession } from "../types/lcuType";
import { getCurrentAction, parseGameSessionData } from "./utils";
import { GameMode } from "../types/opgg_rank_type";
import { sendToWebContent, showMainWindow } from "../util/util";
import { lcuConst } from "../const/const";
import logger from "../lib/logger";
import { getCurrentChampId } from "./lcuRequest";

let champId = 0;
let actionId: number;

export async function handleGameSessionData(
  data: ChampSelectPhaseSession,
  gameMode: GameMode,
) {
  //进行简单解析
  const sessionData = parseGameSessionData(data, gameMode);

  //sendToWebContent(lcuConst.gameSessionData, sessionData);
  //获取当前活动
  const action = getCurrentAction(data);
  if (action && actionId !== action.id) {
    actionId = action.id; // 防止重复接收活动事件
    logger.info("currentAction", JSON.stringify(action));
    //todo 自动选择英雄 自动ban英雄
  }

  //获取当前锁定的英雄
  const currentChampId = await getCurrentChampId().catch(() => {
    return 0;
  });
  //发送给前台自动设置符文
  if (currentChampId && currentChampId !== champId) {
    champId = currentChampId;
    showMainWindow({ name: "inGame" });
    sendToWebContent(lcuConst.champSelect, currentChampId);
  }
}
