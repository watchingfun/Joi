import { CustomRune, PageObj, RunesDBObj, RunesPageQuery } from "@@/types/type";

export default {
  addCustomRune(runes: CustomRune) {
    return window.ipcRenderer.invoke("addCustomRune", runes);
  },
  updateCustomRune(id: number, runes: CustomRune) {
    return window.ipcRenderer.invoke("updateCustomRune", id, runes);
  },
  queryPageRunes(query: RunesPageQuery = { start: 0, size: 50 }) {
    return window.ipcRenderer.invoke("queryCustomRunes", query) as Promise<
      PageObj<RunesDBObj>
    >;
  },
  deleteCustomRune(id: number) {
    return window.ipcRenderer.invoke("deleteCustomRune", id);
  },
  applyCustomRune(id: number) {
    return window.ipcRenderer.invoke("applyCustomRune", id);
  },
};
