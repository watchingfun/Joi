<script setup lang="ts">
import { RunesDBObj } from "@@/config/type";
import { runesFlatMap } from "@/common/runes";
import { runesStatModMap } from "@/assets/runesStatMods";

const props = defineProps<{ rune: RunesDBObj }>();

const { rune } = toRefs(props);
</script>

<template>
  <div class="relative overflow-hidden card">
    <div class="flex flex-row gap-[10px] inner">
      <div
        class="flex-col flex items-center justify-between gap-[8px] primary-runes"
      >
        <n-image
          lazy
          width="50"
          preview-disabled
          :src="
            runesFlatMap.get(rune.value.primary_rune_ids[0])?.icon.toLowerCase()
          "
        />
        <n-image
          lazy
          width="30"
          preview-disabled
          :src="
            runesFlatMap.get(rune.value.primary_rune_ids[1])?.icon.toLowerCase()
          "
        />
        <n-image
          lazy
          width="30"
          preview-disabled
          :src="
            runesFlatMap.get(rune.value.primary_rune_ids[2])?.icon.toLowerCase()
          "
        />
        <n-image
          lazy
          width="30"
          preview-disabled
          :src="
            runesFlatMap.get(rune.value.primary_rune_ids[3])?.icon.toLowerCase()
          "
        />
      </div>
      <div class="flex-col flex items-center justify-center gap-[5px]">
        <n-image
          lazy
          width="30"
          preview-disabled
          :src="
            runesFlatMap
              .get(rune.value.secondary_rune_ids[0])
              ?.icon.toLowerCase()
          "
        />
        <n-image
          lazy
          width="30"
          preview-disabled
          :src="
            runesFlatMap
              .get(rune.value.secondary_rune_ids[1])
              ?.icon.toLowerCase()
          "
        />
        <div class="flex-col flex items-center gap-[2px]">
          <n-image
            lazy
            width="25"
            preview-disabled
            :src="
              runesStatModMap
                .get(rune.value.stat_mod_ids[0])
                ?.icon.toLowerCase()
            "
          />
          <n-image
            lazy
            width="25"
            preview-disabled
            :src="
              runesStatModMap
                .get(rune.value.stat_mod_ids[1])
                ?.icon.toLowerCase()
            "
          />
          <n-image
            lazy
            width="25"
            preview-disabled
            :src="
              runesStatModMap
                .get(rune.value.stat_mod_ids[2])
                ?.icon.toLowerCase()
            "
          />
        </div>
      </div>
    </div>
    <div class="absolute bottom-[10px] w-full operation">
      <div class="flex flex-row gap-[5px] justify-center">
        <n-button type="primary" size="small">修改</n-button>
        <n-button type="error" size="small">删除</n-button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card {
  border: 1px rgba(255, 255, 255, 0.6) solid;
  border-radius: 10px;
  padding: 15px;
  transition: all 0.4s ease-in-out;
}

.primary-runes {
  border-right: 1px rgba(255, 255, 255, 0.6) solid;
}

.operation {
  transition: transform 0.4s ease-in-out;
  transform: translate(-15px, 60px);
  backdrop-filter: blur(4px);
  padding: 10px;
}

.card:hover .operation {
  transform: translate(-15px, 10px);
}

.card:hover {
  box-shadow:
    rgba(50, 50, 93, 0.25) 0px 13px 27px -5px,
    rgba(0, 0, 0, 0.3) 0px 8px 16px -8px;
  transform: translateY(-5px);
}
</style>
