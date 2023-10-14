<script setup lang="ts">
import { GameDetail } from "@@/lcu/interface";
import { toRefs } from "vue";
import dayjs from "dayjs";
import GameInfo from "@/components/GameInfo.vue";

const props = defineProps({ matchHistoryList: Array<GameDetail> });
const { matchHistoryList } = toRefs(props);
//todo 翻页数量选择， 刷新功能
</script>

<template>
  <div>
    <template v-for="(record, index) in matchHistoryList" :key="record.gameId">
      <GameInfo :record="record"></GameInfo>
      <div class="divider" v-if="index + 1 !== matchHistoryList?.length" />
    </template>
  </div>
</template>

<style scoped>
.divider {
  height: 1px;
  width: 100%;
  margin: 0;
  box-shadow: 0 -1px 0 #ffe3d23d;
}
</style>
