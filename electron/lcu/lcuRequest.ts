import { createHttp1Request, EventCallback, HttpRequestOptions } from "../lib/league-connect";
import { getCredentials, getLeagueWebSocket } from "./connector";
import {
	Action,
	ChampSelectPhaseSession,
	Conversation,
	GameDetail,
	GameSessionData,
	LobbyMember,
	MatchHistoryQueryResult,
	RPC,
	SummonerInfo
} from "../types/lcuType";
import logger from "../lib/logger";
import { RuneConfig } from "../types/type";
import { getChampData, getNoneRankRunes, getRankRunes } from "./opgg";
import runesDB from "../db/runes";
import { GameMode, PositionName } from "../types/opgg_rank_type";
import { PerkRune } from "../types/rune";
import { memoize } from "lodash";
import { LRUCache } from "lru-cache";
import { RankSummary } from "../types/rankType";

const httpRequest = async <T>(option: HttpRequestOptions<any>, errMsg?: string) => {
	const response = await createHttp1Request(option, getCredentials());
	if (response.ok) {
		return (response.text() ? (response.json() as T) : null) as T;
	} else {
		if (errMsg) {
			throw new Error(errMsg);
		} else {
			throw new Error((response.json() as RPC).message);
		}
	}
};

//获取当前召唤师信息
export async function getCurrentSummoner() {
	return await httpRequest<SummonerInfo>({
		method: "GET",
		url: "/lol-summoner/v1/current-summoner"
	});
}

//通过昵称召唤师信息
export async function getSummonerByName(nickname: string) {
	const response = await createHttp1Request(
		{
			method: "GET",
			url: `/lol-summoner/v1/summoners/?name=${encodeURI(nickname)}`
		},
		getCredentials()
	);
	if (response.ok) {
		return response.json() as SummonerInfo;
	} else if (response.status === 404 || response.status === 422) {
		throw new Error("找不到该召唤师: " + nickname);
	} else {
		throw new Error((response.json() as RPC).message);
	}
}

//通过puuid查询召唤师信息
export async function getSummonerByPuuid(puuid: string) {
	return await httpRequest<SummonerInfo>({
		method: "GET",
		url: `/lol-summoner/v2/summoners/puuid/${puuid}`
	});
}

//监听选择的英雄
export function listenChampSelect(callback?: Function): Function {
	const ws = getLeagueWebSocket();
	const effect = (data: ChampSelectPhaseSession) => {
		callback && callback(data);
	};
	ws.subscribe("/lol-champ-select/v1/session", effect as EventCallback<ChampSelectPhaseSession>);
	return () => ws.unsubscribe("/lol-champ-select/v1/session");
}

// 获取当前选择的英雄
export async function getCurrentChampId() {
	return await httpRequest<number>({
		method: "GET",
		url: "/lol-champ-select/v1/current-champion"
	});
}

// 查询对局游戏信息(召唤师ID,昵称,英雄)
export async function getGameInfo() {
	const matchSession = await httpRequest<GameSessionData>({
		method: "GET",
		url: `/lol-gameflow/v1/session`
	});
	//logger.debug("matchSession", JSON.stringify(matchSession));
	return matchSession;
}

//应用符文
export async function applyRune(data: RuneConfig) {
	// 获取符文页信息
	const currentRuneList: PerkRune[] = await httpRequest<PerkRune[]>({
		method: "GET",
		url: "lol-perks/v1/pages"
	});
	const current = currentRuneList.find((i) => i.name.startsWith("OP.GG")) || currentRuneList.find((i) => i.isDeletable);
	if (current != undefined) {
		// 删除当前符文页
		await httpRequest({
			method: "DELETE",
			url: `lol-perks/v1/pages/${current.id}`
		}).catch(() => {
			throw new Error("删除符文页出错");
		});
	}
	// 写入新的符文页
	await httpRequest({
		method: "POST",
		url: "lol-perks/v1/pages",
		body: data
	});
	return true;
}

//ban pick 英雄
export const banPickChampion = async (action: Action, champId: number, completed: boolean, type: "ban" | "pick") => {
	return await httpRequest({
		method: "POST",
		url: `lol-champ-select/v1/session/actions/${action.id}`,
		body: {
			actorCellId: action.actorCellId,
			championId: champId,
			completed: completed,
			id: action.id,
			isAllyAction: true,
			type: type
		}
	});
};

//获取聊天会话
export const getConversations = async () => {
	return await httpRequest<Conversation[]>({
		method: "GET",
		url: `/lol-chat/v1/conversations`
	});
};

//发送聊天到房间
export const sendChatMsgToRoom = async (conversationId: string, msg: string, type: string = "chat") => {
	return await httpRequest({
		method: "POST",
		url: `/lol-chat/v1/conversations/${conversationId}/messages`,
		body: {
			body: msg,
			type: type
		}
	}).catch((e) => {
		throw new Error("发送聊天到房间出错: " + e.message);
	});
};

/**
 *
 * @param puuid
 * @param page 页数，起始值1
 * @param pageSize 每页数量大小默认值8
 * 根据召唤师puuid分页查询战绩
 */
export const queryMatchHistory = async (puuid: string, page: number = 1, pageSize: number = 8) => {
	const begIndex = (page - 1) * pageSize;
	const endIndex = page * pageSize - 1;
	return await httpRequest<MatchHistoryQueryResult>({
		method: "GET",
		url: `/lol-match-history/v1/products/lol/${puuid}/matches?begIndex=${begIndex}&endIndex=${endIndex}`
	}).catch((e: any) => {
		logger.error("QueryMatchHistory", e.message, puuid, begIndex, endIndex);
		throw e;
	});
};

//获取一局游戏的详细数据
export const queryGameDetails = async (gameId: number) => {
	return await httpRequest<GameDetail>({
		method: "GET",
		url: `/lol-match-history/v1/games/${gameId}`
	});
};

//获取一局游戏的详细数据 带缓存
const queryGameDetailsAndCache = memoize(queryGameDetails);
queryGameDetailsAndCache.cache = new LRUCache({ max: 500 });

export const getCurrentQueue = async () => {
	const res = await httpRequest<GameSessionData>({
		method: "GET",
		url: `/lol-gameflow/v1/session`
	});
	logger.debug("getCurrentQueue", JSON.stringify(res));
	return res?.gameData?.queue?.id || 430;
};

//获取本地符文库
export const getCustomRunes = async (champId: number, gameMode: GameMode, position: PositionName) => {
	gameMode = gameMode || "rank";
	position = position || "mid";
	logger.debug("getCustomRunes", champId, gameMode, position);
	const championData = await getChampData(champId);
	const roles = championData?.roles.flatMap((r) => r.name.split("|")) || [];
	return runesDB.queryPageRunes({
		start: 0,
		size: 10,
		mode: [gameMode],
		position: gameMode === "rank" ? [position] : [],
		role: roles
	}).data;
};

//获取opgg符文
export const getOPGGRunes = async (champId: number, gameMode: GameMode, position: PositionName) => {
	gameMode = gameMode || "rank";
	position = position || "mid";
	logger.debug("getOPGGRunes", champId, gameMode, position);
	if (gameMode === "rank") {
		return await getRankRunes(champId, position);
	} else {
		return await getNoneRankRunes(champId, gameMode);
	}
};

//查询玩家最近20场游戏对局详情
// export const queryTeamMemberGameDetail = async (puuid: string) => {
// 	const gameHistory = (await queryMatchHistory(puuid)).flatMap((m) => m.games.games);
// 	const result = await Promise.allSettled(
// 		gameHistory.map(async (game) => {
// 			return await queryGameDetails(game.gameId);
// 		})
// 	);
// 	const isFulfilled = <T>(p: PromiseSettledResult<T>): p is PromiseFulfilledResult<T> => p.status === "fulfilled";
// 	return result.filter(isFulfilled<GameDetail>).map((p) => p.value);
// };

//接收对局
export const acceptGame = async () => {
	return await httpRequest<void>({
		method: "POST",
		url: `/lol-matchmaking/v1/ready-check/accept`
	});
};

//查询对局接收状态
export const getReadyCheckStatus = async () => {
	return await httpRequest<{ playerResponse: string }>({
		method: "GET",
		url: `/lol-matchmaking/v1/ready-check`
	});
};

//再来一局（回到大厅）
export const playAgain = async () => {
	return await httpRequest<void>({
		method: "POST",
		url: `/lol-lobby/v2/play-again`
	});
};

//开始匹配 寻找对局
export const matchmaking = async () => {
	return await httpRequest<void>({
		method: "POST",
		url: `/lol-lobby/v2/lobby/matchmaking/search`
	});
};

//查询大厅成员
export const getLobbyMembers = async () => {
	return await httpRequest<LobbyMember[]>({
		method: "GET",
		url: "/lol-lobby/v2/lobby/members"
	});
};
//检查自己是否房主
export const checkSelfIsLobbyLeader = async () => {
	const lobbyMembers = await getLobbyMembers();
	const selfPuuid = (await getCurrentSummoner()).puuid;
	return lobbyMembers.find((m) => (m.puuid = selfPuuid)).isLeader;
};

//获取段位信息
export const getRankSummary = async (puuid: string) => {
	return await httpRequest<RankSummary>({
		method: "GET",
		url: `/lol-ranked/v1/ranked-stats/${puuid}`
	});
};

//重启界面
export const restartUX = async () => {
	return await httpRequest<void>({
		method: "POST",
		url: "/riotclient/kill-and-restart-ux"
	});
};
