import { GameDetail, MatchHistoryQueryResult, TeamMemberInfo } from "@@/types/lcuType";
import lcuApi from "@/api/lcuApi";
import { chatDividerLine, Handle } from "@@/const/const";
import { intersectionWith } from "lodash";
import { retryWrapper } from "@/utils/util";

export async function analysisTeam(teams: TeamMemberInfo[]) {
	return await Promise.all(
		teams.map(async (t) => {
			const gameDetails = (
				await retryWrapper<MatchHistoryQueryResult>(
					() => window.ipcRenderer.invoke(Handle.queryMatchHistory, t.puuid, 1, 8),
					5
				)()
			).games.games;
			return {
				...t,
				gameDetail: gameDetails,
				score: computeScore(gameDetails)
			} as TeamMemberInfo;
		})
	);
}

//分析组队信息
export async function analysisTeamUpInfo(teams: TeamMemberInfo[]) {
	const teamUpGroups: Array<Array<string>> = [];
	for (const member of teams) {
		if (!member.gameDetail?.[0].gameId) {
			continue;
		}
		if (teamUpGroups.find((teamUps) => teamUps.includes(member.puuid))) {
			continue;
		}
		const previousGameDetail = await lcuApi.queryGameDetails(member.gameDetail![0].gameId!);
		const plays = previousGameDetail.participantIdentities.map((i) => i.player);
		//取上一把的友方队伍
		const friendlyPlays = plays?.findIndex((p) => p.puuid === member.puuid) > 4 ? plays?.slice(5) : plays?.slice(0, 5);
		const teamUp = intersectionWith(teams, friendlyPlays, (t, p) => t.puuid === p.puuid).map((t) => t.puuid);
		if (teamUp.length > 1) {
			teamUpGroups.push(teamUp);
		}
	}
	return teamUpGroups;
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
	let msg = ["队伍评分：\n" + chatDividerLine];
	teams
		.map((t) => {
			return { puuid: t.puuid, summonerName: t.summonerName, score: t.score };
		})
		.sort((a, b) => (a.score! > b.score! ? 1 : a.score === b.score ? 0 : -1))
		.forEach((i) => msg.push(`${i.summonerName}:\t${i.score}`));
	return msg.join("\n") + "\n" + chatDividerLine + "——WeGame";
}
