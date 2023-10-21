import IndexLayout from "@/page/IndexLayout.vue";
import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";
import InGame from "@/page/InGame.vue";
import HistoryMatch from "@/page/HistoryMatch.vue";
import Setting from "@/page/Setting.vue";
import useNavStore from "@/store/nav";
import { flatMap } from "lodash";
import Profile from "@/page/Profile.vue";

const routes = [
  {
    path: "/:index?",
    component: IndexLayout,
    children: [
      {
        path: "",
        name: "index",
        component: Profile,
      },
      { path: "inGame", name: "inGame", component: InGame },
      {
        path: "historyMatch/:search?",
        name: "historyMatch",
        component: HistoryMatch,
      },
      { path: "setting", name: "setting", component: Setting },
    ],
  },
] as RouteRecordRaw[];

export const flatRoutes = flatMap(routes, (value, key, collection) => {
  return value?.children || value;
});

const router = createRouter({
  //hash 模式
  history: createWebHashHistory(),
  routes,
});

router.afterEach((to) => {
  const navStore = useNavStore();
  navStore.updateActiveKey(to.name as string);
});
export default router;
