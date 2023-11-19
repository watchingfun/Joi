import { createHttp1Request } from "../lib/league-connect";
import { getCredentials } from "./handleLCU";
import { getCurrentQueue, getGameInfo, listenChampSelect, matchmaking, playAgain } from "./lcuRequest";
import logger from "../lib/logger";
import { setting } from "../config/";
import { ChampSelectPhaseSession } from "../types/lcuType";
import { clearFlag, handleGameSessionData } from "./handleGameSessionData";
import { sendToWebContent } from "../util/util";
import { getGameModeByQueue } from "./utils";
import { lcuConst } from "../const/const";

// 自动接受对局
export function handelAutoAcceptGame(eventKey: string) {
	if (eventKey !== "ReadyCheck") {
		return;
	}
	if (!setting.model.autoAccept) {
		return;
	}
	const setTime = setting.model.autoAcceptDelay;
	setTimeout(async () => {
		try {
			await createHttp1Request(
				{
					method: "POST",
					url: "/lol-matchmaking/v1/ready-check/accept",
					body: null
				},
				getCredentials()
			);
		} catch (e) {
			logger.error(e);
		}
	}, setTime);
}

let unListenChampSelect: Function | null;

//选择英雄
export async function handelChampSelect(eventKey: string) {
	if (eventKey !== "ChampSelect") {
		return;
	}
	clearFlag();
	const gameMode = getGameModeByQueue(await getCurrentQueue());
	unListenChampSelect && unListenChampSelect();
	unListenChampSelect = listenChampSelect((phaseSession: ChampSelectPhaseSession) => {
		handleGameSessionData(phaseSession, gameMode);
	});
}

//选择英雄结束，游戏准备开始
export async function handelGameStart(eventKey: string) {
	if (eventKey !== "GameStart") {
		return;
	}
	try {
		const gameSessionData = await getGameInfo();
		const { teamOne, teamTwo } = gameSessionData.gameData;
		sendToWebContent(lcuConst.gameTeams, [teamOne, teamTwo]);
	} finally {
		if (unListenChampSelect) {
			unListenChampSelect();
			unListenChampSelect = null;
		}
	}
}

//游戏开始
export function handelInProgress(eventKey: string) {
	if (eventKey !== "InProgress") {
		return;
	}
}

//游戏结束等待结算
export function handelWaitingForStats(eventKey: string) {
	if (eventKey !== "WaitingForStats") {
		return;
	}
}

//游戏结束前
export function handelPreEndOfGame(eventKey: string) {
	if (eventKey !== "PreEndOfGame") {
		return;
	}
}

//游戏结束
export async function handelEndOfGame(eventKey: string) {
	if (eventKey !== "EndOfGame") {
		return;
	}
	if (setting.model.autoPlayAgain) {
		await playAgain();
		await matchmaking();
	}
}

export default {
	handelAutoAcceptGame,
	handelChampSelect,
	handelGameStart,
	handelInProgress,
	handelPreEndOfGame
};
