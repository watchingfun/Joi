import useLCUStore, { ConnectStatusEnum, GameFlowPhase } from "@/store/lcu";
import { Handle } from "@@/const/const";
import router from "@/router";
import { SimpleChampSelectPhaseSessionData, TeamMember, TeamMemberInfo } from "@@/types/lcuType";
import IpcRendererEvent = Electron.IpcRendererEvent;

export function setupListener() {
	const lcuStore = useLCUStore();
	window.ipcRenderer.on(Handle.disconnect, (event: IpcRendererEvent, ...args: any[]) => {
		lcuStore.connectStatus = ConnectStatusEnum.disconnect;
	});
	window.ipcRenderer.on(Handle.connecting, (event: IpcRendererEvent, ...args: any[]) => {
		lcuStore.connectStatus = ConnectStatusEnum.connecting;
	});
	window.ipcRenderer.on(Handle.connected, (event: IpcRendererEvent, ...args: any[]) => {
		lcuStore.connectStatus = ConnectStatusEnum.connected;
		void lcuStore.getCurrentSummoner();
	});
	window.ipcRenderer.on("jumpRoute", (event: IpcRendererEvent, ...args: any[]) => {
		void router.push(args[0] as string | { name: string });
	});
	window.ipcRenderer.on(Handle.gameFlowPhase, (event: IpcRendererEvent, phase: GameFlowPhase) => {
		console.log("gameFlowPhase", phase);
		if (phase === "Matchmaking") {
			lcuStore.updateChampId(0);
		}
		lcuStore.gameFlowPhase = phase;
	});
	window.ipcRenderer.on(
		Handle.gameSessionData,
		async (event: IpcRendererEvent, gameSessionData: SimpleChampSelectPhaseSessionData) => {
			console.log("gameSessionData", gameSessionData);
			lcuStore.currentPosition = gameSessionData.selectedResult?.position;
			lcuStore.currentGameMode = gameSessionData.gameMode;
		}
	);
	window.ipcRenderer.on(Handle.gameTeams, async (event: IpcRendererEvent, teams: TeamMember[][]) => {
		console.log("gameTeams", teams);
		lcuStore.updateTeamsInfo(teams);
	});

	window.ipcRenderer.on(Handle.gameSessionMyTeam, async (event: IpcRendererEvent, myTeam: TeamMemberInfo[]) => {
		lcuStore.myTeam = myTeam;
		lcuStore.theirTeam = [];
		await lcuStore.analysisMyTeam();
	});

	window.ipcRenderer.on(Handle.gameSessionRoomId, async (event: IpcRendererEvent, chatRoomId: string) => {
		lcuStore.currentChatRoomId = chatRoomId;
	});

	window.ipcRenderer.on(Handle.champSelect, async (event: IpcRendererEvent, champId: number) => {
		console.log("champSelect", champId);
		lcuStore.updateChampId(champId);
	});
}
