import {createApp} from "vue";
import "./style.css";
import App from "./App.vue";
import {createPinia} from "pinia";
import {setupListener} from "@/listener/backgroundListener";
import router from "@/router/index";
import useLCUStore from "@/store/lcu";
import "@morev/vue-transitions/styles";
import LazyLoad from "lazy-load-vue3";
import useAppStore from "@/store/app";
import "./common/configDayjs";
import useSettingStore from "@/store/setting";

//确保naive ui样式不被tailwind preflight 覆盖
const meta = document.createElement("meta");
meta.name = "naive-ui-style";
document.head.appendChild(meta);

const app = createApp(App);
const pinia = createPinia();
app.use(router);
app.use(pinia);
app.use(LazyLoad, { component: true });
setupListener();
const appStore = useAppStore();
app.mount("#app");

app.config.errorHandler = (err, vm, info) => {
  // 处理错误
  // `info` 是 Vue 特定的错误信息，比如错误所在的生命周期钩子
  console.error("[errorCaptured]", err, vm, info);
  if (err instanceof Error) {
    appStore.message.error(err.message);
  }
};
window.onload = () => {
  console.debug("window.onload");
  //解决开发模式重载网页时状态不同步
  useLCUStore().refreshConnectStatus();
  //初始化设置
  useSettingStore()
    .initSettingModel()
    .finally(() => {
      postMessage({ payload: "removeLoading" }, "*");
    });
};
