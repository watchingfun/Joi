<script setup lang="ts">
import ConnectStatus from "@/components/ConnectStatus.vue";
import useAppStore from "@/store/app";
import useLCUStore from "@/store/lcu";
import { onMounted, onUnmounted, ref } from "vue";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import relativeTime from "dayjs/plugin/relativeTime";
import zhCN from "dayjs/locale/zh-cn";
import { ElMessage } from "element-plus";

dayjs.extend(duration);
dayjs.extend(relativeTime);
dayjs.locale(zhCN);

const appStore = useAppStore();
const lcuStore = useLCUStore();
let timer: ReturnType<typeof setInterval> | null;
const diffTime = ref();
const visible = ref(false);

const killLCURenderHandler = () => {
  visible.value = false;
  lcuStore.killRender().then(() => ElMessage.success("kill请求已发送！"));
};

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
        <el-popover :visible="visible" placement="top" :width="350">
          <p>
            此操作通过杀掉LeagueClientUxRender.exe进程来让客户端重启界面进程，可以解决各种黑屏，显示不全等问题。
            确认继续?
          </p>
          <div style="text-align: right; margin: 0">
            <el-button size="small" text @click="visible = false"
              >取消
            </el-button>
            <el-button size="small" type="primary" @click="killLCURenderHandler"
              >确认
            </el-button>
          </div>
          <template #reference>
            <div class="kill-btn" @click="visible = true">重启LCURender进程</div>
          </template>
        </el-popover>
      </div>
      <div>
        <ConnectStatus class="mr-1" style="font-size: 12px"></ConnectStatus>
      </div>
    </div>
  </div>
</template>

<style scoped>
.kill-btn{
  font-size: 12px;
  cursor: pointer;
}
.kill-btn:hover{
  color: #fa9f49;
}
</style>
