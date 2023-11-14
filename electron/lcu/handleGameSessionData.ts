import { ChampSelectPhaseSession, TeamMemberInfo } from "../types/lcuType";
import { getCurrentAction, parseGameSessionData } from "./utils";
import { GameMode } from "../types/opgg_rank_type";
import { sendToWebContent, showMainWindow } from "../util/util";
import { lcuConst } from "../const/const";
import logger from "../lib/logger";
import { getCurrentChampId, getSummonerByPuuid } from "./lcuRequest";

let champId = 0;
let actionId: number | null;
let myTeam: TeamMemberInfo[] | null;
let roomId: string | null;

export async function handleGameSessionData(data: ChampSelectPhaseSession, gameMode: GameMode) {
	//进行简单解析
	const sessionData = parseGameSessionData(data, gameMode);
	logger.debug("ChampSelectPhaseSession", JSON.stringify(data));
	sendToWebContent(lcuConst.gameSessionData, sessionData);

	//发送当前对局我方成员
	if (!myTeam) {
		myTeam = await Promise.all(
			data.myTeam.map(async (t) => ({
				puuid: t.puuid,
				summonerName: (await getSummonerByPuuid(t.puuid)).displayName
			}))
		).catch((e) => {
			logger.error("查询成员信息失败：", (e as Error)?.message);
			return [];
		});
		sendToWebContent(lcuConst.gameSessionMyTeam, myTeam);
		roomId = data.chatDetails.multiUserChatId;
		sendToWebContent(lcuConst.gameSessionRoomId, roomId);
	}

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
	logger.info("currentChampId: ", currentChampId);
	//发送给前台自动设置符文
	if (currentChampId && currentChampId !== champId) {
		champId = currentChampId;
		showMainWindow({ name: "inGame" });
		sendToWebContent(lcuConst.champSelect, currentChampId);
	}
}

//清空变量值
export function clearFlag() {
	myTeam = null;
	champId = 0;
	actionId = null;
	roomId = null;
}
