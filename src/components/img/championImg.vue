<template>
  <div class="relative">
    <el-avatar
      shape="square"
      :src="imgUrl(props.championId)"
    >
      <img :src="defaultImg" />
    </el-avatar>
    <div class="level" v-if="props.level">
      {{ props.level }}
    </div>
  </div>
</template>
<script setup lang="ts">
import { champDict } from "@@/const/lolDataConfig";

const defaultImg = "./img/default.png";
const imgUrl = (champId: number) => {
  if (champDict[champId]) {
    return `https://game.gtimg.cn/images/lol/act/img/champion/${champDict[champId].alias}.png`;
  } else {
    return "./img/non-champion.png";
  }
};

// props
const props = defineProps({
  level: { type: Number, required: false },
  championId: { type: Number, required: true },
});
</script>
<style scoped>
.level {
  position: absolute;
  bottom: -4px;
  right: -6px;
  text-shadow: 3px 2px 4px rgb(0 0 0 / 64%)
}
</style>
