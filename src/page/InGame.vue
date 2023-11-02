<script setup lang="ts">
import useLCUStore, { gameFlowPhaseMap } from "@/store/lcu";
import EpicLoading from "@/components/EpicLoading.vue";
import { BreedingRhombusSpinner } from "epic-spinners";
import { champDict } from "@@/const/lolDataConfig";
import ChampionImg from "@/components/img/championImg.vue";
import lcuApi from "@/api/lcuApi";
import { storeToRefs } from "pinia";
import { convertOPGGRuneFormat } from "@@/lcu/opgg";

const lcuStore = useLCUStore();
//todo 当游戏阶段为ChampSelect 并且选择了英雄时，准备获取查询获取符文（列出本地符文 和 open.gg的），然后调用api设置符文（根据设置本地符文 或 open.gg）；
const gameFlowPhaseName = computed(() => {
  return gameFlowPhaseMap[lcuStore.gameFlowPhase];
});
const { champId } = storeToRefs(lcuStore);

const fetchRune = async (champId: number) => {
  lcuApi
    .getCustomRunes(champId)
    .then((res) => console.log("getCustomRunes", res));
  const opggRunes = await lcuApi.getOPGGRunes(champId);
  if (opggRunes?.length) {
    //todo 有点问题，待优化
    await lcuApi.applyRune(convertOPGGRuneFormat(opggRunes[0]));
  }
};

watch(champId, (n, o) => {
  if (n) {
    fetchRune(n);
  }
});
</script>

<template>
  <div class="flex-1">
    <div class="flex flex-row justify-center items-center h-full">
      <div
        style="font-size: 30px"
        v-show="['None'].includes(lcuStore.gameFlowPhase)"
      >
        🍽️等你开把游戏
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
      <div v-show="lcuStore.gameFlowPhase === 'ChampSelect'">
        <div class="flex flex-col justify-around transition-all">
          <div class="flex flex-row items-center gap-5">
            当前选择英雄：
            <champion-img style="width: 50px" :champion-id="champId" />
            {{
              champId
                ? champDict[champId]?.label + " " + champDict[champId]?.title
                : "未选择"
            }}
          </div>
          <div></div>
          <div></div>
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
</style>
