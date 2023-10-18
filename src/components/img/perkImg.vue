<template>
    <img
        :width="props.width" :height="props.width"
        :src="'/img/perk/emblem-' + props.tier.toLowerCase() + '.png'"
    />
</template>
<script setup lang="ts">
// props
const props = defineProps({
  width: { type: Number, required: false },
  tier: { type: String, required: true },
});
</script>
