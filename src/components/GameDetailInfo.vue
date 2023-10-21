<script setup lang="ts">
import PlayerGameInfo from "@/components/PlayerGameInfo.vue";
import { ref, toRefs } from "vue";
import { GameDetail } from "@@/lcu/interface";

const props = defineProps<{ detail: GameDetail }>();
const { detail } = toRefs(props);
defineOptions({
  inheritAttrs: false,
});
</script>

<template>
  <div>
    <div class="grid grid-cols-1 grid-rows-10">
      <template
        v-for="(data, i) in detail?.participants"
        :key="data.participantId"
      >
        <PlayerGameInfo
          v-bind="$attrs"
          :info="data"
          :play-info="detail.participantIdentities[i]"
        ></PlayerGameInfo>
        <el-divider v-if="i === 4"></el-divider>
      </template>
    </div>
  </div>
</template>

<style scoped>
:deep(.el-divider) {
  margin: 4px;
}
</style>
