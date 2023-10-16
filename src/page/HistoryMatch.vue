<script setup lang="ts">
import useLCUStore from "@/store/lcu";
import GameInfoList from "@/components/GameInfoList.vue";
import lcuApi from "@/api/lcuApi";
import { computed, onMounted, ref } from "vue";
import { PageRange, PageRanges } from "@@/lcu/interface";
import { OverlayScrollbarsComponent } from "overlayscrollbars-vue";
import { Warning } from "@element-plus/icons-vue";

const lcuStore = useLCUStore();
const page = ref(1);
const loading = ref(false);

const matchHistoryList = computed(() => {
  loading.value = true;
  const result =
    lcuStore.matchHistoryQueryResult?.[page.value - 1]?.games?.games || [];
  loading.value = false;
  return result;
});

// let gameId = lcuStore.matchHistoryQueryResult?.[0].games.games[0].gameId;
// let res = await lcuApi.queryGameDetails(gameId);
// console.log(res);

function refresh() {
  page.value = 1;
  lcuStore.pageRange = 1;
  fetchData();
}

function fetchData() {
  loading.value = true;
  lcuStore.getMatchHistoryQueryResult().finally(() => {
    setTimeout(() => (loading.value = false), 500);
  });
}

onMounted(() => fetchData());

function jumpDetail(gameId: number) {
  console.log("jumpDetail", gameId);
}
</script>

<template>
  <div class="relative flex flex-col overflow-hidden h-full">
    <div class="page-header items-center justify-center w-full">
      <el-tooltip
        content="一般最近20场够用了，获取超过最近20场别频繁查询，有封号风险"
        placement="bottom"
      >
        <el-icon>
          <Warning />
        </el-icon>
      </el-tooltip>
      <div style="font-size: 14px">获取最近场次数:</div>
      <el-select
        style="width: 100px"
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
      <el-button type="primary" size="small" plain @click="refresh"
        >刷新
      </el-button>
    </div>
    <div style="height: 56px; flex-shrink: 0"></div>

    <overlay-scrollbars-component
      class="flex flex-1"
      v-loading="loading"
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
  </div>
</template>

<style scoped>
.page-header {
  position: absolute;
  display: flex;
  flex-flow: row nowrap;
}
</style>
