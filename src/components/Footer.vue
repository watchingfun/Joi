<script setup lang="ts">
import ConnectStatus from "@/components/ConnectStatus.vue";
import useAppStore from "@/store/app";
import { onMounted, onUnmounted, ref } from "vue";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import relativeTime from "dayjs/plugin/relativeTime";
import zhCN from "dayjs/locale/zh-cn";
import { ElMessage } from "element-plus";
import lcuApi from "@/api/lcuApi";

dayjs.extend(duration);
dayjs.extend(relativeTime);
dayjs.locale(zhCN);

const appStore = useAppStore();
let timer: ReturnType<typeof setInterval> | null;
const diffTime = ref();
const visible = ref(false);

const killLCURenderHandler = () => {
  visible.value = false;
  lcuApi.lcuKillRender().then(() => ElMessage.success("kill请求已发送！"));
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
  <div class="footer">
    <el-divider style="margin: 0" />
    <div class="info flex flex-row flex-nowrap items-center justify-between">
      <div class="ml-2">
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
            <div class="kill-btn" @click="visible = true">
              重启LCURender进程
            </div>
          </template>
        </el-popover>
      </div>
      <div class="flex flex-row items-center">
        <div
          onclick="ipcRenderer.send('open-url', 'https://github.com/watchingfun/Joi')"
          title="Joi Repository"
          class="github-icon"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            focusable="false"
            viewBox="0 0 24 24"
          >
            <path
              d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
            ></path>
          </svg>
        </div>
        <ConnectStatus class="mr-1"></ConnectStatus>
      </div>
    </div>
  </div>
</template>

<style scoped>
.footer {
  font-size: 12px;
  position: absolute;
  bottom: 0;
  width: 100%;
  height: 25px;
  line-height: 1;
  display: flex;
  flex-flow: column nowrap;
}

.info {
  flex: 1;
  margin-bottom: 2px;
}

.kill-btn {
  cursor: pointer;
}

.kill-btn:hover {
  color: #fa9f49;
}

.github-icon {
  width: 12px;
  height: 12px;
  display: block;
  margin-right: 12px;
  cursor: pointer;
}
</style>
