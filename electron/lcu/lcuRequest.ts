import {
  createHttp1Request,
  createHttp2Request,
  createHttpSession,
  EventCallback,
  HttpRequestOptions,
} from "../lib/league-connect";
import { getCredentials, getLeagueWebSocket } from "./handleLCU";
import { ClientHttp2Session } from "http2";
import { champDict } from "../const/lolDataConfig";
import {
  Action,
  ChampSelectPhaseSession,
  Conversation,
  GameDetail,
  GameSessionData,
  MatchHistoryQueryResult,
  PageRange,
  PlayerChampionSelection,
  RPC,
  SummonerInfo,
  TeamMember,
} from "../types/lcuType";
import logger from "../lib/logger";
import { RuneConfig } from "../types/type";
import { getNoneRankRunes, getRankRunes } from "./opgg";
import runesDB from "../db/runes";
import { GameMode, PositionName } from "../types/opgg_rank_type";
import { PerkRune } from "../types/rune";

const httpRequest = async <T>(option: HttpRequestOptions<any>) => {
  const response = await createHttp1Request(option, getCredentials());
  if (response.ok) {
    return (response.text() ? (response.json() as T) : null) as T;
  } else {
    throw new Error((response.json() as RPC).message);
  }
};

//获取当前召唤师信息
export async function getCurrentSummoner() {
  return await httpRequest<SummonerInfo>({
    method: "GET",
    url: "/lol-summoner/v1/current-summoner",
  });
}

//通过昵称召唤师信息
export async function getSummonerByName(nickname: string) {
  return await httpRequest<SummonerInfo>({
    method: "GET",
    url: `/lol-summoner/v1/summoners/?name=${encodeURI(nickname)}`,
  });
}

//通过puuid查询召唤师信息
export async function getSummonerByPuuid(puuid: string) {
  return await httpRequest<SummonerInfo>({
    method: "GET",
    url: `/lol-summoner/v2/summoners/puuid/${puuid}`,
  });
}

//监听选择的英雄
export function listenChampSelect(callback?: Function): Function {
  const ws = getLeagueWebSocket();
  const effect = (data: ChampSelectPhaseSession) => {
    callback && callback(data);
  };
  ws.subscribe(
    "/lol-champ-select/v1/session",
    effect as EventCallback<ChampSelectPhaseSession>,
  );
  return () => ws.unsubscribe("/lol-champ-select/v1/session");
}

// (
//     data: ChampSelectPhaseSession,
//     event: EventResponse<ChampSelectPhaseSession>,
// ) => {
//   //callback && callback(data);
//   //logger.debug("champ-select-session", JSON.stringify(data));
// },

// 获取当前选择的英雄
export async function getCurrentChampId() {
  return await httpRequest<number>({
    method: "GET",
    url: "/lol-champ-select/v1/current-champion",
  });
}

// 获取召唤师选取的英雄记录
const getSummonerSelectChampMap = (
  playerChampionSelections: PlayerChampionSelection[],
) => {
  let champDict: Record<string, number> = {};
  for (const summonerSelect of playerChampionSelections) {
    champDict[summonerSelect.summonerInternalName] = summonerSelect.championId;
  }
  return champDict;
};

// 查询对局游戏信息(召唤师ID,昵称,英雄)
export async function getGameInfo() {
  const summoner = await getCurrentSummoner();
  const matchSession = await httpRequest<GameSessionData>({
    method: "GET",
    url: `/lol-gameflow/v1/session`,
  });

  //logger.debug("matchSession", JSON.stringify(matchSession));

  let friendInfoList = [];
  let enemyInfoList = [];
  const playerChampionSelections = getSummonerSelectChampMap(
    matchSession?.gameData?.playerChampionSelections,
  );

  let enemyInfo: TeamMember[];
  let friendInfo: TeamMember[];
  if (
    matchSession?.gameData.teamOne.find(
      (i) => i.summonerId === summoner.summonerId,
    )
  ) {
    enemyInfo = matchSession.gameData.teamTwo;
    friendInfo = matchSession.gameData.teamOne;
  } else {
    enemyInfo = matchSession.gameData.teamOne;
    friendInfo = matchSession.gameData.teamTwo;
  }

  for (let i = 0; i < friendInfo.length; i++) {
    try {
      friendInfoList.push({
        name: friendInfo[i].summonerName,
        summonerId: friendInfo[i].summonerId,
        selectChamp:
          "https://game.gtimg.cn/images/lol/act/img/champion/" +
          champDict[
            `${playerChampionSelections[friendInfo[i].summonerInternalName]}`
          ].alias +
          ".png",
        index: getPosition(friendInfo[i].selectedPosition),
      });
    } catch (e) {
      break;
    }
  }
  for (let i = 0; i < enemyInfo.length; i++) {
    try {
      enemyInfoList.push({
        name: enemyInfo[i].summonerName,
        summonerId: enemyInfo[i].summonerId,
        selectChamp:
          "https://game.gtimg.cn/images/lol/act/img/champion/" +
          champDict[
            `${playerChampionSelections[enemyInfo[i].summonerInternalName]}`
          ].alias +
          ".png",
        index: getPosition(enemyInfo[i].selectedPosition),
      });
    } catch (e) {
      break;
    }
  }

  friendInfoList.sort((x, y) => {
    return x.index - y.index;
  });
  enemyInfoList.sort((x, y) => {
    return x.index - y.index;
  });

  return [friendInfoList, enemyInfoList];
}

const getPosition = (selectedPosition: string) => {
  switch (selectedPosition) {
    case "BOTTOM":
      return 4;
    case "JUNGLE":
      return 2;
    case "TOP":
      return 1;
    case "MIDDLE":
      return 3;
    case "UTILITY":
      return 5;
    case "NONE":
      return 0;
    default:
      return 0;
  }
};

//应用符文
export async function applyRune(data: RuneConfig) {
  // 获取符文页信息
  const currentRuneList: PerkRune[] = await httpRequest<PerkRune[]>({
    method: "GET",
    url: "lol-perks/v1/pages",
  });
  const current = currentRuneList.find((i) => i.current && i.isDeletable);
  if (current != undefined) {
    // 删除当前符文页
    await httpRequest({
      method: "DELETE",
      url: `lol-perks/v1/pages/${current.id}`,
    });
  }
  // 写入新的符文页
  await httpRequest({
    method: "POST",
    url: "lol-perks/v1/pages",
    body: data,
  });
  return true;
}

//ban pick 英雄
export const banPickChampion = async (
  action: Action,
  champId: number,
  completed: boolean,
  type: "ban" | "pick",
) => {
  return await httpRequest({
    method: "POST",
    url: `lol-champ-select/v1/session/actions/${action.id}`,
    body: {
      actorCellId: action.actorCellId,
      championId: champId,
      completed: completed,
      id: action.id,
      isAllyAction: true,
      type: type,
    },
  });
};

//获取聊天会话
export const getConversations = async () => {
  return await httpRequest<Conversation[]>({
    method: "GET",
    url: `/lol-chat/v1/conversations`,
  });
};

const dividerLine =
  "----------------------------------------------------------------------------------";
//发送聊天
export const sendChatMsg = async (
  conversationId: number,
  msg: string,
  type: string = "chat",
) => {
  return await httpRequest({
    method: "POST",
    url: `/lol-chat/v1/conversations/${conversationId}/messages`,
    body: {
      body: msg,
      type: type,
    },
  });
};

// 根据召唤师ID 游标查询战绩
export const cursorQueryMatchHistory = async (
  session: ClientHttp2Session,
  puuid: string,
  begIndex: number,
  endIndex: number,
) => {
  return (
    await createHttp2Request(
      {
        method: "GET",
        url: `/lol-match-history/v1/products/lol/${puuid}/matches?begIndex=${begIndex}&endIndex=${endIndex}`,
      },
      session,
      getCredentials(),
    )
  ).json() as MatchHistoryQueryResult;
};

// 根据召唤师ID查询战绩
export const queryMatchHistory = async (puuid: string, page: PageRange = 1) => {
  let specialDict: MatchHistoryQueryResult[] = [];
  const session = await createHttpSession(getCredentials());
  for (let i = 0; i < page; i++) {
    const matchHistory = await cursorQueryMatchHistory(
      session,
      puuid,
      20 * i,
      20 * (i + 1) - 1,
    );
    specialDict.push(matchHistory);
  }
  session.close();
  return specialDict;
};

//获取一局游戏的详细数据
export const queryGameDetails = async (gameId: number) => {
  return await httpRequest<GameDetail>({
    method: "GET",
    url: `/lol-match-history/v1/games/${gameId}`,
  });
};

//获取游戏模式
export function getGameModeByQueue(
  queue: number,
  defaultValue: GameMode = "rank",
): GameMode {
  if ([420, 430, 440].includes(queue)) {
    return "rank";
  } else if (queue === 450) {
    return "aram";
  } else if ([900, 1010, 1900].includes(queue)) {
    return "urf";
  } else {
    return defaultValue;
  }
}

export const getCurrentQueue = async () => {
  const res = await httpRequest<GameSessionData>({
    method: "GET",
    url: `/lol-gameflow/v1/session`,
  });
  return res?.gameData?.queue?.id || 430;
};

//获取本地符文库
export const getCustomRunes = async (
  champId: number,
  gameMode: GameMode,
  position: PositionName,
) => {
  gameMode = gameMode || "rank";
  position = position || "mid";
  logger.debug("getCustomRunes", champId, gameMode, position);
  return runesDB.queryPageRunes({
    start: 0,
    size: 10,
    mode: [gameMode],
    position: [position],
  }).data;
};

//获取opgg符文
export const getOPGGRunes = async (
  champId: number,
  gameMode: GameMode,
  position: PositionName,
) => {
  gameMode = gameMode || "rank";
  position = position || "mid";
  logger.debug("getOPGGRunes", champId, gameMode, position);
  if (gameMode === "rank") {
    return await getRankRunes(champId, position);
  } else {
    return await getNoneRankRunes(champId, gameMode);
  }
};
