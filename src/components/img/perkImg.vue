<template>
    <img
        :width="props.width"
        :src="'/img/perk/emblem-' + props.tier.toLowerCase() + '.png'"
    />
</template>
<script setup lang="ts">
// props
const props = defineProps(['width', 'tier'])
</script>
