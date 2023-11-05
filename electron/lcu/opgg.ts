import {
  ChampionPopularData,
  ChampionsPopularData,
  GameMode,
  PositionName,
  Rune,
  RunePage,
} from "./opgg_rank_type";
import { CustomRune, RuneConfig } from "../config/type";

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

export async function getChampData(championId: number) {
  let response = await fetch(OPGG_DATA_URL);
  if (!response.ok) {
    throw new Error(response.statusText + " " + (await response.text()));
  }
  const data = (await response.json()) as ChampionsPopularData;
  return data.data.filter((champion) => champion.id === championId)?.[0];
}

// 获取排位模式英雄符文
export async function getRankRunes(championId: number, position: PositionName) {
  const data: ChampionPopularData = await fetch(
    OPGG_RANK_RUNE_URL(championId, position),
  ).then((res) => res.json());
  return extractPreRune(data.data?.rune_pages);
}

// 获取普通模式英雄符文
export async function getNoneRankRunes(championId: number, mode: GameMode) {
  const data: ChampionPopularData = await fetch(
    OPGG_NOR_RUNE_URL(championId, mode),
  ).then((res) => res.json());
  // if ("message" in data) {
  //   console.log(
  //     "getNoneRankRunes",
  //     OPGG_NOR_RUNE_URL(championId, mode),
  //     data["message"],
  //   );
  // }
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
