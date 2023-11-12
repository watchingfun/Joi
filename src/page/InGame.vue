<script setup lang="ts">
import useLCUStore from "@/store/lcu";
import { TransitionScale } from "@morev/vue-transitions";
import NoneFlow from "@/components/gameFlow/noneFlow.vue";
import MatchmakingFlow from "@/components/gameFlow/matchmakingFlow.vue";
import InGameFlow from "@/components/gameFlow/inGameFlow.vue";

const lcuStore = useLCUStore();
</script>

<template>
  <div class="flex-1 flex flex-col justify-start">
    <div class="flex flex-col justify-center items-center w-full h-full">
      <transition-scale
        mode="out-in"
        class="flex flex-col justify-center items-center w-full h-full"
      >
        <none-flow
          v-if="'None' === lcuStore.gameFlowPhase"
          key="none-flow"
        ></none-flow>
        <matchmaking-flow
          v-if="lcuStore.gameFlowPhase === 'Matchmaking'"
          key="matchmaking-flow"
        ></matchmaking-flow>
        <in-game-flow
          v-if="
            ['ChampSelect', 'GameStart', 'InProgress'].includes(
              lcuStore.gameFlowPhase,
            )
          "
          key="in-game-flow"
        ></in-game-flow>
      </transition-scale>
    </div>
  </div>
</template>

<style scoped></style>
