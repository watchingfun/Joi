import { GameDetail, MatchHistoryQueryResult, TeamMemberInfo } from "@@/types/lcuType";
import { Handle } from "@@/const/const";
import { retryWrapper } from "@/utils/util";
import { champDict } from "@@/const/lolDataConfig";
import playerNotesApi from "@/api/playerNotesApi";

export async function analysisTeam(teams: TeamMemberInfo[]) {
	const requestQueue = teams.map((t) => {
		return async () => {
			const gameDetails = (
				await retryWrapper<MatchHistoryQueryResult>(
					() => window.ipcRenderer.invoke(Handle.queryMatchHistory, t.puuid, 1, 20),
					5,
					1000
				)()
			).games.games;
			return {
				...t,
				note: await playerNotesApi.queryPlayerNote(t.puuid), //查询玩家备注
				gameDetail: gameDetails,
				score: computeScore(gameDetails)
			} as TeamMemberInfo;
		};
	});
	const results: TeamMemberInfo[] = [];
	//改成顺序延迟执行，减少服务器压力
	for (const req of requestQueue) {
		await new Promise((resolve) => setTimeout(resolve, 500));
		results.push(await req());
	}
	return results;
}

//分析组队信息
export async function analysisTeamUpInfo(teams: TeamMemberInfo[]) {
	const gameIdMap = new Map<string, TeamMemberInfo[]>();
	for (const member of teams) {
		if (!member.gameDetail?.[0].gameId) {
			continue;
		}
    //按上局游戏id和队伍id进行分组，分组数大于1说明这组玩家可能是组队
		const key = member.gameDetail[0].gameId + "_" + member.gameDetail[0].participants[0].teamId;
		if (gameIdMap.has(key)) {
			gameIdMap.get(key)!.push(member);
		} else {
			gameIdMap.set(key, [member]);
		}
	}
	return Array.from(gameIdMap.values())
		.filter((v) => v.length > 1)
		.map((v) => {
			return v.map((t) => t.puuid);
		});
}

export function computeScore(gameDetail?: GameDetail[]) {
	if (!gameDetail || gameDetail.length === 0) {
		return 0;
	}
	// KDA->(击杀*1.2+助攻*0.8)/(死亡*1.2)  辅助助攻系数为1.2
	// 输赢->赢+1 输-1
	const filterResults = gameDetail.filter((detail) => {
		//只统计 匹配，单排，大乱斗，组排 还排除重开局
		return [430, 420, 450, 440].includes(detail.queueId) && detail.gameDuration > 3 * 60;
	});

	return (
		filterResults.reduce((previousValue, detail) => {
			const info = detail.participants[0];
			let { kills, assists, deaths } = info.stats;
			deaths = deaths || 1;
			let score;
			if (info.timeline.role === "SUPPORT" && detail.gameMode !== "ARAM") {
				score = (kills + assists * 1.2) / deaths; //非大乱斗模式的辅助英雄
			} else {
				score = (kills + assists) / deaths;
			}
			if (detail.gameMode === "ARAM" || info.timeline.role !== "SUPPORT") {
				if (deaths > 15 && kills <= 10) {
					score -= 0.5;
				}
				if (deaths > 20 && kills <= 10) {
					score -= 1;
				}
			}
			if (info.stats.win) {
				score += 1;
			} else {
				score -= 1;
			}
			return previousValue + score;
		}, 0) / filterResults.length
	).toFixed(2);
}

export function generateAnalysisMsg(teams: TeamMemberInfo[]) {
	let msg: string[] = [];
	teams
		.sort((a, b) => (a.score! > b.score! ? 1 : a.score === b.score ? 0 : -1))
		.forEach((i, index) => msg.push(`${champDict[i.championId + ""]?.label || i.summonerName}:\t ${i.score}`));
	return msg; //msg.join("\n") + "\n" + chatDividerLine + "——WeGame";
}
