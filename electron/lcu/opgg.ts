import {
  ChampionPopularData,
  ChampionsPopularData,
  GameMode,
  PositionName,
  Rune,
} from "./opgg_rank_type";
import { CustomRune, RuneConfig } from "../config/type";
import { champDict } from "../const/lolDataConfig";

const OPGG_RANK_RUNE_URL = (championId: number, position: PositionName) =>
  `https://lol-api-champion.op.gg/api/KR/champions/ranked/${championId}/${position}`;
const OPGG_NOR_RUNE_URL = (championId: number, mode: GameMode) =>
  `https://lol-api-champion.op.gg/api/kr/champions/${mode}/${championId}/none`;
const OPGG_DATA_URL: string =
  "https://lol-api-champion.op.gg/api/KR/champions/ranked";

export async function getChampPosition(championId: number) {
  let response = await fetch(OPGG_DATA_URL);
  if (!response.ok) {
    throw new Error(response.statusText + " " + (await response.text()));
  }
  const data = (await response.json()) as ChampionsPopularData;
  const championData = data.data.filter(
    (champion) => champion.id === championId,
  );
  if (championData?.[0].positions?.length) {
    return championData[0].positions[0].name;
  } else {
    return "MID";
  }
}

// 获取排位模式英雄符文
export async function getRankRune(championId: number, position: PositionName) {
  const data: ChampionPopularData = await fetch(
    OPGG_RANK_RUNE_URL(championId, position),
  ).then((res) => res.json());
  return data.data.rune_pages[0].builds[0];
}

// 获取普通模式英雄符文
export async function getNoneRankRune(championId: number, mode: GameMode) {
  const data: ChampionPopularData = await fetch(
    OPGG_NOR_RUNE_URL(championId, mode),
  ).then((res) => res.json());
  return data.data.rune_pages[0].builds[0];
}

export function convertOPGGRuneFormat(rune: Rune | CustomRune): RuneConfig {
  return {
    name: rune?.name || "OP.GG " + champDict[rune.id + ""]?.label,
    order: rune["id"],
    primaryStyleId: rune["primary_page_id"],
    subStyleId: rune["secondary_page_id"],
    selectedPerkIds: [
      ...rune["primary_rune_ids"],
      ...rune["secondary_rune_ids"],
      ...rune["stat_mod_ids"],
    ],
    current: true,
  };
}

//获取游戏模式
export function getGameModeByQueue(queue: number): GameMode {
  if ([420, 430, 440].includes(queue)) {
    return "RANK";
  } else if (queue === 450) {
    return "ARAM";
  } else if ([900, 1010, 1900].includes(queue)) {
    return "URF";
  }
}
