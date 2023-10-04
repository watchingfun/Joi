<script setup lang="ts">
import ConnectStatus from "@/components/ConnectStatus.vue";
import useAppStore from "@/store/app";
import { onMounted, onUnmounted, ref } from "vue";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import relativeTime from "dayjs/plugin/relativeTime";
import zhCN from "dayjs/locale/zh-cn";

dayjs.extend(duration);
dayjs.extend(relativeTime);
dayjs.locale(zhCN);

const appStore = useAppStore();
let timer: ReturnType<typeof setInterval> | null;
const diffTime = ref();

onMounted(() => {
  timer = setInterval(() => {
    diffTime.value = appStore.bootTime.fromNow(true);
  }, 1000);
});
onUnmounted(() => {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
});
</script>

<template>
  <div style="position: absolute; bottom: 0; width: 100%; height: 25px">
    <el-divider style="margin: 0" />
    <div
      class="flex flex-row flex-nowrap items-center justify-between"
      style="height: calc(100% - 1px)"
    >
      <div style="font-size: 12px" class="ml-2">
        已运行时间:
        {{ diffTime }}
      </div>
      <div>
        <ConnectStatus class="mr-1" style="font-size: 12px"></ConnectStatus>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
