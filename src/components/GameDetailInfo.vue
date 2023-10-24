<script setup lang="ts">
import PlayerGameInfo from "@/components/PlayerGameInfo.vue";
import { toRefs } from "vue";
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
        <n-divider v-if="i === 4"></n-divider>
      </template>
    </div>
  </div>
</template>

<style scoped>
:deep(.n-divider) {
  margin: 8px;
}
</style>
