//https://ddragon.leagueoflegends.com/cdn/14.1.1/data/zh_CN/runesReforged.json
import runesConfig from "@/assets/runesReforged.json";
import { flatMap } from "lodash";

export type MainRuneKey = "Precision" | "Domination" | "Sorcery" | "Resolve" | "Inspiration";

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
	slots?: Slot;
};

export const runesFlatMap = flatMap(runesConfig, (value, key, collection) => {
	return [...flatMap(value.slots, (item) => item.runes as RuneData[]), value as RootRune];
}).reduce((map: Map<number, RuneData | RootRune>, obj: RuneData | RootRune) => {
	map.set(obj.id, obj);
	return map;
}, new Map<number, RuneData | RootRune>());

export const runesMap = runesConfig.reduce((map, obj) => {
	map.set(<MainRuneKey>obj.key, obj as RootRune);
	return map;
}, new Map<MainRuneKey, RootRune>());
