import Index from "@/page/Index.vue";
import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";
import InGame from "@/page/InGame.vue";
import HistoryMatch from "@/page/HistoryMatch.vue";
import Setting from "@/page/Setting.vue";
import useNavStore from "@/store/nav";

const routes = [
  {
    path: "/",
    redirect: '/index'
  },
  {
    path: "/index",
    name: "index",
    component: Index,
  },
  { path: "/inGame", name: "inGame", component: InGame },
  { path: "/historyMatch", name: "historyMatch", component: HistoryMatch },
  { path: "/setting", name: "setting", component: Setting },
] as RouteRecordRaw[];
const router = createRouter({
  //hash 模式
  history: createWebHashHistory(),
  routes,
});

router.afterEach((to) => {
  const navStore = useNavStore();
  navStore.updateActiveKey(to.path);
  console.log("to", to);
});
export default router;
