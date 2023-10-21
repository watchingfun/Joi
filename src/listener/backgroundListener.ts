import useLCUStore, { ConnectStatusEnum } from "@/store/lcu";
import IpcRendererEvent = Electron.IpcRendererEvent;
import { lcuConst } from "@@/const/const";
import router from "@/router";
import useSettingStore from "@/store/setting";

export async function setupListener() {
  const lcuStore = useLCUStore();
  const settingStore = useSettingStore();
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
  window.ipcRenderer.send("updateSetting", JSON.stringify(await settingStore.getSetting()));
}
