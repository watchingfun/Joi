import useLCUStore, { ConnectStatusEnum } from "@/store/lcu";
import useAppStore from "@/store/app";

const loading = ref(false);
export default function () {
	const lcuStore = useLCUStore();
	const { message } = useAppStore();
	const fetchData = ({
		summonerName,
		puuid
	}: {
		summonerName?: string;
		puuid?: string;
	} = {}) => {
		console.log("fetchData", { summonerName, puuid });
		if (lcuStore.connectStatus !== ConnectStatusEnum.connected) {
			message.error("未连接客户端！");
			return;
		}
		loading.value = true;
		lcuStore.getMatchHistoryQueryResult({ summonerName, puuid }).finally(() => {
			loading.value = false;
		});
	};
	return {
		fetchData,
		loading
	};
}
