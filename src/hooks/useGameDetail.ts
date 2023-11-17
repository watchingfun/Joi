import { ref } from "vue";
import { GameDetail } from "@@/types/lcuType";
import lcuApi from "@/api/lcuApi";
import { memoize } from "lodash";
import { LRUCache } from "lru-cache";

//缓存对局详情查询
const cacheQueryGameDetails = memoize(lcuApi.queryGameDetails);
cacheQueryGameDetails.cache = new LRUCache({ max: 500 });
export default function () {
	const gameDetail = ref<GameDetail>();
	const fetchDetailLoading = ref(false);
	return {
		gameDetail,
		fetchDetailLoading,
		fetchDetail: (gameId: number) =>
			cacheQueryGameDetails(gameId)
				.then((res) => {
					gameDetail.value = res;
				})
				.finally(() => setTimeout(() => (fetchDetailLoading.value = false), 100))
	};
}
