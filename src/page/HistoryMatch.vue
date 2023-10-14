<script setup lang="ts">
import useLCUStore from "@/store/lcu";
import GameInfoList from "@/components/GameInfoList.vue";
import lcuApi from "@/api/lcuApi";
import { computed, ref } from "vue";
import { PageRange } from "@@/lcu/interface";

const lcuStore = useLCUStore();
const page = ref<PageRange>(1);
lcuStore.pageRange = 8;
lcuStore.getMatchHistoryQueryResult();
const matchHistoryList = computed(
  () => lcuStore.matchHistoryQueryResult?.[page.value - 1]?.games.games || [],
);

// let gameId = lcuStore.matchHistoryQueryResult?.[0].games.games[0].gameId;
// let res = await lcuApi.queryGameDetails(gameId);
// console.log(res);
</script>

<template>
    <GameInfoList :matchHistoryList="matchHistoryList"></GameInfoList>
</template>

<style scoped></style>
