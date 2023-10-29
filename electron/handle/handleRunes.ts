import { ipcMain } from "electron";
import runesDB from "../db/runes";
import { applyRune } from "../lcu/lcuRequest";
import { convertOPGGRuneFormat } from "../lcu/opgg";

export function setupRunesListener() {
  ipcMain.handle("queryCustomRunes", (event, query) => {
    console.log("queryCustomRunes", query);
    return runesDB.queryPageRunes();
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

  ipcMain.handle("applyCustomRune", (event, id) => {
    console.log("applyCustomRune", id);
    return applyRune(convertOPGGRuneFormat(runesDB.getRune(id)));
  });
}
