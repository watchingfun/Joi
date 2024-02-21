<script setup lang="ts">
import useLCUStore from "@/store/lcu";
import { computed, onMounted, ref } from "vue";
import { MatchHistoryQueryResult, SummonerInfo } from "@@/types/lcuType";
import ProfileImg from "@/components/img/profileImg.vue";
import HistoryList from "@/components/HistoryList.vue";
import { useResizeObserver } from "@vueuse/core";
import { TransitionExpand } from "@morev/vue-transitions";
import { ReactiveVariable } from "vue/macros";
import router from "@/router";
import lcuApi from "@/api/lcuApi";
import { AngleLeft, AngleRight } from "@vicons/fa";
import EpicLoading from "@/components/EpicLoading.vue";
import { PlayerNote } from "@@/types/type";
import playerNotesApi from "@/api/playerNotesApi";

interface SummonerGameHistoryResult {
	summonerInfo: SummonerInfo;
	matchHistoryQueryResult: Array<MatchHistoryQueryResult>;
	playerNote: PlayerNote | undefined;
}

const lcuStore = useLCUStore();

const leaveClass = [
	"absolute animate__animated animate__fadeOutLeft animate__faster",
	"absolute animate__animated animate__fadeOutRight animate__faster"
];
const enterClass = [
	"absolute animate__animated animate__fadeInRight animate__faster",
	"absolute animate__animated animate__fadeInLeft animate__faster"
];

const pageLeaveClass = ref("");
const pageEnterClass = ref("");

const pageSizeOptions = [8, 20, 30] as const;
type PageSizeOptions = (typeof pageSizeOptions)[number];
const pageObj = reactive([
	{
		page: 1,
		pageSize: 8
	}
]) as ReactiveVariable<Array<{ page: number; pageSize: PageSizeOptions }>>;
//当前页数
const page = computed({
	set: (val: number) => {
		pageObj[tabIndex.value].page = val;
	},
	get: () => {
		return pageObj[tabIndex.value].page;
	}
});
//每页数量
const pageSize = computed({
	set: (val: PageSizeOptions) => {
		pageObj[tabIndex.value].pageSize = val;
	},
	get: () => {
		return pageObj[tabIndex.value].pageSize;
	}
});

const message = useMessage();
const headerHeight = ref("50px");
const headerRef = ref(null);

const playerDropDownOptions = computed(() => {
	return [
		{
			label: "复制昵称",
			key: "copyName"
		},
		{
			label: "复制puuid",
			key: "copyPuuid"
		},
		summonerQueryList.value[tabIndex.value]?.playerNote
			? { label: "修改玩家笔记", key: "addPlayNote" }
			: {
					label: "添加到玩家笔记",
					key: "addPlayNote"
			  }
	];
});

const tabIndex = ref(0);
const summonerQueryList = ref<Array<SummonerGameHistoryResult>>([]);
const summonerQueryLoading = ref(false);

const showDropdown = ref(false);
const dropdownX = ref(0);
const dropdownY = ref(0);
const dropdownOptions = [
	{
		label: "关闭当前",
		key: "closeCurrent"
	},
	{
		label: "关闭所有",
		key: "closeAll"
	}
];
const currentContextMenuIndex = ref(0);
const handleContextMenu = (e: MouseEvent, index: number) => {
	e.preventDefault();
	if (index === 0) {
		return;
	}
	currentContextMenuIndex.value = index;
	showDropdown.value = false;
	nextTick().then(() => {
		showDropdown.value = true;
		dropdownX.value = e.clientX;
		dropdownY.value = e.clientY;
	});
};
const handleDropdownSelect = (key: string | number) => {
	showDropdown.value = false;
	if (key === "closeAll") {
		summonerQueryList.value = [summonerQueryList.value[0]];
	} else if (key === "closeCurrent") {
		summonerQueryList.value = summonerQueryList.value.toSpliced(currentContextMenuIndex.value, 1);
	}
	tabIndex.value = summonerQueryList.value.length - 1;
};
const onClickDropdownOutside = () => {
	showDropdown.value = false;
};

const fetchData = async ({
	summonerName,
	puuid,
	refresh = false
}: { summonerName?: string; puuid?: string; refresh?: boolean } = {}) => {
	console.log("fetchData", { summonerName, puuid });
	summonerQueryLoading.value = true;
	try {
		//判断是否已存在tab
		const existIndex = summonerQueryList.value.findIndex(
			(s) => s.summonerInfo.displayName === summonerName || s.summonerInfo.puuid === puuid
		);
		//不存在就查询
		if (existIndex === -1) {
			let summoner: SummonerInfo;
			if (!puuid && !summonerName) {
				summoner = await lcuStore.getCurrentSummoner();
			} else if (summonerName) {
				summoner = await lcuApi.getSummonerByName(summonerName!);
			} else {
				summoner = await lcuApi.getSummonerByPuuid(puuid!);
			}
			summonerQueryList.value.push({
				summonerInfo: summoner,
				matchHistoryQueryResult: [],
				playerNote: await playerNotesApi.queryPlayerNote(summoner.puuid)
			});
			tabIndex.value = summonerQueryList.value.length - 1;
			pageObj.push({ page: 1, pageSize: pageSizeOptions[0] });
			puuid = summoner.puuid;
		} else {
			tabIndex.value = existIndex;
			puuid = currentTabSummoner.value?.puuid;
		}
		const result = await lcuApi.queryMatchHistory(puuid, page.value, pageSize.value);
		if (refresh) {
			summonerQueryList.value[tabIndex.value].matchHistoryQueryResult = [result];
		} else {
			summonerQueryList.value[tabIndex.value].matchHistoryQueryResult.push(result);
		}
	} finally {
		summonerQueryLoading.value = false;
	}
};

//当前查询的召唤师
const currentTabSummoner = computed(() => {
	return summonerQueryList.value[tabIndex.value]?.summonerInfo;
});
const currentTabMatchQueryResult = computed(() => {
	return summonerQueryList.value[tabIndex.value]?.matchHistoryQueryResult || [];
});

function refresh() {
	page.value = 1;
	fetchData({ puuid: currentTabSummoner.value?.puuid, refresh: true });
}

function changeQueryRange() {
	page.value = 1;
	fetchData({ puuid: currentTabSummoner.value?.puuid, refresh: true });
}

onMounted(() => {
	useResizeObserver(headerRef.value, (entries) => {
		const entry = entries[0];
		const blockSize = entry.borderBoxSize?.[0]?.blockSize || 50;
		headerHeight.value = `${blockSize}px`;
	});
	fetchData();
});

function copy(val: string, name: string) {
	navigator.clipboard.writeText(val).then(() => message.success(`${name}[${val}]已复制`));
}

function closeTab(index: number) {
	if (index === 0) {
		return;
	}
	tabIndex.value = index - 1;
	pageObj.splice(index, 1);
	summonerQueryList.value.splice(index, 1);
}

function nextPage() {
	pageEnterClass.value = enterClass[0];
	pageLeaveClass.value = leaveClass[0];
	page.value = page.value + 1;
	if (page.value > currentTabMatchQueryResult.value.length) {
		fetchData({ puuid: currentTabSummoner.value?.puuid });
	}
}

function prePage() {
	pageEnterClass.value = enterClass[1];
	pageLeaveClass.value = leaveClass[1];
	page.value = page.value - 1;
}

watch(
	() => router.currentRoute.value,
	(n, o) => {
		if (n.name === "historyMatch" && (n.params.puuid || n.params.summonerName)) {
			fetchData(n.params);
		}
	}
);

const handleNameOptionsSelect = (key: string) => {
	switch (key) {
		case "copyName":
			copy(currentTabSummoner.value?.displayName, "昵称");
			break;
		case "copyPuuid":
			copy(currentTabSummoner.value?.puuid, "puuid");
			break;
		case "addPlayNote":
			router.push({ name: "playerNotes", params: { puuid: currentTabSummoner.value?.puuid } });
			break;
	}
};
</script>

<template>
	<div class="relative flex flex-col overflow-hidden h-full">
		<div class="page-header items-center justify-center w-full select-none pt-1" ref="headerRef">
			<transition-expand>
				<n-tabs
					animated
					v-model:value="tabIndex"
					type="card"
					closable
					tab-style="min-width: 80px;"
					@close="closeTab"
					v-if="summonerQueryList.length > 1">
					<n-tab
						@contextmenu="(e: MouseEvent) => handleContextMenu(e, i)"
						:closable="i !== 0"
						v-for="(record, i) in summonerQueryList"
						:key="record.summonerInfo.puuid"
						:tab="record.summonerInfo.displayName"
						:name="i">
					</n-tab>
				</n-tabs>
			</transition-expand>
			<n-dropdown
				placement="bottom-start"
				trigger="manual"
				:x="dropdownX"
				:y="dropdownY"
				:options="dropdownOptions"
				:show="showDropdown"
				:on-clickoutside="onClickDropdownOutside"
				@select="handleDropdownSelect" />
			<div class="flex flex-row flex-nowrap items-center gap-[10px] min-h-[50px]">
				<div class="flex flex-row items-center" v-if="currentTabSummoner?.displayName">
					<div v-if="summonerQueryList[tabIndex]?.playerNote?.tags">
						<n-ellipsis style="max-width: 200px">
							<n-tag
								:bordered="false"
								type="warning"
								v-for="tag in summonerQueryList[tabIndex]?.playerNote?.tags"
								class="mr-1"
								>{{ tag }}</n-tag
							>
						</n-ellipsis>
					</div>

					<n-tag :bordered="false" :type="currentTabSummoner?.privacy === 'PUBLIC' ? 'info' : 'warning'"
						>{{ currentTabSummoner?.privacy === "PUBLIC" ? "生涯公开" : "生涯隐藏" }}
					</n-tag>
					<profile-img round class="m-2 shrink-0" :profile-icon-id="currentTabSummoner.profileIconId"></profile-img>
					<n-dropdown trigger="click" :options="playerDropDownOptions" @select="handleNameOptionsSelect">
						<n-button text class="truncate cursor-pointer" :title="currentTabSummoner.displayName">
							{{ currentTabSummoner?.displayName }}
						</n-button>
					</n-dropdown>
				</div>
				<div class="flex flex-row items-center gap-[5px]">
					<n-button strong secondary size="small" :disabled="page === 1 || summonerQueryLoading" @click="prePage">
						<n-icon size="20">
							<angle-left />
						</n-icon>
					</n-button>
					<n-select
						style="width: 80px"
						size="small"
						v-model:value="page"
						:options="
							currentTabMatchQueryResult.map((obj, index) => ({
								label: index + 1,
								value: index + 1
							}))
						">
					</n-select>
					<n-button
						strong
						secondary
						size="small"
						@click="nextPage"
						:disabled="
							summonerQueryLoading ||
							(currentTabMatchQueryResult.length > 0 &&
								currentTabMatchQueryResult[page - 1]?.games.gameCount !== pageSize)
						">
						<n-icon size="20">
							<angle-right />
						</n-icon>
					</n-button>
					<n-select
						style="width: 95px"
						size="small"
						v-model:value="pageSize"
						@update:value="changeQueryRange"
						:options="pageSizeOptions.map((i) => ({ label: i + '条/页', value: i }))">
					</n-select>
					<n-button
						type="primary"
						strong
						secondary
						size="small"
						plain
						@click="refresh"
						style="margin-right: 24px"
						:loading="summonerQueryLoading"
						>刷新
					</n-button>
				</div>
			</div>
		</div>
		<div :style="{ flexShrink: 0, height: headerHeight }"></div>
		<div class="flex flex-col flex-1 h-0 relative">
			<transition-group
				enter-active-class="absolute animate__animated animate__fadeInRight animate__faster"
				leave-active-class="absolute animate__animated animate__zoomOut animate__faster">
				<template v-for="(record, index) in summonerQueryList" :key="record.summonerInfo.puuid">
					<div v-show="tabIndex === index" class="absolute w-full h-full">
						<n-spin :show="summonerQueryLoading" class="absolute w-full h-full" :rotate="false">
							<div class="flex flex-1 flex-col h-0">
								<transition-group :enter-active-class="pageEnterClass" :leave-active-class="pageLeaveClass">
									<template
										v-for="(queryResult, i) in record.matchHistoryQueryResult"
										:key="queryResult.games.gameIndexBegin + queryResult.games.gameCount">
										<HistoryList
											class="absolute w-full h-full"
											v-show="page - 1 === i"
											:matchHistoryList="queryResult?.games?.games || []"
											:loading="summonerQueryLoading"></HistoryList>
									</template>
								</transition-group>
							</div>
							<template #icon>
								<epic-loading loading style="height: 0; flex: 1"></epic-loading>
							</template>
						</n-spin>
					</div>
				</template>
			</transition-group>
		</div>
	</div>
</template>

<style scoped>
.page-header {
	position: absolute;
	display: flex;
	flex-flow: column nowrap;
}

.page-header:deep(.n-pagination-quick-jumper) {
	width: 42px;
}

:deep(.n-spin-content) {
	display: flex;
	flex-flow: column;
	height: 100%;
}
</style>
<style>
.detail-drawer {
	background-color: #181818e6 !important;
	backdrop-filter: blur(10px);
}
</style>
