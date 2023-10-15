<template>
  <img v-bind="$attrs" :src="url" />
</template>
<script setup lang="ts">
import { computed } from "vue";
import { spells } from "@@/config/lolDataConfig";
// props
const props = defineProps({ spellId: Number });
const url = computed(() => {
  if (spells[props.spellId] === undefined) {
    return "./img/blank.png";
  } else
    return (
      "https://game.gtimg.cn/images/lol/act/img/spell/" +
      spells[props.spellId] +
      ".png"
    );
});
</script>
