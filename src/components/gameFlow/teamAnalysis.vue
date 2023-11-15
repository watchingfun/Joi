<script setup lang="ts">
import { TeamMemberInfo } from "@@/types/lcuType";
import { use } from "echarts/core";
import { EChartsOption } from "echarts";
import { BarChart } from "echarts/charts";
import { GridComponent, TooltipComponent } from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import VChart from "vue-echarts";
import { assignedPositionNameMap } from "@@/types/opgg_rank_type";
import { ComputedRef } from "vue";

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
			},
			backgroundColor: "rgba(0,0,0,0.66)",
			textStyle: {
				color: "#fff"
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
						if (t.assignedPosition && t.assignedPosition !== "none") {
							return t.summonerName + "\n" + (assignedPositionNameMap[t.assignedPosition] || t.assignedPosition);
						} else {
							return t.summonerName;
						}
					}) || [],
				axisLabel: {
					interval: 0,
					textStyle: {
						color: "rgba(255,255,255,0.8)"
					}
				},
				axisTick: {
					alignWithLabel: true
				}
			}
		],
		yAxis: [
			{
				type: "value",
				splitLine: {
					show: true,
					lineStyle: {
						color: "rgba(114,114,114,0.75)"
					}
				}
			}
		],
		series: [
			{
				name: "评分",
				type: "bar",
				barWidth: "40%",
				data: teams.value.map((t) => t.score) || [],
				itemStyle: {
					borderColor: "rgba(255,255,255,0.84)",
					borderWidth: 2,
					borderRadius: 5,
					color: "rgba(116, 142, 222,0.9)"
				},
				label: {
					show: true,
					position: "inside",
					color: "rgba(255,255,255,0.8)"
				}
			}
		]
	};
}) as ComputedRef<EChartsOption>;

function handleClick(event: any) {
	console.log(event);
}
</script>

<template>
	<v-chart class="w-full h-full" :option="option" @click="handleClick" />
</template>

<style scoped></style>
