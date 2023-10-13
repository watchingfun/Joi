<script setup lang="ts">
import { storeToRefs } from "pinia";
import useLCUStore, { ConnectStatusEnum } from "@/store/lcu";
import { CircleCheck, CircleClose, Loading } from "@element-plus/icons-vue";

const lcuStore = useLCUStore();
const { connectStatus } = storeToRefs(lcuStore);
</script>

<template>
  <div class="flex flex-row items-center">
    <div>客户端连接状态:</div>
    <div class="status-info">
      <div v-if="connectStatus === ConnectStatusEnum.connected">
        <el-icon style="color: #00ff00">
          <CircleCheck />
        </el-icon>
        <el-text class="mx-1" type="success">已连接</el-text>
      </div>
      <div
        v-else-if="connectStatus === ConnectStatusEnum.disconnect"
        class="disconnect"
      >
        <el-icon style="color: #ff0000f2">
          <CircleClose />
        </el-icon>
        <el-text
          class="mx-1"
          type="danger"
          style="color: #ff0000f2"
          >未连接
        </el-text>
      </div>
      <div v-else-if="connectStatus === ConnectStatusEnum.connecting">
        <el-icon class="rotate">
          <Loading />
        </el-icon>
        <el-text class="mx-1" type="info">连接中</el-text>
      </div>
    </div>
  </div>
</template>

<style scoped>
.status-info :deep(.el-text){
  font-size: 12px;
}

.status-info > div {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.disconnect {
  transition: all 0.2s ease-in-out;
}
</style>
