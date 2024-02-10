import { ipcMain } from "electron";
import playerNotesDB from "../db/playerNotes";
import logger from "../lib/logger";
import { PlayerNote, PlayerNotePageQuery } from "../types/type";

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

	ipcMain.handle("addPlayerNote", (event, value: PlayerNote) => {
		logger.debug("addPlayerNote", value);
		return playerNotesDB.addNote(value);
	});

  ipcMain.handle("getAllTag",(event, ...args)=>{
    logger.debug("getAllTag");
    return playerNotesDB.getAllTag();
  })

	ipcMain.handle("updatePlayerNote", (event, value: PlayerNote) => {
		logger.debug("updatePlayerNote", value);
		return playerNotesDB.updateNote(value);
	});

	ipcMain.handle("deletePlayerNote", (event, id: string) => {
		logger.debug("deletePlayerNote", id);
		return playerNotesDB.deleteNote(id);
	});
}
