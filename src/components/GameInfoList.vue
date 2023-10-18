<script setup lang="ts">
import { GameDetail } from "@@/lcu/interface";
import { toRefs } from "vue";
import GameInfo from "@/components/GameInfo.vue";

const props = defineProps({
  matchHistoryList: { type: Array<GameDetail>, default: [] },
});
const { matchHistoryList } = toRefs(props);
const emit = defineEmits<{
  jumpDetail: [id: number];
}>();
</script>

<template>
  <div>
    <template v-for="(record, index) in matchHistoryList" :key="record.gameId">
      <lazy-component>
        <template #loading>
          <div style="height: 100px"></div>
        </template>
        <GameInfo
          :record="record"
          @click="() => emit('jumpDetail', record.gameId)"
        ></GameInfo>
      </lazy-component>
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
