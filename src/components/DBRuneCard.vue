<script setup lang="ts">
import { RunesDBObj } from "@@/config/type";
import { runesFlatMap } from "@/common/runes";
import { runesStatModMap } from "@/assets/runesStatMods";
import { toRefs } from "vue";
import { TransitionFade } from "@morev/vue-transitions";

const props = defineProps<{ rune: RunesDBObj }>();

const { rune } = toRefs(props);
const runeBgImgStyle = computed(() => {
  return {
    backgroundImage: `url(${runesFlatMap
      .get(rune.value.value.primary_rune_ids[0])
      ?.icon.toLowerCase()})`,
    backgroundSize: "cover",
    backgroundRepeat: "no-repeat",
  };
});
const showOperation = ref(false);
const emit = defineEmits(["edit", "delete"]);
</script>

<template>
  <div>
    <div
      class="relative overflow-hidden card"
      @click="() => (showOperation = !showOperation)"
    >
      <div
        class="absolute w-full h-full -z-10 bg-img"
        :style="runeBgImgStyle"
      ></div>
      <div class="flex flex-row gap-[10px] inner">
        <div
          class="flex-col flex items-center justify-between gap-[8px] primary-runes"
        >
          <n-image
            lazy
            width="50"
            preview-disabled
            :src="
              runesFlatMap
                .get(rune.value.primary_rune_ids[0])
                ?.icon.toLowerCase()
            "
          />
          <n-image
            lazy
            width="30"
            preview-disabled
            :src="
              runesFlatMap
                .get(rune.value.primary_rune_ids[1])
                ?.icon.toLowerCase()
            "
          />
          <n-image
            lazy
            width="30"
            preview-disabled
            :src="
              runesFlatMap
                .get(rune.value.primary_rune_ids[2])
                ?.icon.toLowerCase()
            "
          />
          <n-image
            lazy
            width="30"
            preview-disabled
            :src="
              runesFlatMap
                .get(rune.value.primary_rune_ids[3])
                ?.icon.toLowerCase()
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
      <transition-fade mode="out-in">
        <div class="absolute w-full operation" v-if="showOperation">
          <div class="flex flex-row gap-[5px] justify-center">
            <n-button
              type="primary"
              size="small"
              @click="() => emit('edit', rune)"
              >修改
            </n-button>
            <n-popconfirm
              :show-icon="false"
              @positive-click="
                () => {
                  emit('delete', rune.id);
                  showOperation = false;
                }
              "
              @negative-click="() => {}"
            >
              <template #trigger>
                <n-button type="error" size="small" @click.stop=""
                  >删除</n-button
                >
              </template>
              确认删除？
            </n-popconfirm>
          </div>
        </div>
      </transition-fade>
    </div>
    <div class="rune-name truncate" :title="rune.value.name">
      {{ rune.value.name }}
    </div>
  </div>
</template>

<style scoped>
.card {
  cursor: pointer;
  border-radius: 6px;
  padding: 15px;
  transition: all 0.3s ease-in-out;
  background-color: rgba(128, 128, 128, 0.21);
  transform: translateY(0px);
  box-shadow:
    rgba(0, 0, 0, 0.16) 0 10px 36px 0,
    rgba(0, 0, 0, 0.06) 0 0 0 1px;
}

.card:hover {
  box-shadow:
    rgba(50, 50, 93, 0.25) 0 13px 27px -5px,
    rgba(0, 0, 0, 0.3) 0 8px 16px -8px;
  transform: translateY(-5px);
  background-color: rgba(128, 128, 128, 0.5);
}

.rune-name {
  text-align: center;
  font-size: 1rem;
  padding: 5px;
  width: 120px;
  text-shadow: 2px 2px 7px rgb(239 143 95 / 41%);
}

.card .bg-img {
  filter: blur(15px) brightness(1.2);
  transition: filter 0.3s ease-in-out;
}

.card:hover .bg-img {
  filter: blur(20px) brightness(0.9);
}

.primary-runes {
  border-right: 1px rgba(255, 255, 255, 0.3) solid;
}

.operation {
  transition: all 0.4s ease-in-out;
  backdrop-filter: blur(4px);
  padding: 10px;
  top: 0;
  width: 100%;
  height: 100%;
  left: 0;
  display: flex;
  flex-flow: column;
  justify-content: center;
}
</style>
