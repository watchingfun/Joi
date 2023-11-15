import { GameDetail, TeamMemberInfo } from "@@/types/lcuType";
import lcuApi from "@/api/lcuApi";
import { chatDividerLine } from "@@/const/const";

export async function analysisTeam(teams: TeamMemberInfo[]) {
	return await Promise.all(
		teams.map(async (t) => {
			const gameDetails = (await lcuApi.queryMatchHistory(t.puuid, 1))?.flatMap((i) => i.games.games);
			return {
				...t,
				gameDetail: gameDetails,
				score: computeScore(gameDetails)
			} as TeamMemberInfo;
		})
	);
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
			let score =
				info.timeline.role !== "SUPPORT"
					? (kills * 1.2 + assists * 0.8) / (deaths * 1.2)
					: (kills * 1.2 + assists * 1.2) / (deaths * 1.2);
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
	let msg = ["\n" + chatDividerLine];
	teams
		.map((t) => {
			return { puuid: t.puuid, summonerName: t.summonerName, score: t.score };
		})
		.sort((a, b) => (a.score! > b.score! ? 1 : a.score === b.score ? 0 : -1))
		.forEach((i) => msg.push(`${i.summonerName}:\t${i.score}`));
	return msg.join("\n") + "\n" + chatDividerLine + "——WeGame";
}
