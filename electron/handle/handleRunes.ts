import { ipcMain } from "electron";
import runesDB from "../db/runes";

export function setupRunesListener() {
  ipcMain.handle("queryCustomRunes", (event, query) => {
    console.log("queryCustomRunes", query);
    return runesDB.queryPageRunes(query);
  });

  ipcMain.handle("addCustomRune", (event, value) => {
    console.log("addCustomRunes", value);
    return runesDB.addRune(value);
  });

  ipcMain.handle("updateCustomRune", (event, id, query) => {
    console.log("updateCustomRunes", id, query);
    return runesDB.updateRune(id, query);
  });

  ipcMain.handle("deleteCustomRune", (event, id) => {
    console.log("deleteCustomRunes", id);
    return runesDB.deleteRune(id);
  });
}
