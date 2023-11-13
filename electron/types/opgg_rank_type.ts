export type PositionName = "adc" | "jungle" | "mid" | "support" | "top";
export type GameMode = "rank" | "aram" | "urf";
export type RoleType = keyof typeof roleMap;
export const roleMap = {
	CONTROLLER: "控制",
	FIGHTER: "战士",
	ASSASSIN: "刺客",
	SLAYER: "屠杀者(战士&刺客&坦克)",
	MAGE: "法师",
	MARKSMAN: "射手",
	TANK: "坦克"
};

export const gameModeMap = {
	RANK: "排位",
	ARAM: "极地大乱斗",
	URF: "无限火力"
};

export const positionMap = {
	TOP: "上单",
	MID: "中单",
	ADC: "射手",
	JUNGLE: "打野",
	SUPPORT: "辅助"
};

export interface ChampionPopularData {
	data: SummaryData;
	meta: Meta;
}

export interface ChampionsPopularData {
	data: Champion[];
	meta: Meta;
}

export interface SummaryData {
	summary: Champion;
	summoner_spells: SummonerSpell[];
	core_items: CoreItem[];
	mythic_items: MythicItem[];
	boots: Boot[];
	starter_items: StarterItem[];
	last_items: LastItem[];
	rune_pages: RunePage[];
	runes: Rune[];
	skill_masteries: SkillMastery[];
	skills: Skill[];
	skill_evolves: any[];
	trends: Trends;
	game_lengths: GameLength[];
	counters: Counter2[];
}

export interface Champion {
	id: number;
	is_rotation: boolean;
	is_rip: boolean;
	average_stats: AverageStats;
	positions: Position[];
	roles: Role2[];
}

export interface AverageStats {
	win_rate: number;
	pick_rate: number;
	ban_rate: number;
	kda: number;
	tier: number;
	rank: number;
}

export interface Position {
	name: PositionName;
	stats: Stats;
	roles: Role[];
	counters: Counter[];
}

export interface Stats {
	win_rate: number;
	pick_rate: number;
	role_rate: number;
	ban_rate: number;
	kda: number;
	tier_data: TierData;
}

export interface TierData {
	tier: number;
	rank: number;
	rank_prev: number;
	rank_prev_patch: number;
}

export interface Role {
	name: string;
	stats: Stats2;
}

export interface Stats2 {
	win_rate: number;
	role_rate: number;
	play: number;
	win: number;
}

export interface Counter {
	champion_id: number;
	play: number;
	win: number;
}

export interface Role2 {
	name: string;
	stats: Stats3;
}

export interface Stats3 {
	win_rate: number;
	role_rate: number;
	play: number;
	win: number;
}

export interface SummonerSpell {
	ids: number[];
	win: number;
	play: number;
	pick_rate: number;
}

export interface CoreItem {
	ids: number[];
	play: number;
	win: number;
	pick_rate: number;
}

export interface MythicItem {
	id: number;
	play: number;
	win: number;
	pick_rate: number;
	builds: Build[];
}

export interface Build {
	ids: number[];
	play: number;
	win: number;
	pick_rate: number;
}

export interface Boot {
	ids: number[];
	play: number;
	win: number;
	pick_rate: number;
}

export interface StarterItem {
	ids: number[];
	play: number;
	win: number;
	pick_rate: number;
}

export interface LastItem {
	ids: number[];
	play: number;
	win: number;
	pick_rate: number;
}

export interface RunePage {
	id: number;
	primary_page_id: number;
	secondary_page_id: number;
	play: number;
	win: number;
	pick_rate: number;
	builds: Rune[];
}

export interface Rune {
	id: number;
	primary_page_id: number;
	primary_rune_ids: number[];
	secondary_page_id: number;
	secondary_rune_ids: number[];
	stat_mod_ids: number[];
	play: number;
	win: number;
	pick_rate: number;
}

export interface SkillMastery {
	ids: string[];
	play: number;
	win: number;
	pick_rate: number;
	builds: Skill[];
}

export interface Skill {
	order: string[];
	play: number;
	win: number;
	pick_rate: number;
}

export interface Trends {
	total_rank: number;
	total_position_rank: number;
	win: Win[];
	pick: Pick[];
	ban: Ban[];
}

export interface Win {
	version: string;
	rate: number;
	rank: number;
	created_at: string;
}

export interface Pick {
	version: string;
	rate: number;
	rank: number;
	created_at: string;
}

export interface Ban {
	version: string;
	rate: number;
	rank: number;
	created_at: string;
}

export interface GameLength {
	game_length: number;
	rate: number;
	average: number;
	rank: number;
}

export interface Counter2 {
	champion_id: number;
	play: number;
	win: number;
}

export interface Meta {
	version: string;
	cached_at: string;
}
