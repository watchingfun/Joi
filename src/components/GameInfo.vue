<script setup lang="ts">
import { queue } from "@@/const/lolDataConfig";
import { GameDetail } from "@@/lcu/interface";
import { toRefs } from "vue";
import ChampionImg from "@/components/img/championImg.vue";
import dayjs from "dayjs";
import SpellImg from "@/components/img/spellImg.vue";
import RuneImg from "@/components/img/runeImg.vue";
import ItemImg from "@/components/img/itemImg.vue";

const props = defineProps<{ record: GameDetail }>();
const { record } = toRefs(props);

const formatDate = (str: string) => {
  return dayjs(str).format("YYYY-MM-DD");
};
const formatTime = (str: string) => {
  return dayjs(str).format("HH:mm");
};

function hashCode(str: string) {
  let hash = 0,
    i,
    chr;
  if (str.length === 0) return hash;
  for (i = 0; i < str.length; i++) {
    chr = str.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}

const colorMap = new Map([
  ["人机对战", "rgba(255,215,227,0.3)"],
  ["无限火力", "rgba(255,202,116,0.5)"],
  ["斗魂竞技场", "rgba(255, 61, 0, 0.5)"],
  ["终极魔典", "rgba(255, 0, 122, 0.5)"],
  ["极限闪击", "rgb(114,59,155)"],
  ["克隆模式", "rgba(61,131,112,0.5)"],
  ["单双排位", "rgba(59,248,162,0.5)"],
  ["匹配模式", "rgba(94, 119, 122, 0.5)"],
  ["灵活组排", "rgba(0,252,252,0.5)"],
  ["极地乱斗", "rgba(0, 122, 235, 0.5)"],
  ["训练模式", "rgba(197, 217, 235, 0.5)"],
]);

const gameModeBackground = (str: string) => {
  return {
    backgroundColor:
      colorMap.get(str) ||
      `rgb(${hashCode(String(hashCode(str))) % 255} ${
        hashCode(str) % 100
      }  255} / 0.5)`,
  };
};
</script>

<template>
  <div class="relative">
    <div
      :class="['row-item', record.participants[0].stats.win ? 'win' : 'fail']"
    >
      <div class="ml-[10px]">
        <champion-img
          :style="{ width: '40px', height: '40px' }"
          :level="record.participants[0].stats.champLevel"
          :champion-id="record.participants[0].championId"
        ></champion-img>
      </div>
      <div class="info">
        <div
          class="game-mode"
          :style="gameModeBackground(queue[record.queueId])"
        >
          {{ queue[record.queueId] }}
        </div>
        <div class="creation-date min-text">
          开始时间: {{ formatTime(record.gameCreationDate) }}
        </div>
        <div class="duration-time min-text">
          比赛时长: {{ Math.round(record.gameDuration / 60) }} 分钟
        </div>
      </div>
      <div
        :style="{
          color: record.participants[0].stats.win
            ? '#3aff95a1'
            : 'rgb(255 0 35)',
        }"
        :class="[
          'result',
          record.participants[0].stats.win ? 'win-result' : 'fail-result',
        ]"
      >
        {{ record.participants[0].stats.win ? "胜利" : "失败" }}
      </div>
      <div class="item-group">
        <div class="spell">
          <spell-img :spell-id="record.participants[0].spell1Id"></spell-img>
          <spell-img :spell-id="record.participants[0].spell2Id"></spell-img>
        </div>
        <div class="rune">
          <rune-img
            :rune-id="record.participants[0].stats.perkPrimaryStyle"
          ></rune-img>
          <rune-img
            :rune-id="record.participants[0].stats.perkSubStyle"
          ></rune-img>
        </div>
        <div class="item-group">
          <template v-for="index in [0, 1, 2, 3, 4, 5, 6]" :key="index">
            <itemImg
              class="item ml-1"
              :style="{
                borderRadius: index === 6 ? '50%' : '5px',
                width: '40px',
              }"
              :itemId="record.participants[0].stats['item' + index] as number"
            />
          </template>
        </div>
      </div>
      <div class="kda-group">
        <div class="title">KDA</div>
        <div class="title">金钱</div>
        <div class="title">补兵</div>
        <div class="kda">
          {{ record.participants[0].stats.kills }} /
          <span class="text-red-600">{{
            record.participants[0].stats.deaths
          }}</span>
          /
          {{ record.participants[0].stats.assists }}
        </div>
        <div class="gold">
          {{ record.participants[0].stats.goldEarned }}
        </div>
        <div class="minions">
          {{
            record.participants[0].stats.totalMinionsKilled +
            record.participants[0].stats.neutralMinionsKilled
          }}
        </div>
      </div>
    </div>
    <div class="date-info min-text">
      {{ formatDate(record.gameCreationDate) }}
    </div>
  </div>
</template>

<style scoped>
.row-item {
  height: 100px;
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  cursor: pointer;
  background-color: #ffffff0f;
  transition:
    all 0.3s ease-in-out,
    background-position 0.2s ease-in-out,
    background-color 0.2s ease-in-out;
  user-select: none;
}

.row-item:hover {
  background-color: #ffffff52;
}

.date-info {
  position: absolute;
  top: 0;
  right: 0;
  color: #e5e5e5d1;
  margin: 3px 5px 0 0;
}

.min-text {
  font-size: 12px;
}

.row-item:active {
  background-color: rgba(255, 255, 255, 0.53);
  background-position: 0 0 !important;
}

.win {
  background-image: linear-gradient(
    45deg,
    #3aff95a1 0%,
    rgb(255 255 255 / 0%) 35%,
    rgb(255 255 255 / 0%) 100%
  );
  background-position: -300px 0;
  background-repeat: no-repeat;
  box-shadow: inset #3aff95a1 8px 0 2px -2px;
}

.fail {
  background-image: linear-gradient(
    45deg,
    rgb(255 75 75 / 90%) 0%,
    rgb(255 255 255 / 0%) 35%,
    rgb(255 255 255 / 0%) 100%
  );
  background-position: -300px 0;
  background-repeat: no-repeat;
  box-shadow: inset rgb(255 75 75 / 90%) 8px 0 2px -2px;
}

.win:hover {
  background-position: -100px 0;
}

.fail:hover {
  background-position: -100px 0;
}

.info {
  font-size: 12px;
  width: 110px;
  margin-left: 20px;
}

.info .game-mode {
  font-size: 14px;
  display: inline-block;
  padding: 1px;
  border-radius: 2px;
  box-shadow:
    rgba(50, 50, 93, 0.25) 0px 2px 5px -1px,
    rgba(0, 0, 0, 0.3) 0px 1px 3px -1px;
}

.result {
  margin-left: 10px;
  margin-right: 20px;
}

.win-result {
  text-shadow: 3px 1px 4px rgba(159, 255, 136, 0.45);
}

.fail-result {
  text-shadow: 3px 1px 4px rgba(255, 44, 44, 0.45);
}

.spell img {
  width: 20px;
}

.rune img {
  width: 20px;
}

.kda-group {
  margin-left: 20px;
  display: grid;
  grid-template-columns: 2fr 2fr 1fr;
}

.kda-group .kda,
.gold,
.minions {
  font-size: 12px;
}

.kda-group .title {
  font-size: 14px;
  color: #fbc8b3;
}

.kda {
  width: 65px;
}

.item-group {
  display: flex;
  flex-flow: row nowrap;
  align-self: center;
}
</style>
