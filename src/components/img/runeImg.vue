<template>
	<img :src="url" alt="runeImage" />
</template>
<script setup lang="ts">
import { computed } from "vue";
import { runesFlatMap } from "@/common/runes";
// props
const props = defineProps({
	runeId: { type: Number, required: true }
});
const url = computed(() => {
	let rune = runesFlatMap.get(props.runeId);
	if (!rune) {
		return "./img/blank.png";
	} else return rune.icon.toLowerCase();
});
</script>
