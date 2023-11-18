// custom.d.ts

import { IpcRenderer } from "electron";

declare global {
	interface Window {
		ipcRenderer: IpcRenderer;
	}
}
