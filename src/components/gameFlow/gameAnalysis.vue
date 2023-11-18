<script setup lang="ts">
import useLCUStore from "@/store/lcu";
import { storeToRefs } from "pinia";
import TeamAnalysis from "@/components/gameFlow/teamAnalysis.vue";

const lcuStore = useLCUStore();

const { myTeam, queryMyTeamFlag, theirTeam, queryTheirTeamFlag } = storeToRefs(lcuStore);
</script>

<template>
	<div class="flex flex-1 relative">
		<n-tabs animated>
			<n-tab-pane tab="我方队伍" name="myTeam">
				<n-spin :show="queryMyTeamFlag">
					<team-analysis :teams="myTeam" />
				</n-spin>
			</n-tab-pane>
			<n-tab-pane tab="对方队伍" name="theirTeam">
				<div v-if="lcuStore.gameFlowPhase === 'ChampSelect'" class="text-2xl flex h-full items-center justify-center">
					等待进入对局
				</div>
				<n-spin :show="queryTheirTeamFlag" v-else>
					<team-analysis :teams="theirTeam" />
				</n-spin>
			</n-tab-pane>
		</n-tabs>
		<div class="absolute right-0 pr-[24px]">
			<n-button @click="lcuStore.sendTeamScoreToRoom">发送评分</n-button>
		</div>
	</div>
</template>

<style scoped>
:deep(.n-spin-container) {
	width: 100%;
	height: 100%;
}

:deep(.n-spin-content) {
	width: 100%;
	height: 100%;
}
</style>
