import { defineStore } from "pinia";
import { Ref, ref } from "vue";
import lcuApi from "@/api/lcuApi";
import { MatchHistoryQueryResult, PageRange, SummonerInfo, TeamMember, TeamMemberInfo } from "@@/types/lcuType";
import useSettingStore from "@/store/setting";
import { GameMode, PositionName } from "@@/types/opgg_rank_type";
import { analysisTeam, generateAnalysisMsg } from "@/utils/gameAnalysis";

export enum ConnectStatusEnum {
	connecting,
	connected,
	disconnect
}

export type GameFlowPhase =
	| "Lobby"
	| "Matchmaking"
	| "ReadyCheck"
	| "ChampSelect"
	| "GameStart"
	| "InProgress"
	| "WaitingForStats"
	| "PreEndOfGame"
	| "EndOfGame"
	| "None";

export interface SummonerGameHistoryResult {
	summonerInfo: SummonerInfo;
	matchHistoryQueryResult: Array<MatchHistoryQueryResult>;
}

export const gameFlowPhaseMap: Record<GameFlowPhase, string> = {
	Lobby: "大厅",
	Matchmaking: "匹配中",
	ReadyCheck: "确认匹配",
	ChampSelect: "英雄选择",
	GameStart: "游戏开始",
	InProgress: "对局中",
	WaitingForStats: "等待统计",
	PreEndOfGame: "游戏结束前",
	EndOfGame: "游戏结束",
	None: "None"
};

const useLCUStore = defineStore("lcu", () => {
	const connectStatus = ref(ConnectStatusEnum.disconnect) as Ref<ConnectStatusEnum>;
	const summonerInfo = ref<SummonerInfo>();
	const search = ref("");

	const summonerQueryList = ref<Array<SummonerGameHistoryResult>>([]);
	const summonerQueryLoading = ref(false);

	const gameFlowPhase = ref<GameFlowPhase>("None");
	const champId = ref(0);
	const currentGameMode = ref<GameMode>();
	const currentPosition = ref<PositionName>();
	const currentChatRoomId = ref<string>();
	const myTeam = ref<TeamMemberInfo[]>([]);
	const theirTeam = ref<TeamMemberInfo[]>([]);

	const queryMyTeamFlag = ref(false);
	const queryTheirTeamFlag = ref(false);

	function sendTeamScoreToRoom() {
		const msg = generateAnalysisMsg(myTeam.value);
		console.log("队伍分析", msg);
		void lcuApi.sendChatMsgToRoom(currentChatRoomId.value!, msg);
	}

	async function analysisMyTeam() {
		queryMyTeamFlag.value = true;
		myTeam.value = await analysisTeam(myTeam.value).finally(() => (queryMyTeamFlag.value = false));
		if (useSettingStore().settingModel.autoSendMyTeamAnalysis) {
			sendTeamScoreToRoom();
		}
	}

	async function analysisTheirTeam() {
		queryTheirTeamFlag.value = true;
		theirTeam.value = await analysisTeam(theirTeam.value).finally(() => (queryTheirTeamFlag.value = false));
		const msg = generateAnalysisMsg(theirTeam.value);
		console.log("对方队伍分析", msg);
	}

	function updateChampId(id: number) {
		champId.value = id;
	}

	async function getCurrentSummoner() {
		return await lcuApi.getCurrentSummoner();
	}

	async function getMatchHistoryQueryResult(
		{
			summonerName,
			puuid,
			pageRange = 1
		}: {
			summonerName?: string;
			puuid?: string;
			pageRange: PageRange;
		} = { pageRange: 1 }
	) {
		let summonerResult: SummonerInfo;
		//优先通过puuid查询,如果没有就用名字查询
		if (puuid) {
			if (summonerQueryList.value.find((s) => s.summonerInfo.puuid === puuid)) {
				return;
			}
			summonerResult = await lcuApi.getSummonerByPuuid(puuid);
		} else if (summonerName) {
			if (summonerQueryList.value.find((s) => s.summonerInfo.displayName === summonerName)) {
				return;
			}
			summonerResult = await lcuApi.getSummonerByName(summonerName);
		} else {
			//如果名字和puuid都没传，那就是查询自己
			summonerResult = summonerInfo.value?.puuid ? summonerInfo.value : await getCurrentSummoner();
		}
		const historyResults = (await lcuApi.queryMatchHistory(summonerResult.puuid as string, pageRange)) || [];
		summonerQueryList.value.push({ summonerInfo: summonerResult, matchHistoryQueryResult: historyResults });
	}

	async function fetchSummonerMatchHistoryData(
		{
			summonerName,
			puuid,
			pageRange = 1
		}: {
			summonerName?: string;
			puuid?: string;
			pageRange?: PageRange;
		} = { pageRange: 1 }
	) {
		console.log("fetchData", { summonerName, puuid });
		summonerQueryLoading.value = true;
		return await getMatchHistoryQueryResult({ summonerName, puuid, pageRange }).finally(() => {
			summonerQueryLoading.value = false;
		});
	}

	function refreshConnectStatus() {
		lcuApi.queryConnectStatus().then((connected: boolean = false) => {
			connectStatus.value = connected ? ConnectStatusEnum.connected : ConnectStatusEnum.disconnect;
		});
	}

	//更新队伍信息
	function updateTeamsInfo(teams: TeamMember[][]) {
		const myTeamMemberIndex = teams.findIndex((teams) => teams.find((t) => t.puuid === summonerInfo.value?.puuid));
		updateMyTeamInfo(teams[myTeamMemberIndex]);
		updateTheirTeamInfo(teams[myTeamMemberIndex === 0 ? 1 : 0]);
		void analysisTheirTeam();
	}

	async function fetchTeamMembersGameDetail(teams: TeamMemberInfo[]) {
		return await Promise.all(
			teams.map(
				async (team) =>
					({
						...team,
						gameDetail: await lcuApi.queryTeamMemberGameDetail(team.puuid)
					}) as TeamMemberInfo
			)
		);
	}

	//刚进入房间时就只能得到召唤师信息，进入游戏前得到位置英雄等信息然后更新下
	function updateMyTeamInfo(teamMembers: TeamMember[]) {
		myTeam.value = teamMembers
			.map((t) => {
				const originInfo = myTeam.value.find((i) => i.puuid === t.puuid);
				return {
					assignedPosition: t.selectedPosition?.toLowerCase(),
					championId: t.championId,
					puuid: t.puuid,
					summonerName: t.summonerName,
					score: originInfo!.score,
					gameDetail: originInfo!.gameDetail
				} as TeamMemberInfo;
			})
			.sort();
	}

	function updateTheirTeamInfo(teamMembers: TeamMember[]) {
		theirTeam.value = teamMembers.map((t) => {
			return {
				assignedPosition: t.selectedPosition?.toLowerCase(),
				championId: t.championId,
				puuid: t.puuid,
				summonerName: t.summonerName,
				gameDetail: []
			} as TeamMemberInfo;
		});
	}

	return {
		champId,
		updateChampId,
		updateTeamsInfo,
		currentChatRoomId,
		currentGameMode,
		currentPosition,
		myTeam,
		queryMyTeamFlag,
		theirTeam,
		queryTheirTeamFlag,
		gameFlowPhase,
		connectStatus,
		getCurrentSummoner,
		getMatchHistoryQueryResult,
		fetchSummonerMatchHistoryData,
		summonerQueryLoading,
		summonerInfo,
		summonerQueryList,
		refreshConnectStatus,
		search,
		analysisMyTeam,
		analysisTheirTeam,
		sendTeamScoreToRoom
	};
});

export default useLCUStore;
