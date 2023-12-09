<script setup lang="ts">
import { GameDetail, TeamMemberInfo } from "@@/types/lcuType";
import { use } from "echarts/core";
import { EChartsOption } from "echarts";
import { BarChart } from "echarts/charts";
import { GridComponent, TooltipComponent } from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import VChart from "vue-echarts";
import { assignedPositionNameMap } from "@@/types/opgg_rank_type";
import { Ref } from "vue";
import HistoryList from "@/components/HistoryList.vue";
import { champDict } from "@@/const/lolDataConfig";

const props = defineProps<{ teams: TeamMemberInfo[]; teamUpInfo: Array<Array<string>> }>();
const { teams, teamUpInfo } = toRefs(props);

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

const colorGroup = ["rgba(252,132,80,0.66)", "rgba(123,239,255,0.81)", "rgba(255,255,255,0.8)"];

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

const option = ref({}) as Ref<EChartsOption>;

const updateOption = () => {
	option.value = {
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
					//todo 这里响应式有问题
					color: function (value, index) {
						const cIndex = teamUpInfo.value.findIndex((group) =>
							group.find((puuid) => puuid === teams.value[index!]?.puuid)
						);
						if (cIndex !== -1) {
							return colorGroup[cIndex];
						} else {
							return colorGroup[2];
						}
					},
					formatter: function (value, index) {
						const member = teams.value[index];
						let str;
						if (member.championId) {
							str = `{${member.championId!}|}\n{value|${value}}`;
						} else {
							str = `{value|${value}}`;
						}
						if (member.summonerInfo?.privacy === "PRIVATE") {
							str += `\n{private|生涯隐藏}`;
						}
						return str;
					},
					rich: {
						...championImageUrlMap.value,
						value: {
							lineHeight: 30,
							align: "center"
						},
						private: {
							align: "center",
							color: "rgba(245,112,45,0.73)"
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
	} as EChartsOption;
};

watch(
	[teams, teamUpInfo],
	() => {
		updateOption();
	},
	{ immediate: true, deep: true }
);

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
	<div class="flex flex-1 flex-col w-full h-full">
		<div class="flex flex-row items-center gap-5 justify-center" v-if="teamUpInfo.length > 0">
			<template v-for="(color, i) in colorGroup" :key="i">
				<div v-if="i + 1 <= teamUpInfo.length" class="flex flex-row items-center gap-1">
					<div :style="{ backgroundColor: color, width: '10px', height: '10px' }"></div>
					<span>组队{{ i + 1 }}</span>
				</div>
			</template>
		</div>
		<v-chart class="flex-1" :option="option" @click="handleClick" />
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
	</div>
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
