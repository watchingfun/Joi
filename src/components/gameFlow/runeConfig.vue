<script setup lang="ts">
import RuneCard from "@/components/RuneCard.vue";
import useSettingStore from "@/store/setting";
import { Ref } from "vue/dist/vue";
import { GameMode, PositionName, Rune } from "@@/types/opgg_rank_type";
import { CustomRune } from "@@/types/type";
import { champDict } from "@@/const/lolDataConfig";
import lcuApi from "@/api/lcuApi";
import { convertOPGGRuneFormat } from "@@/lcu/opgg";

const props = defineProps<{
  champId: number;
  gameMode?: GameMode;
  position?: PositionName;
}>();

const settingStore = useSettingStore();

const { champId, gameMode, position } = toRefs(props);

const opggRunes = ref([]) as Ref<Rune[]>;
const customRunes = ref([]) as Ref<CustomRune[]>;

const message = useMessage();

const loadingRune = ref(false);

const applyRune = (rune: Rune | CustomRune) => {
  let name: string;
  if ("name" in rune) {
    name = rune?.name;
  } else {
    name = "OP.GG " + champDict[champId.value + ""]?.label;
  }
  lcuApi.applyRune(convertOPGGRuneFormat(rune, name)).then(() => {
    message.success("符文已应用");
  });
};

const fetchRune = async (champId: number) => {
  loadingRune.value = true;
  const gameModeVal = unref(gameMode);
  const positionVal = unref(position);
  try {
    customRunes.value = await lcuApi
      .getCustomRunes(champId, gameModeVal, positionVal)
      .then((res) => res?.map((i) => i.value) || []);
    opggRunes.value =
      (await lcuApi.getOPGGRunes(champId, gameModeVal, positionVal)) || [];
    if (settingStore.settingModel.autoConfigRune) {
      if (
        settingStore.settingModel.autoConfigRuneOPGGPriority &&
        opggRunes.value.length
      ) {
        applyRune(opggRunes.value[0]);
      } else if (customRunes.value.length) {
        applyRune(customRunes.value[0]);
      }
    }
  } catch (e) {
    if (e instanceof Error) message.error(e.message);
  } finally {
    loadingRune.value = false;
  }
};

watch(
  champId,
  (n, o) => {
    if (n) {
      fetchRune(n);
    }
  },
  { immediate: true },
);
</script>

<template>
  <n-spin :show="loadingRune" class="flex">
    <n-tabs
      style="height: 100%"
      animated
      default-value="opgg"
      justify-content="space-evenly"
      type="line"
    >
      <n-tab-pane name="opgg" tab="OPGG">
        <n-carousel
          draggable
          :slides-per-view="4"
          :loop="false"
          :dot-type="'line'"
        >
          <n-carousel-item
            style="width: 25%; height: 280px; padding-top: 25px"
            v-for="(rune, i) in opggRunes"
            :key="i"
          >
            <RuneCard
              class="rune-card"
              :rune="rune"
              @apply="applyRune"
            ></RuneCard>
          </n-carousel-item>
        </n-carousel>
      </n-tab-pane>
      <n-tab-pane name="custom" tab="自定义">
        <n-carousel
          draggable
          :slides-per-view="3"
          :loop="false"
          :dot-type="'line'"
        >
          <n-carousel-item
            style="width: 25%; height: 280px; padding-top: 25px"
            v-for="(rune, i) in customRunes"
            :key="i"
          >
            <RuneCard
              class="rune-card"
              :rune="rune"
              @apply="applyRune"
            ></RuneCard>
          </n-carousel-item>
        </n-carousel>
      </n-tab-pane>
    </n-tabs>
  </n-spin>
</template>

<style scoped>
.rune-card {
  width: 130px;
}
</style>
