<template>
    <img
        :width="props.width"
        :src="`./img/position/icon-position-${props.position}.svg`"
    />
</template>
<script setup>
// props
const props = defineProps(['width', 'position'])
</script>
