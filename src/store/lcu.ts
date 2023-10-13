import { defineStore } from "pinia";
import { Ref, ref } from "vue";
import IpcRendererEvent = Electron.IpcRendererEvent;
import { ElMessage } from "element-plus";
import lcuApi from "@/api/lcuApi";

export enum ConnectStatusEnum {
  connecting,
  connected,
  disconnect,
}

const useLCUStore = defineStore("lcu", () => {
  const connectStatus = ref(
    ConnectStatusEnum.disconnect,
  ) as Ref<ConnectStatusEnum>;

  async function getCurrentSummoner() {
    if (connectStatus.value !== ConnectStatusEnum.connected) {
      throw new Error("客户端未连接");
    }
    await lcuApi.getCurrentSummoner().then((data) => console.log(data));
  }

  return { connectStatus, getCurrentSummoner };
});

export default useLCUStore;
