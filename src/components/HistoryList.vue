<script setup lang="ts">
import EpicLoading from "@/components/EpicLoading.vue";
import GameInfoList from "@/components/GameInfoList.vue";
import { GameDetail, Player } from "@@/types/lcuType";
import GameDetailInfo from "@/components/GameDetailInfo.vue";
import LazyDeferred from "@/components/LazyDeferred.vue";
import { ref } from "vue";
import useGameDetail from "@/hooks/useGameDetail";
import router from "@/router";

const props = defineProps({
	loading: { type: Boolean, default: false },
	matchHistoryList: { type: Array<GameDetail>, default: [] }
});

const { loading, matchHistoryList } = toRefs(props);

const drawerShow = ref(false);

const { fetchDetail, fetchDetailLoading, gameDetail } = useGameDetail();
const currentViewDetailPuuid = ref("");

function jumpDetail(gameId: number, player: Player) {
	drawerShow.value = true;
	void fetchDetail(gameId);
	currentViewDetailPuuid.value = player.puuid;
}

function jumpSummoner(player: Player) {
	drawerShow.value = false;
	router.push({
		name: "historyMatch",
		params: { puuid: player.puuid },
		query: { time: new Date().getTime() }
	});
}

const scrollContainer = ref();
</script>

<template>
	<div class="flex flex-1 flex-col h-0">
		<n-spin :show="loading" class="flex flex-1 flex-col h-0" :rotate="false">
			<div class="flex flex-1 flex-col h-0" ref="scrollContainer">
				<n-scrollbar class="flex flex-1 flex-col h-0" v-if="matchHistoryList.length">
					<GameInfoList
						:matchHistoryList="matchHistoryList"
						@jumpDetail="jumpDetail"
						:scrollContainer="scrollContainer"></GameInfoList>
				</n-scrollbar>
				<div class="flex-1 flex flex-col items-center justify-start h-full pt-[60px]" v-else>
					<p style="font-size: 100px">😴</p>
					<div style="font-size: 40px">暂无结果</div>
				</div>
			</div>
			<template #icon>
				<epic-loading loading style="height: 0; flex: 1"></epic-loading>
			</template>
		</n-spin>

		<n-drawer class="detail-drawer" v-model:show="drawerShow" placement="right" width="90%" :with-header="false">
			<n-drawer-content>
				<n-spin :show="fetchDetailLoading" style="height: 100%">
					<LazyDeferred>
						<GameDetailInfo
							v-if="!fetchDetailLoading"
							:detail="gameDetail as GameDetail"
							:puuid="currentViewDetailPuuid"
							@JumpSummoner="jumpSummoner"></GameDetailInfo>
					</LazyDeferred>
				</n-spin>
			</n-drawer-content>
		</n-drawer>
	</div>
</template>

<style scoped>
:deep(.n-spin-content) {
	display: flex;
	flex-flow: column;
	flex: 1;
	height: 0;
}
</style>
