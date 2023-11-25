import { createApp } from "vue";
import "animate.css";
import "./style.css";
import App from "./App.vue";
import { createPinia } from "pinia";
import { setupListener } from "@/listener/backgroundListener";
import router from "@/router/index";
import useLCUStore from "@/store/lcu";
import "@morev/vue-transitions/styles";
import useAppStore from "@/store/app";
import "./common/configDayjs";
import useSettingStore from "@/store/setting";
import { Handle } from "@@/const/const";

//确保naive ui样式不被tailwind preflight 覆盖
const meta = document.createElement("meta");
meta.name = "naive-ui-style";
document.head.appendChild(meta);

const app = createApp(App);
const pinia = createPinia();
app.use(router);
app.use(pinia);
setupListener();
const appStore = useAppStore();
app.mount("#app");

app.config.errorHandler = (err, vm, info) => {
	// 处理错误
	// `info` 是 Vue 特定的错误信息，比如错误所在的生命周期钩子
	console.error("[errorCaptured]", err, vm, info);
	if (err instanceof Error) {
		appStore.message.error(err.message);
		void window.ipcRenderer.invoke(Handle.log, { level: "error", message: err.message + "\nstack: " + err.stack });
	}
};
window.onload = () => {
	//解决开发模式重载网页时状态不同步
	useLCUStore().refreshConnectStatus();
	//初始化设置
	useSettingStore()
		.initSettingModel()
		.finally(() => {
			postMessage({ payload: "removeLoading" }, "*");
		});
};
