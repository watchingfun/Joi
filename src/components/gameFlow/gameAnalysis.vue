<script setup lang="ts">
import useLCUStore from "@/store/lcu";
import { storeToRefs } from "pinia";
import TeamAnalysis from "@/components/gameFlow/teamAnalysis.vue";

const lcuStore = useLCUStore();

const { myTeam, queryMyTeamFlag, theirTeam, queryTheirTeamFlag } = storeToRefs(lcuStore);
</script>

<template>
	<div class="flex flex-1">
		<n-tabs animated>
			<n-tab-pane tab="我方队伍" name="myTeam">
				<n-spin :show="queryMyTeamFlag">
					<team-analysis :teams="myTeam" />
				</n-spin>
			</n-tab-pane>
			<n-tab-pane tab="对方队伍" name="theirTeam">
				<n-spin :show="queryTheirTeamFlag">
					<team-analysis :teams="theirTeam" />
				</n-spin>
			</n-tab-pane>
		</n-tabs>
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
