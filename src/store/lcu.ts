import { defineStore } from "pinia";
import { Ref, ref } from "vue";

export enum ConnectStatusEnum {
  connecting,
  connected,
  disconnect,
}

const useLCUStore = defineStore("lcu", () => {
  const connectStatus = ref(
    ConnectStatusEnum.disconnect,
  ) as Ref<ConnectStatusEnum>;

  async function connectLCU() {
    try {
      connectStatus.value = ConnectStatusEnum.connecting;
      await window.ipcRenderer.invoke("lcu:connect").then(() => {
        connectStatus.value = ConnectStatusEnum.connected;
      });
      window.ipcRenderer.on("lcu:disconnect", () => {
        connectStatus.value = ConnectStatusEnum.disconnect;
        console.log("lcu:disconnect");
      });
    } catch (e) {
      connectStatus.value = ConnectStatusEnum.disconnect;
      console.error(e);
      throw new Error("连接失败，客户端可能未启动");
    }
  }

  async function getCurrentSummoner() {
    if (connectStatus.value !== ConnectStatusEnum.connected) {
      throw new Error("客户端未连接");
    }
    await window.ipcRenderer
      .invoke("lcu:getCurrentSummoner")
      .then((data: any) => {
        console.log(data);
      });
  }

  return { connectStatus, connectLCU, getCurrentSummoner };
});

export default useLCUStore;
