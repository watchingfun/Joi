import { GameMode, PositionName, RoleType } from "./opgg_rank_type";

export type SettingModel = Extract<typeof settingModelDefault, { [prop: string]: any }>;

export const settingModelDefault = {
	exitAsk: true, //点击关闭时询问
	exitDirectly: false, //点击关闭时直接退出
	autoAccept: true, //自动接收对局
	autoAcceptDelay: 0, //自动接收对局延迟
	autoConfigRune: false, //自动配置符文
	autoConfigRuneOPGGPriority: false, //自动配置符文优先使用opgg
	autoSendMyTeamAnalysis: false, // 自动发送我方队伍分析数据到聊天室
	autoPlayAgain: false //游戏结束后自动回到大厅 然后搜索对局
};

export interface CustomRune {
	id: number; //基石
	name: string;
	primary_page_id: number; //主系类别id
	primary_rune_ids: number[];
	secondary_page_id: number; //副系类别id
	secondary_rune_ids: number[];
	stat_mod_ids: number[]; //属性
	enabled: boolean;
	position: PositionName[];
	mode: GameMode[];
	role: RoleType[];
}

export interface RuneConfig {
	name: string;
	order: number;
	primaryStyleId: number;
	subStyleId: number;
	selectedPerkIds: number[]; //长度为9的数组 依次为4个主系，副系2个 属性3个
	current: boolean;
}

export interface PageObj<T> {
	total: number;
	data: T[];
}

export interface PageQuery {
	start: number;
	size: number;
}

export interface RunesPageQuery extends PageQuery {
	primaryPageId?: number;
	position?: string[] | string;
	mode?: string[] | string;
	role?: string[] | string;
	name?: string;
}

export interface RunesDBObj {
	id: number;
	value: CustomRune;
}

export type AramChampData = {
	id: string;
	英雄: string;
	胜率: string;
	造伤: string;
	承伤: string;
	治疗: string;
	护盾: string;
	CD: string;
	韧性: string;
	其他: string;
};
