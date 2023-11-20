import { Handle } from "@@/const/const";

export default {
	openLogDir: () => {
		window.ipcRenderer.invoke(Handle.openLogDir);
	}
};
