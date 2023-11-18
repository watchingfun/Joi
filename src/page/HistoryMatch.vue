<script setup lang="ts">
import useLCUStore, { SummonerGameHistoryResult } from "@/store/lcu";
import { computed, onMounted, ref } from "vue";
import { PageRange, PageRanges } from "@@/types/lcuType";
import ProfileImg from "@/components/img/profileImg.vue";
import HistoryList from "@/components/HistoryList.vue";
import { useResizeObserver } from "@vueuse/core";
import { TransitionExpand } from "@morev/vue-transitions";
import { ReactiveVariable } from "vue/macros";
import router from "@/router";

const lcuStore = useLCUStore();

const pageObj = reactive([
	{
		page: 1,
		pageRange: 1
	}
]) as ReactiveVariable<Array<{ page: number; pageRange: PageRange }>>;
//当前页数
const page = computed({
	set: (val: number) => {
		pageObj[tabIndex.value].page = val;
	},
	get: () => {
		return pageObj[tabIndex.value].page;
	}
});
//查询总页数
const pageRange = computed({
	set: (val: PageRange) => {
		pageObj[tabIndex.value].pageRange = val;
	},
	get: () => {
		return pageObj[tabIndex.value].pageRange;
	}
});

const message = useMessage();
const headerHeight = ref("50px");
const headerRef = ref(null);

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

const fetchData = async (
	{
		summonerName,
		puuid,
		pageRange = 1
	}: {
		summonerName?: string;
		puuid?: string;
		pageRange?: PageRange;
	} = { pageRange: 1 }
) => {
	console.log("fetchData", { summonerName, puuid });
	summonerQueryLoading.value = true;
	const result = await lcuStore.getMatchHistoryQueryResult({ summonerName, puuid, pageRange }).finally(() => {
		summonerQueryLoading.value = false;
	});
	const existIndex = summonerQueryList.value.findIndex(
		(s) => s.summonerInfo.displayName === summonerName || s.summonerInfo.puuid === puuid
	);
	if (existIndex !== -1) {
		summonerQueryList.value = summonerQueryList.value.toSpliced(existIndex, 1, result);
		tabIndex.value = existIndex;
		return;
	} else if (!puuid && !summonerName) {
		summonerQueryList.value = summonerQueryList.value.toSpliced(0, 1, result);
		tabIndex.value = 0;
	} else {
		summonerQueryList.value.push(result);
		pageObj.push({ page: 1, pageRange: 1 });
		tabIndex.value = summonerQueryList.value.length - 1;
	}
};

//当前查询的召唤师
const currentSummoner = computed(() => {
	return summonerQueryList.value[tabIndex.value]?.summonerInfo;
});

function refresh() {
	page.value = 1;
	pageRange.value = 1;
	fetchData({ puuid: currentSummoner.value?.puuid, pageRange: pageRange.value });
}

function changeQueryRange() {
	if (page.value > pageRange.value) {
		page.value = 1;
	}
	fetchData({ puuid: currentSummoner.value?.puuid, pageRange: pageRange.value });
}

onMounted(() => {
	useResizeObserver(headerRef.value, (entries) => {
		const entry = entries[0];
		const blockSize = entry.borderBoxSize?.[0]?.blockSize || 50;
		headerHeight.value = `${blockSize}px`;
	});
	fetchData();
});

function copy(name: string) {
	navigator.clipboard.writeText(name).then(() => message.success(`昵称[${name}]已复制`));
}

function closeTab(index: number) {
	if (index === 0) {
		return;
	}
	tabIndex.value = index - 1;
	pageObj.splice(index, 1);
	summonerQueryList.value.splice(index, 1);
}

watch(
	() => router.currentRoute.value,
	(n, o) => {
		if (n.name === "historyMatch" && (n.params.puuid || n.params.summonerName)) {
			fetchData(n.params);
		}
	}
);
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
				<div class="flex flex-row items-center" v-if="currentSummoner?.displayName">
					<n-tag :bordered="false" :type="currentSummoner?.privacy === 'PUBLIC' ? 'info' : 'warning'"
						>{{ currentSummoner?.privacy === "PUBLIC" ? "生涯公开" : "生涯隐藏" }}
					</n-tag>
					<profile-img round class="m-2" :profile-icon-id="currentSummoner.profileIconId"></profile-img>
					<n-button
						text
						class="truncate cursor-pointer"
						:title="currentSummoner.displayName"
						@click="() => copy(currentSummoner?.displayName as string)">
						{{ currentSummoner?.displayName }}
					</n-button>
				</div>
				<n-tooltip trigger="click">
					<template #trigger>
						<n-select
							style="width: 80px"
							size="small"
							v-model:value="pageRange"
							@update:value="changeQueryRange"
							placeholder="Select"
							:options="PageRanges.map((i) => ({ label: i * 20, value: i }))">
						</n-select>
					</template>
					一般最近20场够用了，获取超过最近20场别频繁查询，有封号风险
				</n-tooltip>
				<n-pagination small simple :page-count="pageRange" :page-size="20" v-model:page="page" />
				<n-button type="primary" strong secondary size="small" plain @click="refresh" style="margin-right: 24px"
					>刷新
				</n-button>
			</div>
		</div>
		<div :style="{ flexShrink: 0, height: headerHeight }"></div>
		<div class="flex flex-col flex-1 h-0 relative">
			<transition-group
				enter-active-class="absolute animate__animated animate__zoomInLeft animate__fast"
				leave-active-class="absolute animate__animated animate__fadeOutRight animate__fast">
				<template v-for="(record, index) in summonerQueryList" :key="record.summonerInfo.puuid">
					<HistoryList
						class="absolute w-full h-full"
						v-show="tabIndex === index"
						:matchHistoryList="record.matchHistoryQueryResult[page - 1]?.games?.games || []"
						:loading="summonerQueryLoading"></HistoryList>
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

.scroll-wrapper :deep(div[data-overlayscrollbars-contents]) {
	height: 100%;
}
</style>
<style>
.detail-drawer {
	background-color: #181818e6 !important;
	backdrop-filter: blur(10px);
}
</style>
