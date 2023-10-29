//https://ddragon.leagueoflegends.com/cdn/13.21.1/data/zh_CN/runesReforged.json
import runesConfig from "@/assets/runesReforged.json";
import { flatMap } from "lodash";

export type MainRuneKey =
  | "Precision"
  | "Domination"
  | "Sorcery"
  | "Resolve"
  | "Inspiration";

export interface RootRune {
  id: number;
  key: MainRuneKey;
  icon: string;
  name: string;
  slots: Slot[];
}

export interface Slot {
  runes: RuneData[];
}

export type RuneData = {
  id: number;
  key: string;
  icon: string;
  name: string;
  shortDesc?: string;
  longDesc?: string;
};

export const runesFlatMap = flatMap(runesConfig, (value, key, collection) => {
  return (value?.slots[0]["runes"] || {
    id: value.id,
    key: value.key,
    icon: value.icon,
    name: value.name,
  }) as unknown as RuneData;
}).reduce((map: Map<number, RuneData>, obj: RuneData) => {
  map.set(obj.id, obj);
  return map;
}, new Map<number, RuneData>());

export const runesMap = runesConfig.reduce((map, obj) => {
  map.set(<MainRuneKey>obj.key, obj as RootRune);
  return map;
}, new Map<MainRuneKey, RootRune>());
