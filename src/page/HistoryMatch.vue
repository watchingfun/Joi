<script setup lang="ts">
import useLCUStore from "@/store/lcu";
import { computed, onMounted, ref } from "vue";
import { PageRange, PageRanges } from "@@/types/lcuType";
import ProfileImg from "@/components/img/profileImg.vue";
import HistoryList from "@/components/HistoryList.vue";
import { useResizeObserver } from "@vueuse/core";
import { storeToRefs } from "pinia";
import { TransitionSlide } from "@morev/vue-transitions";

const lcuStore = useLCUStore();
const page = ref(1); //当前页数
const pageRange = ref<PageRange>(PageRanges[0]); //查询总页数
const message = useMessage();
const headerHeight = ref("50px");
const headerRef = ref(null);

const fetchData = lcuStore.fetchSummonerMatchHistoryData;
const { summonerQueryLoading: loading, summonerQueryList } = storeToRefs(lcuStore);
//todo 新增召唤师tab时跳转，每个tab维护自己的分页参数
const tabIndex = ref(0);

//当前查询的召唤师
const currentSummoner = computed(() => {
	return summonerQueryList.value[tabIndex.value]?.summonerInfo;
});

const matchHistoryList = computed(() => {
	if (!currentSummoner.value) {
		return [];
	}
	return (
		lcuStore.summonerQueryList.find((s) => s.summonerInfo.puuid === currentSummoner.value!.puuid)
			?.matchHistoryQueryResult[page.value - 1]?.games?.games || []
	);
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
	fetchData().then(
		() => (tabIndex.value = lcuStore.summonerQueryList.length > 0 ? lcuStore.summonerQueryList.length - 1 : 0)
	);
});

function copy(name: string) {
	navigator.clipboard.writeText(name).then(() => message.success(`昵称[${name}]已复制`));
}

function closeTab(index: number) {
	if (index === 0) {
		return;
	}
	tabIndex.value = index - 1;
	summonerQueryList.value.splice(index, 1);
}
</script>

<template>
	<div class="relative flex flex-col overflow-hidden h-full">
		<div class="page-header items-center justify-center w-full select-none pt-1" ref="headerRef">
			<n-tabs
				animated
				v-model:value="tabIndex"
				type="card"
				closable
				tab-style="min-width: 80px;"
				@close="closeTab"
				v-if="summonerQueryList.length > 1">
				<n-tab
					v-for="(record, i) in summonerQueryList"
					:key="record.summonerInfo.puuid"
					:tab="record.summonerInfo.displayName"
					:name="i">
				</n-tab>
			</n-tabs>
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
		<transition-slide class="flex flex-col flex-1" :offset="[-16, 0]" mode="out-in">
			<template v-for="(record, index) in summonerQueryList">
				<HistoryList
					v-if="tabIndex === index"
					:key="record.summonerInfo.puuid"
					:matchHistoryList="record.matchHistoryQueryResult[page - 1]?.games?.games || []"
					:loading="loading"></HistoryList>
			</template>
		</transition-slide>
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
