<script setup lang="ts">
import { BreedingRhombusSpinner } from "epic-spinners";
import EpicLoading from "@/components/EpicLoading.vue";

const props = defineProps(["gameFlowPhase"]);
</script>

<template>
  <epic-loading loading class="w-full h-full">
    <template #loading>
      <div>
        <BreedingRhombusSpinner
          style="width: 200px; height: 100px"
        ></BreedingRhombusSpinner>
      </div>
      <div style="font-size: 40px">正在寻找对局</div>
    </template>
  </epic-loading>
</template>

<style scoped>
:deep(.rhombus.big) {
  background-color: rgb(255 135 49) !important;
  box-shadow: rgb(255 102 41 / 88%) 0px 0px 55px 0px;
}

:deep(.rhombus) {
  background-color: rgb(146 204 255) !important;
  box-shadow: rgb(41 85 255 / 88%) 0px 0px 55px 0px;
}
</style>
