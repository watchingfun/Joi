<script setup lang="ts">
import { RuneData, runesFlatMap } from "@/common/runes";
import { computed, toRefs } from "vue";
import { Stats } from "@@/types/lcuType";

const props = defineProps<{ stats: Stats }>();

const { stats } = toRefs(props);

const runeConfig = computed(() => {
  let stateValue = stats.value;
  return {
    primary1: runesFlatMap.get(stateValue.perk0) as RuneData,
    primary2: runesFlatMap.get(stateValue.perk1) as RuneData,
    primary3: runesFlatMap.get(stateValue.perk2) as RuneData,
    primary4: runesFlatMap.get(stateValue.perk3) as RuneData,
    secondary1: runesFlatMap.get(stateValue.perk4) as RuneData,
    secondary2: runesFlatMap.get(stateValue.perk5) as RuneData,
  };
});
</script>

<template>
  <div>
    <div class="relative overflow-hidden card">
      <div class="grid grid-rows-2 h-[140px] inner">
        <div
          class="grid grid-cols-4 grid-rows-[2fr,1fr] grid-flow-col gap-x-[10px] justify-items-center items-center primary-runes"
        >
          <n-image
            lazy
            width="50"
            preview-disabled
            :src="runeConfig.primary1?.icon.toLowerCase()"
          />
          <div>
            {{ runeConfig.primary1.name }}
          </div>
          <n-image
            lazy
            width="30"
            preview-disabled
            :src="runeConfig.primary2?.icon.toLowerCase()"
          />
          <div>
            {{ runeConfig.primary2.name }}
          </div>
          <n-image
            lazy
            width="30"
            preview-disabled
            :src="runeConfig.primary3?.icon.toLowerCase()"
          />
          <div>{{ runeConfig.primary3.name }}</div>
          <n-image
            lazy
            width="30"
            preview-disabled
            :src="runeConfig.primary4?.icon.toLowerCase()"
          />
          <div>
            {{ runeConfig.primary4.name }}
          </div>
        </div>
        <div class="flex-row flex items-center justify-center gap-[5px]">
          <div class="flex flex-row justify-center items-center gap-2">
            <n-image
              lazy
              width="30"
              preview-disabled
              :src="runeConfig.secondary1?.icon.toLowerCase()"
            />
            <div>
              {{ runeConfig.secondary1.name }}
            </div>
          </div>

          <div class="flex flex-row justify-center items-center gap gap-2">
            <n-image
              lazy
              width="30"
              preview-disabled
              :src="runeConfig.secondary2?.icon.toLowerCase()"
            />
            <div>
              {{ runeConfig.secondary2.name }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card {
  cursor: pointer;
  padding: 5px;
}
</style>
