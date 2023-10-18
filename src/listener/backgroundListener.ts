import useLCUStore, { ConnectStatusEnum } from "@/store/lcu";
import IpcRendererEvent = Electron.IpcRendererEvent;
import { lcuConst } from "../../electron/config/const";

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
}
