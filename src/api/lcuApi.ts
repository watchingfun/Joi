import { Handle } from "@@/const/const";
import { GameDetail, MatchHistoryQueryResult, SummonerInfo } from "@@/types/lcuType";
import useAppStore from "@/store/app";
import { GameMode, PositionName, Rune } from "@@/types/opgg_rank_type";
import { RuneConfig, RunesDBObj } from "@@/types/type";
import { isPromise } from "@vue/shared";

async function captureError<T>(func: Function | Promise<T>, ...args: any[]) {
	const { message } = useAppStore();
	try {
		if (isPromise(func)) {
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
	lcuKillRender: () => captureError<void>(window.ipcRenderer.invoke(Handle.killRender)),
	playAgain: () => captureError<void>(window.ipcRenderer.invoke(Handle.playAgain)),
	getCurrentSummoner: () => captureError<SummonerInfo>(window.ipcRenderer.invoke(Handle.getCurrentSummoner)),
	queryMatchHistory: (puuid: string, page: number = 1, pageSize: number = 8) =>
		captureError<MatchHistoryQueryResult>(window.ipcRenderer.invoke(Handle.queryMatchHistory, puuid, page, pageSize)),
	queryGameDetails: (gameId: number) =>
		captureError<GameDetail>(window.ipcRenderer.invoke(Handle.queryGameDetails, gameId)),
	queryTeamMemberGameDetail: (puuid: string) =>
		captureError<GameDetail[]>(window.ipcRenderer.invoke(Handle.queryTeamMemberGameDetail, puuid)),
	queryConnectStatus: () => window.ipcRenderer.invoke(Handle.queryConnectStatus) as Promise<boolean>,
	getSummonerByName: (nickname: string) =>
		captureError<SummonerInfo>(window.ipcRenderer.invoke(Handle.getSummonerByName, nickname)),
	getSummonerByPuuid: (puuid: string) =>
		captureError<SummonerInfo>(window.ipcRenderer.invoke(Handle.getSummonerByPuuid, puuid)),
	getCustomRunes: (champId: number, gameMode?: GameMode, position?: PositionName) =>
		captureError<RunesDBObj[]>(window.ipcRenderer.invoke(Handle.getCustomRunes, champId, gameMode, position)),
	getOPGGRunes: (champId: number, gameMode?: GameMode, position?: PositionName) =>
		captureError<Rune[]>(window.ipcRenderer.invoke(Handle.getOPGGRunes, champId, gameMode, position)),
	applyRune: (data: RuneConfig) => captureError<void>(window.ipcRenderer.invoke(Handle.applyRune, data)),
  startLoLClient: () => captureError<void>(window.ipcRenderer.invoke(Handle.startLoLClient)),
	sendChatMsgToRoom: (conversationId: string, msg: string, type: string = "chat") =>
		captureError<void>(window.ipcRenderer.invoke(Handle.sendChatMsgToRoom, conversationId, msg, type))
};
