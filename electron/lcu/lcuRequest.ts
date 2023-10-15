import {
  createHttp1Request,
  createHttp2Request,
  createHttpSession,
} from "../lib/league-connect";
import { getCredentials, getLeagueWebSocket } from "./handleLCU";
import { ClientHttp2Session } from "http2";
import { champDict } from "../config/lolDataConfig";
import {
  ChampSelectPhaseSession,
  GameDetail,
  GameSessionData,
  MatchHistoryQueryResult,
  PageRange,
  SummonerInfo,
  TeamMember,
} from "./interface";
import logger from "../lib/logger";

//获取当前召唤师信息
export async function getCurrentSummoner() {
  return (
    await createHttp1Request(
      {
        method: "GET",
        url: "/lol-summoner/v1/current-summoner",
      },
      getCredentials(),
    )
  ).json() as SummonerInfo;
}

//监听选择的英雄
export function listenChampSelect(): Function {
  const ws = getLeagueWebSocket();
  ws.subscribe(
    "/lol-champ-select/v1/session",
    async (data: ChampSelectPhaseSession) => {
      const currentChampId = await getCurrentChampId();
      logger.debug("currentChampId", currentChampId);
      logger.debug("champ-select-session", JSON.stringify(data));
    },
  );
  return () => ws.unsubscribe("/lol-champ-select/v1/session");
}

// 获取当前选择的英雄
export async function getCurrentChampId() {
  let credentials = getCredentials();
  const session = await createHttpSession(credentials);
  const currentChamp = await createHttp2Request(
    {
      method: "GET",
      url: "/lol-champ-select/v1/current-champion",
    },
    session,
    credentials,
  );
  session.close();
  return currentChamp.json() as number;
}

//todo 类型确认
// 获取召唤师的英雄
const getSelectChamp = (playerChampionSelections) => {
  let champDict = {};
  for (const summonerSelect of playerChampionSelections) {
    champDict[summonerSelect.summonerInternalName] = summonerSelect.championId;
  }
  return champDict;
};

// 查询对局游戏信息(召唤师ID,昵称,英雄)
export async function getGameInfo() {
  const summoner = await getCurrentSummoner();
  const matchSession = (
    await createHttp1Request(
      {
        method: "GET",
        url: `/lol-gameflow/v1/session`,
      },
      getCredentials(),
    )
  ).json() as GameSessionData;

  logger.debug("matchSession", JSON.stringify(matchSession));

  let friendInfoList = [];
  let enemyInfoList = [];
  const playerChampionSelections = getSelectChamp(
    matchSession.gameData.playerChampionSelections,
  );

  let enemyInfo: TeamMember[];
  let friendInfo: TeamMember[];
  if (
    matchSession.gameData.teamOne.find(
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

const getPosition = (selectedPosition) => {
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
  }
};

//todo 符文类型确认
//应用符文
export async function applyRune(data) {
  let credentials = getCredentials();
  // 获取符文页信息
  const currentRuneList = (
    await createHttp1Request(
      {
        method: "GET",
        url: "lol-perks/v1/pages",
      },
      credentials,
    )
  ).json();
  logger.info("currentRuneList", currentRuneList);
  const current = currentRuneList.find((i) => i.current && i.isDeletable);
  if (current != undefined) {
    // 删除当前符文页
    await createHttp1Request(
      {
        method: "DELETE",
        url: `lol-perks/v1/pages/${current.id}`,
      },
      credentials,
    );
  }
  // 写入新的符文页
  await createHttp1Request(
    {
      method: "POST",
      url: "lol-perks/v1/pages",
      body: data,
    },
    credentials,
  );
  return true;
}

// 根据召唤师ID查询信息
export async function querySummonerInfo(summonerId: number) {
  const summonerInfo = (
    await createHttp1Request(
      {
        method: "GET",
        url: `/lol-summoner/v1/summoners/${summonerId}`,
      },
      getCredentials(),
    )
  ).json() as SummonerInfo;
  const imgUrl = `https://wegame.gtimg.com/g.26-r.c2d3c/helper/lol/assis/images/resources/usericon/${summonerInfo.profileIconId}.png`;
  return {
    name: summonerInfo.displayName,
    imgUrl,
    lv: summonerInfo.summonerLevel,
    xpSL: summonerInfo.xpSinceLastLevel,
    xpNL: summonerInfo.xpUntilNextLevel,
    puuid: summonerInfo.puuid,
    summonerId: summonerInfo.summonerId,
  };
}

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
  const response = (
    await createHttp1Request(
      {
        method: "GET",
        url: `/lol-match-history/v1/games/${gameId}`,
      },
      getCredentials(),
    )
  ).json() as GameDetail;
  logger.debug("queryGameDetails", response);
  return response;
};

// 获取召唤师participantId 和 name
const getparticipantIdAndName = (participantIdentities) => {
  let dataList = [];
  for (const participantIdentity of participantIdentities) {
    dataList.push({
      name: participantIdentity.player.summonerName,
      summonerId: participantIdentity.player.accountId,
    });
  }
  return dataList;
};

// // 获取召唤师participants下面的详细数据
// const getParticipantsDetails = (res, participants, participantIdentities) => {
//   const nameList = getparticipantIdAndName(participantIdentities);
//   let titleList = getDetailsTitle(res);
//   let detalisList = [];
//   let team100Kills = 0;
//   let team200Kills = 0;
//   let team100GoldEarned = 0;
//   let team200GoldEarned = 0;
//   for (let i = 0; i < 5; i++) {
//     team100Kills += participants[i].stats.kills;
//     team200Kills += participants[i + 5].stats.kills;
//     team100GoldEarned += participants[i].stats.goldEarned;
//     team200GoldEarned += participants[i + 5].stats.goldEarned;
//
//     detalisList.push([
//       analyticalData(participants[i], nameList[i].name, nameList[i].summonerId),
//       analyticalData(
//         participants[i + 5],
//         nameList[i + 5].name,
//         nameList[i + 5].summonerId,
//       ),
//     ]);
//   }
//   titleList.push(
//     team100Kills,
//     team200Kills,
//     goldToStr(team100GoldEarned),
//     goldToStr(team200GoldEarned),
//   );
//   detalisList.push(titleList);
//   return detalisList;
// };
const goldToStr = (gold) => {
  return Number((gold / 1000).toFixed(1));
};
// 解析对局数据
const analyticalData = (participant, nameList, accountIdList) => {
  return {
    name: nameList,
    accountId: accountIdList,
    teamType: participant.teamId,
    champLevel: participant.stats.champLevel,
    champImgUrl: `https://game.gtimg.cn/images/lol/act/img/champion/${
      champDict[participant.championId].alias
    }.png`,
    spell1Id: getspellImgUrl(participant.spell1Id),
    spell2Id: getspellImgUrl(participant.spell2Id),
    item0: getItemImgUrl(participant.stats.item0),
    item1: getItemImgUrl(participant.stats.item1),
    item2: getItemImgUrl(participant.stats.item2),
    item3: getItemImgUrl(participant.stats.item3),
    item4: getItemImgUrl(participant.stats.item4),
    item5: getItemImgUrl(participant.stats.item5),
    item6: getItemImgUrl(participant.stats.item6),
    kills: participant.stats.kills,
    deaths: participant.stats.deaths,
    assists: participant.stats.assists,
    totalDamageDealtToChampions: participant.stats.totalDamageDealtToChampions,
    totalDamageTaken: participant.stats.totalDamageTaken,
    goldEarned: participant.stats.goldEarned,
    visionScore: participant.stats.visionScore,
    totalMinionsKilled:
      participant.stats.totalMinionsKilled +
      participant.stats.neutralMinionsKilled,
  };
};
// 获取当前页面顶部详细数据
const getDetailsTitle = (gameInfo) => {
  let createTime = new Date(gameInfo.gameCreation).toLocaleString().split(" ");
  let dateStr = createTime[0].slice(5);
  let timeStr = createTime[1].slice(0, 5);
  if (queryGameType(gameInfo.queueId).indexOf(" ") != -1) {
    var lane = queryGameType(gameInfo.queueId).split(" ")[1];
  } else {
    var lane = queryGameType(gameInfo.queueId);
  }

  let gameDuration = (gameInfo.gameDuration / 60).toFixed(0);
  return [dateStr, timeStr, lane, gameDuration];
};
// 根据游戏模式ID判断 游戏模式
const queryGameType = (queueId: number) => {
  switch (queueId) {
    case 420:
      return "排位赛 单排/双排";
    case 430:
      return "匹配模式";
    case 440:
      return "排位赛 灵活排位";
    case 450:
      return "极地大乱斗";
  }
  return "其它模式";
};
// 通过物品id获取图片地址
const getItemImgUrl = (item) => {
  if (item == 7013) {
    return `https://game.gtimg.cn/images/lol/act/img/item/3802.png`;
  } else if (item == 7004) {
    return `https://game.gtimg.cn/images/lol/act/img/item/3068.png`;
  }
  if (item == 0) {
    //todo 使用本地图片
    return "https://gw.alipayobjects.com/zos/rmsportal/wYnHWSXDmBhiEmuwXsym.png?x-oss-process=image%2Fresize%2Cm_fill%2Cw_64%2Ch_64%2Fformat%2Cpng";
  } else {
    return `https://game.gtimg.cn/images/lol/act/img/item/${item}.png`;
  }
};
// 通过召唤师id获取召唤师技能图片地址
const getspellImgUrl = (spellId) => {
  switch (spellId) {
    case 4:
      return "https://game.gtimg.cn/images/lol/act/img/spell/Summoner_flash.png";
    case 14:
      return "https://game.gtimg.cn/images/lol/act/img/spell/SummonerIgnite.png";
    case 11:
      return "https://game.gtimg.cn/images/lol/act/img/spell/Summoner_smite.png";
    case 6:
      return "https://game.gtimg.cn/images/lol/act/img/spell/Summoner_haste.png";
    case 12:
      return "https://game.gtimg.cn/images/lol/act/img/spell/Summoner_teleport.png";
    case 21:
      return "https://game.gtimg.cn/images/lol/act/img/spell/SummonerBarrier.png";
    case 3:
      return "https://game.gtimg.cn/images/lol/act/img/spell/Summoner_exhaust.png";
    case 1:
      return "https://game.gtimg.cn/images/lol/act/img/spell/Summoner_boost.png";
    case 7:
      return "https://game.gtimg.cn/images/lol/act/img/spell/Summoner_heal.png";
    case 32:
      return "https://game.gtimg.cn/images/lol/act/img/spell/Summoner_Mark.png";
  }
  return "https://game.gtimg.cn/images/lol/act/img/spell/SummonerMana.png";
};

const summonerSpellsImgMap = {};
