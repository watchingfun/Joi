<script setup lang="ts">
import useLCUStore, { gameFlowPhaseMap } from "@/store/lcu";
import EpicLoading from "@/components/EpicLoading.vue";
import { BreedingRhombusSpinner } from "epic-spinners";
import { champDict } from "@@/const/lolDataConfig";
import ChampionImg from "@/components/img/championImg.vue";
import lcuApi from "@/api/lcuApi";
import { storeToRefs } from "pinia";
import { convertOPGGRuneFormat } from "@@/lcu/opgg";
import RuneCard from "@/components/RuneCard.vue";
import { Rune } from "@@/lcu/opgg_rank_type";
import { Ref } from "vue";
import { CustomRune } from "@@/config/type";

const lcuStore = useLCUStore();
//todo根据设置项来决定是否自动应用 open.gg符文；
const gameFlowPhaseName = computed(() => {
  return gameFlowPhaseMap[lcuStore.gameFlowPhase];
});
const { champId } = storeToRefs(lcuStore);

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
  try {
    customRunes.value = await lcuApi
      .getCustomRunes(champId)
      .then((res) => res?.map((i) => i.value) || []);
    opggRunes.value = (await lcuApi.getOPGGRunes(champId)) || [];
    if (opggRunes.value.length) {
      applyRune(opggRunes.value[0]);
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
  <div class="flex-1 flex flex-col justify-start">
    <div class="flex flex-col justify-center items-center flex-1">
      <div
        class="flex flex-col items-center"
        v-show="['None'].includes(lcuStore.gameFlowPhase)"
      >
        <div style="font-size: 100px">🍽️</div>
        <div style="font-size: 40px">等你开把游戏</div>
      </div>
      <div
        style="font-size: 30px"
        v-show="
          !['None', 'Matchmaking', 'ChampSelect', 'InProgress'].includes(
            lcuStore.gameFlowPhase,
          )
        "
      >
        当前：{{ gameFlowPhaseName }}
      </div>
      <epic-loading
        loading
        v-show="lcuStore.gameFlowPhase === 'Matchmaking'"
        class="w-full h-full"
      >
        <template #loading>
          <div>
            <BreedingRhombusSpinner
              style="width: 200px; height: 100px"
            ></BreedingRhombusSpinner>
          </div>
          <div style="font-size: 40px">正在寻找对局</div>
        </template>
      </epic-loading>
      <div
        v-show="lcuStore.gameFlowPhase === 'ChampSelect'"
        class="flex h-full w-[95%]"
      >
        <div class="flex flex-col transition-all flex-1">
          <div class="flex flex-row items-center gap-5 py-[15px]">
            当前选择英雄：
            <champion-img style="width: 50px" :champion-id="champId" />
            {{
              champId
                ? champDict[champId]?.label + " " + champDict[champId]?.title
                : "未选择"
            }}
          </div>
          <n-spin :show="loadingRune" class="flex">
            <n-card
              style="margin-bottom: 16px; width: 0"
              class="flex-1"
              v-show="champId"
            >
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
            </n-card>
          </n-spin>
        </div>
      </div>
    </div>
  </div>
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

.rune-card {
  width: 130px;
}

:deep(.n-card__content) {
  display: flex;
  flex-flow: column;
  justify-content: flex-start;
}

:deep(.n-card--bordered) {
  background: transparent;
}

:deep(.n-tabs-pane-wrapper) {
  height: 100% !important;
}

:deep(.n-tab-pane) {
  height: 100% !important;
}

:deep(.n-carousel.n-carousel--bottom .n-carousel__dots) {
  bottom: 0px !important;
}
</style>
