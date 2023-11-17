<script setup lang="ts">
import { OverlayScrollbarsComponent } from "overlayscrollbars-vue";
import EpicLoading from "@/components/EpicLoading.vue";
import GameInfoList from "@/components/GameInfoList.vue";
import { GameDetail, Player } from "@@/types/lcuType";
import GameDetailInfo from "@/components/GameDetailInfo.vue";
import LazyDeferred from "@/components/LazyDeferred.vue";
import { ref } from "vue";
import useGameDetail from "@/hooks/useGameDetail";
import useLCUStore from "@/store/lcu";

const props = defineProps({
	loading: { type: Boolean, default: false },
	matchHistoryList: { type: Array<GameDetail>, default: [] }
});

const { loading, matchHistoryList } = toRefs(props);

const drawerShow = ref(false);

const { fetchDetail, fetchDetailLoading, gameDetail } = useGameDetail();

function jumpDetail(gameId: number) {
	drawerShow.value = true;
	void fetchDetail(gameId);
}

const lcuStore = useLCUStore();

function jumpSummoner(player: Player) {
	drawerShow.value = false;
	lcuStore.fetchSummonerMatchHistoryData({ summonerName: player.summonerName });
}
</script>

<template>
	<div class="flex flex-1 flex-col h-0">
		<epic-loading :loading="loading" style="height: 0; flex: 1">
			<overlay-scrollbars-component
				style="height: 100%"
				class="scroll-wrapper"
				element-loading-background="rgba(122, 122, 122, 0.6)"
				:options="{ scrollbars: { autoHide: 'move' } }">
				<GameInfoList :matchHistoryList="matchHistoryList" @jumpDetail="jumpDetail"></GameInfoList>
				<div class="flex-1 flex flex-col items-center justify-start h-full pt-[60px]" v-if="!matchHistoryList.length">
					<p style="font-size: 100px">😴</p>
					<div style="font-size: 40px">暂无结果</div>
				</div>
			</overlay-scrollbars-component>
		</epic-loading>
		<n-drawer class="detail-drawer" v-model:show="drawerShow" placement="right" width="90%" :with-header="false">
			<n-drawer-content>
				<n-spin :show="fetchDetailLoading" style="height: 100%">
					<LazyDeferred>
						<GameDetailInfo
							v-if="!fetchDetailLoading"
							:detail="gameDetail as GameDetail"
							@JumpSummoner="jumpSummoner"></GameDetailInfo>
					</LazyDeferred>
				</n-spin>
			</n-drawer-content>
		</n-drawer>
	</div>
</template>

<style scoped></style>
