<script setup lang="ts">
import useLCUStore, {ConnectStatusEnum} from "@/store/lcu";

const lcuStore = useLCUStore();
const loading = ref(false);
const message = useMessage();

function fetchData() {
  if (lcuStore.connectStatus !== ConnectStatusEnum.connected) {
    return;
  }
  loading.value = true;
  lcuStore.getMatchHistoryQueryResult().finally(() => {
    loading.value = false;
  });
}
</script>

<template>
  <div class="h-full flex flex-col"></div>
</template>

<style scoped></style>
