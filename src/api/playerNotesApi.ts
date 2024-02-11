import {PageObj, PlayerNote, PlayerNotePageQuery} from "@@/types/type";

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
		return window.ipcRenderer.invoke("queryPlayerNotes", query) as Promise<PageObj<PlayerNote>>;
	},
	updatePlayerNote: (value: PlayerNote) => {
		return window.ipcRenderer.invoke("updatePlayerNote", value);
	},
	deletePlayerNote: (ids: string[]) => {
		return window.ipcRenderer.invoke("deletePlayerNotes", ids);
	},
  importNotes: ()=>{
    return window.ipcRenderer.invoke("importNotes") as Promise<number>;
  },
  exportNotes: ()=>{
    return window.ipcRenderer.invoke("exportNotes") as Promise<any>;
  }
};
