<template>
  <div class="relative">
    <el-avatar v-bind="$attrs" shape="square" :src="imgUrl(props.championId)">
      <img src="./img/default.png" />
    </el-avatar>
    <div class="level" v-if="props.level">
      {{ props.level }}
    </div>
  </div>
</template>
<script setup lang="ts">
import { champDict } from "@@/config/lolDataConfig";

const imgUrl = (champId: number) => {
  if (champDict[champId]) {
    return `https://game.gtimg.cn/images/lol/act/img/champion/${champDict[champId].alias}.png`;
  } else {
    return "./img/non-champion.png";
  }
};

// props
const props = defineProps(["level", "championId"]);
</script>
<style scoped>
.level {
  position: absolute;
  bottom: 0;
  right: 0;
  text-shadow: 3px 1px 4px rgba(0, 0, 0, 0.4);
}
</style>
