<script setup lang="ts">
import useLCUStore, { ConnectStatusEnum } from "@/store/lcu";
import GameInfoList from "@/components/GameInfoList.vue";
import GameDetailInfo from "@/components/GameDetailInfo.vue";
import lcuApi from "@/api/lcuApi";
import { computed, onMounted, ref, watch } from "vue";
import { GameDetail, PageRanges, Player } from "@@/lcu/interface";
import { OverlayScrollbarsComponent } from "overlayscrollbars-vue";
import { Warning } from "@element-plus/icons-vue";
import { memoize } from "lodash";
import { LRUCache } from "lru-cache";
import ProfileImg from "@/components/img/profileImg.vue";
import router from "@/router";
import { ElMessage } from "element-plus";
import { onBeforeRouteUpdate } from "vue-router";

const lcuStore = useLCUStore();
const page = ref(1);
const loading = ref(false);

const matchHistoryList = computed(() => {
  return lcuStore.matchHistoryQueryResult?.[page.value - 1]?.games?.games || [];
});

function refresh() {
  page.value = 1;
  lcuStore.pageRange = 1;
  fetchData(lcuStore.querySummonerInfo?.displayName);
}

function fetchData(search?: string) {
  console.log("search", search);
  if (lcuStore.connectStatus !== ConnectStatusEnum.connected) {
    return;
  }
  loading.value = true;
  lcuStore.getMatchHistoryQueryResult(search).finally(() => {
    //setTimeout(() => (loading.value = false), 500);
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
    params: { search: player.summonerName },
  });
}

//缓存对局查询
const cacheQueryGameDetails = memoize(lcuApi.queryGameDetails);
cacheQueryGameDetails.cache = new LRUCache({ max: 500 });

onMounted(() => fetchData());

onBeforeRouteUpdate((to, from, next) => {
  const { params } = to;
  fetchData(params.search as string);
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
        .finally(() => (fetchDetailLoading.value = false));
  },
);

function copy(name: string) {
  navigator.clipboard
    .writeText(name)
    .then(() => ElMessage.success(`昵称[${name}]已复制`));
}

const drawerShow = ref(false);
</script>

<template>
  <div class="relative flex flex-col overflow-hidden h-full">
    <div class="page-header items-center justify-center w-full select-none">
      <div class="flex flex-row items-center" v-if="lcuStore.querySummonerInfo">
        <el-tag
          >{{
            lcuStore.querySummonerInfo?.privacy === "PUBLIC"
              ? "生涯公开"
              : "生涯隐藏"
          }}
        </el-tag>
        <profile-img
          class="m-2"
          :profile-icon-id="lcuStore.querySummonerInfo.profileIconId"
        ></profile-img>
        <div
          class="truncate cursor-pointer"
          :title="lcuStore.querySummonerInfo.displayName"
          @click="() => copy(lcuStore.querySummonerInfo?.displayName as string)"
        >
          {{ lcuStore.querySummonerInfo?.displayName }}
        </div>
      </div>
      <el-tooltip
        content="一般最近20场够用了，获取超过最近20场别频繁查询，有封号风险"
        placement="bottom"
      >
        <el-icon style="margin-left: 10px">
          <Warning />
        </el-icon>
      </el-tooltip>
      <div style="font-size: 14px">获取最近场次数:</div>
      <el-select
        style="width: 80px"
        size="small"
        v-model="lcuStore.pageRange"
        @change="fetchData"
        class="m-2"
        placeholder="Select"
      >
        <el-option
          v-for="item in PageRanges"
          :key="item"
          :label="item * 20"
          :value="item"
        />
      </el-select>
      <el-pagination
        small
        background
        layout="prev, pager, next"
        class="m-4"
        :page-count="lcuStore.pageRange"
        :page-size="20"
        v-model:current-page="page"
      />
      <el-button
        type="primary"
        size="small"
        plain
        @click="refresh"
        style="margin-right: 24px"
        >刷新
      </el-button>
    </div>
    <div style="height: 56px; flex-shrink: 0"></div>

    <overlay-scrollbars-component
      class="flex flex-1 scroll-wrapper"
      v-loading="loading"
      element-loading-background="rgba(122, 122, 122, 0.6)"
      :options="{ scrollbars: { autoHide: 'move' } }"
    >
      <GameInfoList
        :matchHistoryList="matchHistoryList"
        @jumpDetail="jumpDetail"
      ></GameInfoList>
      <div
        class="flex-1 flex flex-col items-center justify-center h-full"
        v-if="!matchHistoryList.length"
      >
        <div>暂无结果</div>
      </div>
    </overlay-scrollbars-component>
    <el-drawer
      v-model="drawerShow"
      size="90%"
      :with-header="false"
      :class="[clickedGameInfo?.participants[0].stats.win ? 'win' : 'fail']"
    >
      <GameDetailInfo
        :detail="gameDetail as GameDetail"
        @JumpSummoner="jumpSummoner"
      ></GameDetailInfo>
    </el-drawer>
  </div>
</template>

<style scoped>
.page-header {
  position: absolute;
  display: flex;
  flex-flow: row nowrap;
}

:deep(.el-drawer) {
  background: #ffffff52;
  backdrop-filter: blur(10px);
}

:deep(.win.el-drawer) {
  background-image: linear-gradient(
    43deg,
    #02424d 0%,
    #006b52a6 46%,
    #ffffff00 100%
  );
  box-shadow: rgb(0 163 134 / 20%) -20px 0px 20px;
}

:deep(.fail.el-drawer) {
  background-image: linear-gradient(
    43deg,
    #952b21 0%,
    #dd2e2ea6 46%,
    #ffffff00 100%
  );
  box-shadow: #b5373787 -20px 0px 20px;
}

.scroll-wrapper :deep(div[data-overlayscrollbars-contents]) {
  height: 100%;
}

:deep(.el-loading-mask) {
  background-color: rgb(74 76 105 / 95%) !important;
  backdrop-filter: blur(2px);
}
</style>
