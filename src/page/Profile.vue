<script setup lang="ts">
import useLCUStore from "@/store/lcu";

const lcuStore = useLCUStore();
const loading = ref(false);
const message = useMessage();
</script>

<template>
  <div class="h-full flex flex-col"></div>
</template>

<style scoped></style>
