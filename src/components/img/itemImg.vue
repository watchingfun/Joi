<template>
  <img v-bind="$attrs" :src="url" :class="[props.itemId === 0 ? 'none' : '']" />
</template>
<script setup lang="ts">
import { computed } from "vue";
// computed
const url = computed(() => {
  if (props.itemId === 0) {
    return "/img/blank.png";
  } else
    return (
      "https://game.gtimg.cn/images/lol/act/img/item/" + props.itemId + ".png"
    );
});
// props
const props = defineProps(["itemId"]);
</script>
<style scoped>
.none {
  opacity: 0.3;
}
</style>
