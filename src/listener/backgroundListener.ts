import useLCUStore, { ConnectStatusEnum } from "@/store/lcu";
import { lcuConst } from "@@/const/const";
import router from "@/router";
import IpcRendererEvent = Electron.IpcRendererEvent;

export function setupListener() {
  const lcuStore = useLCUStore();
  window.ipcRenderer.on(
    lcuConst.disconnect,
    (event: IpcRendererEvent, ...args: any[]) => {
      lcuStore.connectStatus = ConnectStatusEnum.disconnect;
    },
  );
  window.ipcRenderer.on(
    lcuConst.connecting,
    (event: IpcRendererEvent, ...args: any[]) => {
      lcuStore.connectStatus = ConnectStatusEnum.connecting;
    },
  );
  window.ipcRenderer.on(
    lcuConst.connected,
    (event: IpcRendererEvent, ...args: any[]) => {
      lcuStore.connectStatus = ConnectStatusEnum.connected;
      lcuStore.getCurrentSummoner();
    },
  );
  window.ipcRenderer.on(
    "jumpRoute",
    (event: IpcRendererEvent, ...args: any[]) => {
      router.push(args[0] as string | { name: string });
    },
  );
}
