<script setup lang="ts">
import { GameDetail, TeamMemberInfo } from "@@/types/lcuType";
import { use } from "echarts/core";
import { EChartsOption } from "echarts";
import { BarChart } from "echarts/charts";
import { GridComponent, TooltipComponent } from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import VChart from "vue-echarts";
import { assignedPositionNameMap } from "@@/types/opgg_rank_type";
import { ComputedRef } from "vue";
import HistoryList from "@/components/HistoryList.vue";
import { champDict } from "@@/const/lolDataConfig";

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

const championImageUrlMap = computed(() => {
	return teams.value.reduce(
		(p, c) => {
			const championAlias = champDict[c.championId!]?.alias;
			const url = championAlias
				? `https://game.gtimg.cn/images/lol/act/img/champion/${championAlias}.png`
				: "./img/non-champion.png";
			p[c.championId!] = {
				height: 40,
				align: "center",
				backgroundColor: {
					image: url
				}
			};
			return p;
		},
		{} as Record<string, any>
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
			top: "10%",
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
					color: "rgba(255,255,255,0.8)",
					formatter: function (value, index) {
						if (teams.value[index].championId) {
							return `{${teams.value[index].championId!}|}\n{value|${value}}`;
						} else {
							return `{value|${value}}`;
						}
					},
					rich: {
						...championImageUrlMap.value,
						value: {
							lineHeight: 30,
							align: "center"
						}
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

const showDetail = ref(false);
const historyListData = ref<Array<GameDetail>>([]);
const showSummonerName = ref("");

function handleClick(event: any) {
	showDetail.value = true;
	showSummonerName.value = teams.value[event.dataIndex].summonerName;
	historyListData.value = teams.value[event.dataIndex].gameDetail || [];
}
</script>

<template>
	<v-chart class="w-full h-full" :option="option" @click="handleClick" />
	<n-modal
		v-model:show="showDetail"
		preset="card"
		class="team-member-history-modal"
		:title="showSummonerName"
		style="
			margin-top: 10px;
			width: 95%;
			height: 85vh;
			display: flex;
			flex-flow: column;
			background: rgb(22 27 43 / 95%);
			backdrop-filter: blur(4px);
			border: 1px solid rgb(122 122 122 / 58%);
			border-radius: 8px;
			overflow: hidden;
		">
		<div class="flex flex-1 flex-col h-0" style="font-size: 12px">
			<HistoryList :match-history-list="historyListData"></HistoryList>
		</div>
	</n-modal>
</template>

<style scoped></style>
<style>
.team-member-history-modal .n-card__content {
	padding: unset !important;
	display: flex;
	flex-flow: column;
	flex: 1;
	height: 0;
}
</style>
