import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import routes from "@/router/index";
import { createRouter, createWebHashHistory } from "vue-router";
import { createPinia } from "pinia";
import { ElMessage } from "element-plus";
import "element-plus/theme-chalk/el-message.css";

const router = createRouter({
  //hash 模式
  history: createWebHashHistory(),
  routes,
});

const app = createApp(App);
const pinia = createPinia();
app.use(router);
app.use(pinia);
app.mount("#app").$nextTick(() => {
  postMessage({ payload: "removeLoading" }, "*");
});
// Use contextBridge
// @ts-ignore
window.ipcRenderer.on("main-process-message", (_event, message) => {
  console.log(message);
});

app.config.errorHandler = (err, vm, info) => {
  // 处理错误
  // `info` 是 Vue 特定的错误信息，比如错误所在的生命周期钩子
  console.error("[errorCaptured]", err, vm, info);
  if (err instanceof Error) {
    ElMessage.error(err.message);
  }
};
