<template>
	<img :width="props.width" :height="props.width" v-bind="$attrs" :src="url" alt="spellImage" />
</template>
<script setup lang="ts">
import { computed } from "vue";
import { spells } from "@@/const/lolDataConfig";
// props
const props = defineProps({
	spellId: { type: Number, required: true },
	width: { type: Number, required: false }
});
const url = computed(() => {
	if (!spells[props.spellId]) {
		return "./img/blank.png";
	} else return "https://game.gtimg.cn/images/lol/act/img/spell/" + spells[props.spellId] + ".png";
});
</script>
