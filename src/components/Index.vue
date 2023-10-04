<script setup lang="ts">
import { ref } from "vue";
import { storeToRefs } from "pinia";
import useLCUStore, { ConnectStatusEnum } from "@/store/lcu";
import { CircleCheck, CircleClose, Loading } from "@element-plus/icons-vue";

const lcuStore = useLCUStore();
const { connectStatus } = storeToRefs(lcuStore);
const { connectLCU,getCurrentSummoner } = lcuStore;



</script>

<template>
  <div>
<!--    <el-button plain type="primary" @click="getCurrentSummoner">获取当前召唤师信息</el-button>-->
  </div>
</template>

<style scoped>
.rotate {
  animation: rotation 2s infinite linear;
}

@keyframes rotation {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(365deg);
  }
}
</style>
