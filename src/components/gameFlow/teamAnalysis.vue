<script setup lang="ts">
import { TeamMemberInfo } from "@@/types/lcuType";
import { use } from "echarts/core";
import { BarChart } from "echarts/charts";
import { GridComponent, TooltipComponent } from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import VChart from "vue-echarts";
import { assignedPositionNameMap } from "@@/types/opgg_rank_type";

const props = defineProps<{ teams: TeamMemberInfo[] }>();
const { teams } = toRefs(props);

use([TooltipComponent, GridComponent, BarChart, CanvasRenderer]);

const teamMap = computed(() => {
	return teams.value.reduce(
		(p, c) => {
			p[c.summonerName] = c;
			return p;
		},
		{} as Record<string, TeamMemberInfo>
	);
});

const option = computed(() => {
	return {
		tooltip: {
			trigger: "axis",
			axisPointer: {
				type: "shadow"
			}
		},
		grid: {
			left: "3%",
			right: "4%",
			bottom: "3%",
			containLabel: true
		},
		xAxis: [
			{
				type: "category",
				data:
					teams.value.map((t) => {
						if (t.assignedPosition) {
							return t.summonerName + " " + assignedPositionNameMap[t.assignedPosition] || t.assignedPosition;
						} else {
							return t.summonerName;
						}
					}) || [],
				axisTick: {
					alignWithLabel: true
				}
			}
		],
		yAxis: [
			{
				type: "value"
			}
		],
		series: [
			{
				name: "评分",
				type: "bar",
				barWidth: "60%",
				data: teams.value.map((t) => t.score) || []
			}
		]
	};
});

function handleClick(event: any) {
	console.log(event);
}
</script>

<template>
	<v-chart class="w-full h-full" :option="option" @click="handleClick" />
</template>

<style scoped></style>
