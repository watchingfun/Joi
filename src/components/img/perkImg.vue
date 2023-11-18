<template>
	<img
		:src="'./img/perk/emblem-' + props.tier.toLowerCase() + '.png'"
		alt="perkImage" />
</template>
<script setup lang="ts">
// props
const props = defineProps({
	tier: { type: String, required: true }
});
</script>
