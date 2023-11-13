import { contextBridge, ipcRenderer } from "electron";
import { dom, style } from "./loadingResource";

// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld("ipcRenderer", withPrototype(ipcRenderer));

// `exposeInMainWorld` can't detect attributes and methods of `prototype`, manually patching it.
function withPrototype(obj: Record<string, any>) {
	const protos = Object.getPrototypeOf(obj);

	for (const [key, value] of Object.entries(protos)) {
		if (Object.prototype.hasOwnProperty.call(obj, key)) continue;

		if (typeof value === "function") {
			// Some native APIs, like `NodeJS.EventEmitter['on']`, don't work in the Renderer process. Wrapping them into a function.
			obj[key] = function (...args: any) {
				return value.call(obj, ...args);
			};
		} else {
			obj[key] = value;
		}
	}
	return obj;
}

// --------- Preload scripts loading ---------
function domReady(condition: DocumentReadyState[] = ["complete", "interactive"]) {
	return new Promise((resolve) => {
		if (condition.includes(document.readyState)) {
			resolve(true);
		} else {
			document.addEventListener("readystatechange", () => {
				if (condition.includes(document.readyState)) {
					resolve(true);
				}
			});
		}
	});
}

const safeDOM = {
	append(parent: HTMLElement, child: HTMLElement) {
		if (!Array.from(parent.children).find((e) => e === child)) {
			parent.appendChild(child);
		}
	},
	remove(parent: HTMLElement, child: HTMLElement) {
		if (Array.from(parent.children).find((e) => e === child)) {
			parent.removeChild(child);
		}
	}
};

/**
 * https://tobiasahlin.com/spinkit
 * https://codepen.io/tylertonyjohnson/full/XWxqLrj
 */
function useLoading() {
	const className = `loaders-css__square-spin`;
	const oStyle = document.createElement("style");
	const oDiv = document.createElement("div");
	//防止闪烁
	const oStyle2 = document.createElement("style");
	oStyle2.innerHTML = ".loading-container{opacity:0;}";

	oStyle.id = "app-loading-style";
	oStyle.innerHTML = style;
	oDiv.className = "app-loading-wrap";
	oDiv.innerHTML = `<div class="${className}">${dom}</div>`;

	return {
		appendLoading() {
			safeDOM.append(document.head, oStyle);
			safeDOM.append(document.body, oDiv);
		},
		async removeLoading() {
			safeDOM.append(document.head, oStyle2);
			setTimeout(() => {
				safeDOM.remove(document.head, oStyle);
				safeDOM.remove(document.head, oStyle2);
				safeDOM.remove(document.body, oDiv);
			}, 1200);
		}
	};
}

// ----------------------------------------------------------------------

const { appendLoading, removeLoading } = useLoading();
domReady().then(() => {
	appendLoading();
	const isWin11 = ipcRenderer.sendSync("checkIsWin11");
	if (isWin11) {
		const win11Style = document.createElement("style");
		win11Style.innerHTML = "body{background-color: transparent !important;}";
		safeDOM.append(document.head, win11Style);
	}
});

window.onmessage = (ev: MessageEvent) => {
	ev.data.payload === "removeLoading" && removeLoading();
};

setTimeout(removeLoading, 4999);
