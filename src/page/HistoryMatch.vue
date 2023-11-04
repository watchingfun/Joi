<script setup lang="ts">
import useLCUStore, { ConnectStatusEnum } from "@/store/lcu";
import GameInfoList from "@/components/GameInfoList.vue";
import GameDetailInfo from "@/components/GameDetailInfo.vue";
import lcuApi from "@/api/lcuApi";
import { computed, onMounted, ref, watch } from "vue";
import { GameDetail, PageRanges, Player } from "@@/lcu/interface";
import { OverlayScrollbarsComponent } from "overlayscrollbars-vue";
import { memoize } from "lodash";
import { LRUCache } from "lru-cache";
import ProfileImg from "@/components/img/profileImg.vue";
import router from "@/router";
import LazyDeferred from "@/components/LazyDeferred";
import { onBeforeRouteUpdate } from "vue-router";
import EpicLoading from "@/components/EpicLoading.vue";

const lcuStore = useLCUStore();
const page = ref(1);
const loading = ref(false);
const message = useMessage();

const matchHistoryList = computed(() => {
  return lcuStore.matchHistoryQueryResult?.[page.value - 1]?.games?.games || [];
});

function refresh() {
  page.value = 1;
  lcuStore.pageRange = 1;
  fetchData({ puuid: lcuStore.querySummonerInfo?.puuid });
}

function changeQueryRange() {
  fetchData({ puuid: lcuStore.querySummonerInfo?.puuid });
}

function fetchData({
  summonerName,
  puuid,
}: {
  summonerName?: string;
  puuid?: string;
} = {}) {
  console.log("fetchData", { summonerName, puuid });
  if (lcuStore.connectStatus !== ConnectStatusEnum.connected) {
    message.error("未连接客户端！");
    return;
  }
  loading.value = true;
  lcuStore.getMatchHistoryQueryResult({ summonerName, puuid }).finally(() => {
    loading.value = false;
  });
}

const clickedGameInfo = ref<GameDetail>();

const gameDetail = ref<GameDetail>();

const fetchDetailLoading = ref(false);

function jumpDetail(gameRecord: GameDetail) {
  drawerShow.value = true;
  clickedGameInfo.value = gameRecord;
}

function jumpSummoner(player: Player) {
  drawerShow.value = false;
  router.push({
    name: "historyMatch",
    params: { puuid: player.puuid },
  });
}

//缓存对局查询
const cacheQueryGameDetails = memoize(lcuApi.queryGameDetails);
cacheQueryGameDetails.cache = new LRUCache({ max: 500 });

onMounted(() => fetchData());

onBeforeRouteUpdate((to, from, next) => {
  const { params } = to;
  fetchData(params);
  next();
});

watch(
  () => clickedGameInfo.value?.gameId,
  (value, oldValue, onCleanup) => {
    fetchDetailLoading.value = true;
    if (value)
      cacheQueryGameDetails(value)
        .then((res) => {
          gameDetail.value = res;
        })
        .finally(() =>
          setTimeout(() => (fetchDetailLoading.value = false), 100),
        );
  },
);

function copy(name: string) {
  navigator.clipboard
    .writeText(name)
    .then(() => message.success(`昵称[${name}]已复制`));
}

const drawerShow = ref(false);
</script>

<template>
  <div class="relative flex flex-col overflow-hidden h-full">
    <div class="page-header items-center justify-center w-full select-none">
      <div
        class="flex flex-row items-center"
        v-if="lcuStore.querySummonerInfo?.displayName"
      >
        <n-tag
          :bordered="false"
          :type="
            lcuStore.querySummonerInfo?.privacy === 'PUBLIC'
              ? 'info'
              : 'warning'
          "
          >{{
            lcuStore.querySummonerInfo?.privacy === "PUBLIC"
              ? "生涯公开"
              : "生涯隐藏"
          }}
        </n-tag>
        <profile-img
          round
          class="m-2"
          :profile-icon-id="lcuStore.querySummonerInfo.profileIconId"
        ></profile-img>
        <div
          class="truncate cursor-pointer"
          :title="lcuStore.querySummonerInfo.displayName"
          @click="() => copy(lcuStore.querySummonerInfo?.displayName as string)"
        >
          <n-button text>
            {{ lcuStore.querySummonerInfo?.displayName }}
          </n-button>
        </div>
      </div>

      <n-tooltip trigger="click">
        <template #trigger>
          <n-select
            style="width: 80px"
            size="small"
            v-model:value="lcuStore.pageRange"
            @update:value="changeQueryRange"
            placeholder="Select"
            :options="PageRanges.map((i) => ({ label: i * 20, value: i }))"
          >
          </n-select>
        </template>
        一般最近20场够用了，获取超过最近20场别频繁查询，有封号风险
      </n-tooltip>
      <n-pagination
        small
        simple
        :page-count="lcuStore.pageRange"
        :page-size="20"
        v-model:page="page"
      />
      <n-button
        type="primary"
        size="small"
        plain
        @click="refresh"
        style="margin-right: 24px"
        >刷新
      </n-button>
    </div>
    <div style="height: 50px; flex-shrink: 0"></div>
    <epic-loading :loading="loading" style="height: 0; flex: 1">
      <overlay-scrollbars-component
        style="height: 100%"
        class="scroll-wrapper"
        element-loading-background="rgba(122, 122, 122, 0.6)"
        :options="{ scrollbars: { autoHide: 'move' } }"
      >
        <GameInfoList
          :matchHistoryList="matchHistoryList"
          @jumpDetail="jumpDetail"
        ></GameInfoList>
        <div
          class="flex-1 flex flex-col items-center justify-start h-full pt-[60px]"
          v-if="!matchHistoryList.length"
        >
          <p style="font-size: 100px">😴</p>
          <div style="font-size: 40px">暂无结果</div>
        </div>
      </overlay-scrollbars-component>
    </epic-loading>
    <n-drawer
      class="detail-drawer"
      v-model:show="drawerShow"
      placement="right"
      width="90%"
      :with-header="false"
      :class="[clickedGameInfo?.participants[0].stats.win ? 'win' : 'fail']"
    >
      <n-drawer-content>
        <n-spin :show="fetchDetailLoading" style="height: 100%">
          <LazyDeferred>
            <GameDetailInfo
              v-if="!fetchDetailLoading"
              :detail="gameDetail as GameDetail"
              @JumpSummoner="jumpSummoner"
            ></GameDetailInfo>
          </LazyDeferred>
        </n-spin>
      </n-drawer-content>
    </n-drawer>
  </div>
</template>

<style scoped>
.page-header {
  position: absolute;
  display: flex;
  flex-flow: row nowrap;
  gap: 10px;
  height: 50px;
}

.page-header:deep(.n-pagination-quick-jumper) {
  width: 42px;
}

.scroll-wrapper :deep(div[data-overlayscrollbars-contents]) {
  height: 100%;
}
</style>
<style>
.n-spin-container {
  display: flex;
  flex-grow: 1;
  height: 0;
}

.n-spin-content {
  display: flex;
  flex: 1;
}

.detail-drawer {
  background-color: #ffffff52 !important;
  backdrop-filter: blur(10px);
}

.detail-drawer.win {
  background-image: linear-gradient(
    43deg,
    #02424d 0%,
    #006b52a6 46%,
    #ffffff00 100%
  );
  box-shadow: rgb(0 163 134 / 20%) -20px 0px 20px;
}

.detail-drawer.fail {
  background-image: linear-gradient(
    43deg,
    #952b21 0%,
    #dd2e2ea6 46%,
    #ffffff00 100%
  );
  box-shadow: #b5373787 -20px 0px 20px;
}
</style>
