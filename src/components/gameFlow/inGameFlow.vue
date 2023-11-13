<script setup lang="ts">
import useLCUStore from "@/store/lcu";
import { champDict } from "@@/const/lolDataConfig";
import ChampionImg from "@/components/img/championImg.vue";
import { TransitionSlide } from "@morev/vue-transitions";
import RuneConfig from "@/components/gameFlow/runeConfig.vue";
import { storeToRefs } from "pinia";
import GameAnalysis from "@/components/gameFlow/gameAnalysis.vue";

const lcuStore = useLCUStore();
const { champId } = storeToRefs(lcuStore);

const tabVal = ref<"rune" | "analysis">("rune");
</script>

<template>
	<div class="flex h-full w-[95%]">
		<div class="flex flex-col transition-all flex-1">
			<div class="flex flex-row items-center gap-[40px] py-[15px] justify-between">
				<div class="flex flex-row shrink-0 items-center gap-2">
					当前选择英雄：
					<champion-img style="width: 50px" :champion-id="champId" />
					<div>
						{{ champId ? champDict[champId]?.label + " " + champDict[champId]?.title : "未选择" }}
					</div>
				</div>

				<n-tabs type="segment" v-model:value="tabVal" style="width: 50%" animated>
					<n-tab name="rune"> 符文</n-tab>
					<n-tab name="analysis"> 对局分析</n-tab>
				</n-tabs>
			</div>
			<n-card style="margin-bottom: 16px" class="flex flex-1">
				<div class="flex flex-1">
					<transition-slide class="flex flex-col flex-1" :offset="[-16, 0]" mode="out-in">
						<keep-alive>
							<rune-config
								v-if="tabVal === 'rune'"
								:champId="champId"
								:game-mode="lcuStore.currentGameMode"
								:position="lcuStore.currentPosition"></rune-config>
							<game-analysis v-else-if="tabVal === 'analysis'"></game-analysis>
						</keep-alive>
					</transition-slide>
				</div>
			</n-card>
		</div>
	</div>
</template>

<style scoped>
:deep(.n-card__content) {
	display: flex;
	flex-flow: column;
	justify-content: flex-start;
}

:deep(.n-card--bordered) {
	background: transparent;
}

:deep(.n-tabs-pane-wrapper) {
	height: 100% !important;
}

:deep(.n-tab-pane) {
	height: 100% !important;
}

:deep(.n-carousel.n-carousel--bottom .n-carousel__dots) {
	bottom: 0px !important;
}

:deep(.n-radio__label) {
	margin-top: -1px;
}
</style>
