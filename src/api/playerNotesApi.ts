import { PlayerNote, PlayerNotePageQuery } from "@@/types/type";

export default {
	getAllTag: () => {
		return window.ipcRenderer.invoke("getAllTag") as Promise<string[]>;
	},
	addPlayerNote: () => {
		return window.ipcRenderer.invoke("addPlayerNote");
	},
	queryPlayerNotesByPuuids: (puuids: string[]) => {
		return window.ipcRenderer.invoke("queryPlayerNotesByPuuids", puuids) as Promise<PlayerNote | undefined[]>;
	},
	queryPlayerNotes: (query: PlayerNotePageQuery) => {
		return window.ipcRenderer.invoke("queryPlayerNotes", query);
	},
	updatePlayerNote: (value: PlayerNote) => {
		return window.ipcRenderer.invoke("updatePlayerNote", value);
	},
	deletePlayerNote: (id: string) => {
		return window.ipcRenderer.invoke("deletePlayerNote", id);
	}
};
