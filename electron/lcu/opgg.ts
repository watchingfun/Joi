import {
  ChampionPopularData,
  ChampionsPopularData,
  GameMode,
  PositionName,
  Rune,
  RunePage,
} from "../types/opgg_rank_type";
import opggRankDataJson from "./opggRankData.json";
import { CustomRune, RuneConfig } from "../types/type";
import { memoize } from "lodash";
import { LRUCache } from "lru-cache";

const OPGG_RANK_RUNE_URL = (championId: number, position: PositionName) =>
  `https://lol-api-champion.op.gg/api/KR/champions/ranked/${championId}/${position}`;
const OPGG_NOR_RUNE_URL = (championId: number, mode: GameMode) =>
  `https://lol-api-champion.op.gg/api/kr/champions/${mode}/${championId}/none`;
const OPGG_DATA_URL: string =
  "https://lol-api-champion.op.gg/api/KR/champions/ranked";

async function checkResponse(response: Response) {
  if (!response.ok) {
    throw new Error(response.statusText + " " + (await response.text()));
  }
}

//let opggRankData: ChampionsPopularData | null;

async function getOpggRankData() {
  // if (!opggRankData) {
  //   let response = await fetch(OPGG_DATA_URL);
  //   await checkResponse(response);
  //   opggRankData = (await response.json()) as ChampionsPopularData;
  // }
  // return opggRankData;
  return opggRankDataJson as ChampionsPopularData;
}

//查询opgg排位的符文数据
const cacheFetchOpggRankRune = memoize(
  async (championId: number, position: PositionName) => {
    const response = await fetch(OPGG_RANK_RUNE_URL(championId, position));
    await checkResponse(response);
    return (await response.json()) as ChampionPopularData;
  },
);
cacheFetchOpggRankRune.cache = new LRUCache({ max: 100 });

//查询opgg非排位的符文数据
const cacheFetchOpggNoRankRune = memoize(
  async (championId: number, mode: GameMode) => {
    const response = await fetch(OPGG_NOR_RUNE_URL(championId, mode));
    await checkResponse(response);
    return (await response.json()) as ChampionPopularData;
  },
);
cacheFetchOpggNoRankRune.cache = new LRUCache({ max: 100 });

export async function getChampPosition(championId: number) {
  const data = await getOpggRankData();
  const championData = data.data.filter(
    (champion) => champion.id === championId,
  );
  if (championData?.[0].positions?.length) {
    return championData[0].positions[0].name;
  } else {
    return "mid";
  }
}

export async function getChampData(championId: number) {
  const data = await getOpggRankData();
  return data.data.filter((champion) => champion.id === championId)?.[0];
}

// 获取排位模式英雄符文
export async function getRankRunes(championId: number, position: PositionName) {
  const data: ChampionPopularData = await cacheFetchOpggRankRune(
    championId,
    position,
  );
  return extractPreRune(data.data?.rune_pages);
}

// 获取普通模式英雄符文
export async function getNoneRankRunes(championId: number, mode: GameMode) {
  const data: ChampionPopularData = await cacheFetchOpggNoRankRune(
    championId,
    mode,
  );
  return extractPreRune(data.data?.rune_pages);
}

function extractPreRune(runePages: RunePage[]) {
  if (!runePages) {
    return [];
  }
  return runePages.flatMap((page) => page.builds[0]);
}

export function convertOPGGRuneFormat(
  rune: Rune | CustomRune,
  name: string,
): RuneConfig {
  return {
    name: name,
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
