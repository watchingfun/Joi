import IndexLayout from "@/page/IndexLayout.vue";
import { createRouter, createWebHashHistory, type RouteRecordRaw } from "vue-router";
import InGame from "@/page/InGame.vue";
import HistoryMatch from "@/page/HistoryMatch.vue";
import Setting from "@/page/Setting.vue";
import useNavStore from "@/store/nav";
import { flatMap } from "lodash";
import Profile from "@/page/Profile.vue";
import Rune from "@/page/Rune.vue";

const routes = [
	{
		path: "/",
		component: IndexLayout,
		children: [
			{
				path: "",
				name: "index",
				component: Profile,
				meta: { title: "主页" }
			},
			{
				path: "inGame/:showAnalysis?",
				name: "inGame",
				component: InGame,
				meta: { title: "对局" }
			},
			{
				path: "historyMatch/:summonerName?/:puuid?",
				name: "historyMatch",
				component: HistoryMatch,
				meta: { title: "历史战绩" }
			},
			{ path: "setting", name: "setting", component: Setting },
			{
				path: "rune",
				name: "rune",
				component: Rune,
				meta: { title: "符文" }
			}
		]
	}
] as RouteRecordRaw[];

export const flatRoutes = flatMap(routes, (value, key, collection) => {
	return value?.children || value;
});

const router = createRouter({
	//hash 模式
	history: createWebHashHistory(),
	routes
});

router.afterEach((to) => {
	const navStore = useNavStore();
	navStore.updateActiveKey(to.name as string);
});
export default router;
