import { app, ipcMain } from "electron";
import playerNotesDB from "../db/playerNotes";
import logger from "../lib/logger";
import { PlayerNote, PlayerNotePageQuery } from "../types/type";
import { spawn } from "child_process";
import { spawnSync } from "node:child_process";

export function setupHandlePlayerNotes() {
	ipcMain.handle("queryPlayerNotes", (event, query: PlayerNotePageQuery) => {
		logger.debug("queryPlayerNotes", query);
		return playerNotesDB.queryPageNotes(query);
	});

	ipcMain.handle("queryPlayerNotesByPuuids", (event, puuids: string[]) => {
		logger.debug("queryPlayerNotesByPuuids", puuids);
		return puuids.map((puuid) => {
			return playerNotesDB.getNote(puuid);
		});
	});

  ipcMain.handle("queryPlayerNote", (event, id: string) => {
    logger.debug("queryPlayerNote", id);
    return playerNotesDB.getNote(id);
  })

	ipcMain.handle("addPlayerNote", (event, value: PlayerNote) => {
		logger.debug("addPlayerNote", value);
		return playerNotesDB.addNote(value);
	});

	ipcMain.handle("getAllTag", (event, ...args) => {
		logger.debug("getAllTag");
		return playerNotesDB.getAllTag();
	});

	ipcMain.handle("updatePlayerNote", (event, value: PlayerNote) => {
		logger.debug("updatePlayerNote", value);
		return playerNotesDB.updateNote(value);
	});

	ipcMain.handle("deletePlayerNotes", (event, ids: string[]) => {
		logger.debug("deletePlayerNotes", ids);
		ids.forEach((id) => {
			playerNotesDB.deleteNote(id);
		});
		return;
	});

	ipcMain.handle("exportNotes", async (event, ...args) => {
		logger.debug("exportNotes");
		let path = app.getPath("temp") + new Date().getTime() + ".xlsx";
		await playerNotesDB.exportNotes(path);
		spawnSync("explorer.exe", [path]);
		return;
	});

	ipcMain.handle("importNotes", (event, ...args) => {
		logger.debug("importNotes");
		return playerNotesDB.importNotes();
	});
}
