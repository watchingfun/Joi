import { lcuConst } from "../../electron/config/const";

export default {
  lcuKillRender: () =>
    window.ipcRenderer.invoke(lcuConst.killRender) as Promise<any>,
  getCurrentSummoner: () =>
    window.ipcRenderer.invoke(lcuConst.getCurrentSummoner) as Promise<any>,
};
