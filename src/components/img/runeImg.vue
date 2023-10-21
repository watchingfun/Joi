<template>
  <img :width="props.width" :height="props.width" :src="url" />
</template>
<script setup lang="ts">
import { computed } from "vue";
import { runes } from "@@/const/lolDataConfig";
// props
const props = defineProps({
  width: { type: Number, required: false },
  runeId: { type: Number, required: true },
});
const url = computed(() => {
  if (runes[props.runeId] === undefined) {
    return "./img/blank.png";
  } else
    return (
      "https://game.gtimg.cn/images/lol/act/img/rune/" +
      runes[props.runeId] +
      ".png"
    );
});
</script>
