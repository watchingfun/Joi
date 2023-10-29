import { CustomRune } from "@@/config/type";

export default {
  addCustomRunes(runes: CustomRune) {
    return window.ipcRenderer.invoke("addCustomRune", runes);
  },
  updateCustomRunes(id: number, runes: CustomRune) {
    return window.ipcRenderer.invoke("updateCustomRune", id, runes);
  },
  queryPageRunes() {
    return window.ipcRenderer.invoke("queryCustomRunes");
  },
  deletePageRunes(id: number) {
    return window.ipcRenderer.invoke("deleteCustomRune", id);
  },
  applyCustomRunes(id: number) {
    return window.ipcRenderer.invoke("applyCustomRune", id);
  },
};
