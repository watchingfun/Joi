import { ipcMain } from "electron";
import runesDB from "../db/runes";
import logger from "../lib/logger";

export function setupHandleRunes() {
	ipcMain.handle("queryCustomRunes", (event, query) => {
		logger.debug("queryCustomRunes", query);
		return runesDB.queryPageRunes(query);
	});

	ipcMain.handle("addCustomRune", (event, value) => {
		logger.debug("addCustomRunes", value);
		return runesDB.addRune(value);
	});

	ipcMain.handle("updateCustomRune", (event, id, query) => {
		logger.debug("updateCustomRunes", id, query);
		return runesDB.updateRune(id, query);
	});

	ipcMain.handle("deleteCustomRune", (event, id) => {
		logger.debug("deleteCustomRunes", id);
		return runesDB.deleteRune(id);
	});
}
