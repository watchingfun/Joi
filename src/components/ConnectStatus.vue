<script setup lang="ts">
import { ConnectStatusEnum } from "@/store/lcu";
import { CircleCheck, Loading } from "@element-plus/icons-vue";
import Plugs from "@/components/img/plugs.vue";
import { toRefs } from "vue";

const props = defineProps<{ connectStatus: ConnectStatusEnum }>();
const { connectStatus } = toRefs(props);
</script>

<template>
  <div class="flex flex-row items-center">
    <div>客户端连接状态:</div>
    <div class="status-info" style="font-size: 18px">
      <div v-if="connectStatus === ConnectStatusEnum.connected">
        <el-icon style="color: rgb(76 255 124 / 87%)">
          <CircleCheck />
        </el-icon>
      </div>
      <div
        v-else-if="connectStatus === ConnectStatusEnum.disconnect"
        class="disconnect"
      >
        <el-icon>
          <Plugs />
        </el-icon>
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
.status-info :deep(.el-text) {
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
