<script setup lang="ts">
import useLCUStore from "@/store/lcu";

const lcuStore = useLCUStore();
const loading = ref(false);
const message = useMessage();
</script>

<template>
  <div class="m-auto">开发中</div>
</template>

<style scoped></style>
