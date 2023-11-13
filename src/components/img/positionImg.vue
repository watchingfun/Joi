<template>
	<img
		:width="props.width"
		:height="props.width"
		:src="`./img/position/icon-position-${props.position}.svg`"
		alt="positionImage" />
</template>
<script setup lang="ts">
// props
const props = defineProps({
	width: { type: Number, required: false },
	position: { type: Number, required: true }
});
</script>
