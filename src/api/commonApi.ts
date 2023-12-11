import { Handle } from "@@/const/const";
import { AramChampData } from "@@/types/type";

export default {
	openLogDir: () => {
		window.ipcRenderer.invoke(Handle.openLogDir);
	},
	getAramBuffData: () => {
		return window.ipcRenderer.invoke(Handle.getAramBuffData) as Promise<AramChampData[]>;
	}
};
