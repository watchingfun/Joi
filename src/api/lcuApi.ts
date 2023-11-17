import { lcuConst } from "@@/const/const";
import { GameDetail, MatchHistoryQueryResult, PageRange, SummonerInfo } from "@@/types/lcuType";
import useLCUStore, { ConnectStatusEnum } from "@/store/lcu";
import useAppStore from "@/store/app";
import { GameMode, PositionName, Rune } from "@@/types/opgg_rank_type";
import { RuneConfig, RunesDBObj } from "@@/types/type";

async function captureError<T>(func: Function | Promise<T>, ...args: any[]) {
	const { message } = useAppStore();
	if (useLCUStore().connectStatus !== ConnectStatusEnum.connected) {
		throw new Error("客户端未连接，LCU api不可用！");
	}
	try {
		if (func instanceof Promise) {
			return await func;
		} else {
			return func(...args) as T;
		}
	} catch (err) {
		if (err instanceof Error) {
			const reg = /Error invoking remote method .+: Error: (.+)/;
			const msg = reg.exec(err.message)?.[1] || err.message;
			message.error(msg);
		}
		console.log("an error occurred: ", err);
		throw err;
	}
}

export default {
	lcuKillRender: () => captureError<void>(window.ipcRenderer.invoke(lcuConst.killRender)),
	getCurrentSummoner: () => captureError<SummonerInfo>(window.ipcRenderer.invoke(lcuConst.getCurrentSummoner)),
	queryMatchHistory: (puuid: string, page: PageRange) =>
		captureError<MatchHistoryQueryResult[]>(window.ipcRenderer.invoke(lcuConst.queryMatchHistory, puuid, page)),
	queryGameDetails: (gameId: number) =>
		captureError<GameDetail>(window.ipcRenderer.invoke(lcuConst.queryGameDetails, gameId)),
	queryTeamMemberGameDetail: (puuid: string) =>
		captureError<GameDetail[]>(window.ipcRenderer.invoke(lcuConst.queryTeamMemberGameDetail, puuid)),
	queryConnectStatus: () => window.ipcRenderer.invoke(lcuConst.queryConnectStatus) as Promise<boolean>,
	getSummonerByName: (nickname: string) =>
		captureError<SummonerInfo>(window.ipcRenderer.invoke(lcuConst.getSummonerByName, nickname)),
	getSummonerByPuuid: (puuid: string) =>
		captureError<SummonerInfo>(window.ipcRenderer.invoke(lcuConst.getSummonerByPuuid, puuid)),
	getCustomRunes: (champId: number, gameMode?: GameMode, position?: PositionName) =>
		captureError<RunesDBObj[]>(window.ipcRenderer.invoke(lcuConst.getCustomRunes, champId, gameMode, position)),
	getOPGGRunes: (champId: number, gameMode?: GameMode, position?: PositionName) =>
		captureError<Rune[]>(window.ipcRenderer.invoke(lcuConst.getOPGGRunes, champId, gameMode, position)),
	applyRune: (data: RuneConfig) => captureError<void>(window.ipcRenderer.invoke(lcuConst.applyRune, data)),

	sendChatMsgToRoom: (conversationId: string, msg: string, type: string = "chat") =>
		captureError<void>(window.ipcRenderer.invoke(lcuConst.sendChatMsgToRoom, conversationId, msg, type))
};
