<script setup lang="ts">
import useLCUStore from "@/store/lcu";
import { storeToRefs } from "pinia";
import TeamAnalysis from "@/components/gameFlow/teamAnalysis.vue";
import { PropType } from "vue";

const lcuStore = useLCUStore();

const props = defineProps({
	tabValue: {
		type: String as PropType<"myTeam" | "theirTeam">,
		default: "myTeam"
	}
});

const emit = defineEmits(["update:tabValue"]);

const {
	myTeam,
	queryMyTeamFlag,
	theirTeam,
	queryTheirTeamFlag,
	myTeamUpInfo,
	theirTeamUpInfo,
	theirTeamIsSuck,
	myTeamAnalysisError,
	theirTeamAnalysisError
} = storeToRefs(lcuStore);

const tabValue = computed({
	get() {
		return props.tabValue;
	},
	set(val) {
		emit("update:tabValue", val);
	}
});
</script>

<template>
	<div class="flex flex-1 relative">
		<n-tabs animated v-model:value="tabValue">
			<n-tab-pane tab="我方队伍" name="myTeam">
				<n-spin :show="queryMyTeamFlag">
					<div class="flex flex-col justify-center items-center w-full h-full">
						<n-button v-if="myTeamAnalysisError" @click="lcuStore.analysisMyTeam">重试</n-button>
						<team-analysis v-else :teams="myTeam" :team-up-info="myTeamUpInfo" />
					</div>
				</n-spin>
			</n-tab-pane>
			<n-tab-pane tab="对方队伍" name="theirTeam">
				<div v-if="lcuStore.gameFlowPhase === 'ChampSelect'" class="text-2xl flex h-full items-center justify-center">
					等待进入对局
				</div>
				<n-spin :show="queryTheirTeamFlag" v-else>
					<div class="flex flex-col justify-center items-center w-full h-full">
						<n-button v-if="theirTeamAnalysisError" @click="lcuStore.analysisTheirTeam">重试</n-button>
						<team-analysis :teams="theirTeam" :team-up-info="theirTeamUpInfo" :loading="queryTheirTeamFlag" />
					</div>
				</n-spin>
			</n-tab-pane>
		</n-tabs>
		<div class="absolute right-0 pr-[24px]">
			<n-space>
				<n-button @click="lcuStore.sendTeamScoreToRoom">发送评分</n-button>
			</n-space>
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
