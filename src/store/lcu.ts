import { defineStore } from "pinia";
import { Ref, ref } from "vue";
import IpcRendererEvent = Electron.IpcRendererEvent;
import { ElMessage } from "element-plus";

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
      await window.ipcRenderer
        .invoke("lcu:connect")
        .then(() => {
          connectStatus.value = ConnectStatusEnum.connected;
        })
        .cache(() => (connectStatus.value = ConnectStatusEnum.disconnect));
      window.ipcRenderer.on(
        "lcu:disconnect",
        (event: IpcRendererEvent, ...args: any[]) => {
          connectStatus.value = ConnectStatusEnum.disconnect;
          console.log("lcu:disconnect", args);
          let e = args[0] as string;
          if (e && e.includes("connect ECONNREFUSED")) {
            ElMessage.error(e + " 连接失败，请重试");
          } else if (e) {
            ElMessage.error(e);
          }
        },
      );
    } catch (e) {
      connectStatus.value = ConnectStatusEnum.disconnect;
      console.error(e);
      throw new Error("连接失败，客户端可能未启动");
    }
  }

  async function killRender() {
    return window.ipcRenderer.invoke("lcu:killRender");
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

  return { connectStatus, connectLCU, getCurrentSummoner, killRender };
});

export default useLCUStore;
