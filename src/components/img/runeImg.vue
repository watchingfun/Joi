<template>
  <img v-bind="$attrs" :src="url" />
</template>
<script setup>
import { computed } from "vue";
import { runes } from "@@/config/lolDataConfig";
// props
const props = defineProps(["runeId"]);
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
