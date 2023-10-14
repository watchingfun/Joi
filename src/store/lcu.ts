import { defineStore } from "pinia";
import { Ref, ref } from "vue";
import lcuApi from "@/api/lcuApi";
import {
  MatchHistoryQueryResult,
  PageRange,
  PageRanges,
  SummonerInfo,
} from "../../electron/lcu/interface";

export enum ConnectStatusEnum {
  connecting,
  connected,
  disconnect,
}

const useLCUStore = defineStore("lcu", () => {
  const connectStatus = ref(
    ConnectStatusEnum.disconnect,
  ) as Ref<ConnectStatusEnum>;

  const pageRange = ref<PageRange>(PageRanges[0]);
  const summonerInfo = ref<SummonerInfo | null>(null);
  const matchHistoryQueryResult = ref<Array<MatchHistoryQueryResult>>([]);

  async function getCurrentSummoner() {
    summonerInfo.value = await lcuApi.getCurrentSummoner();
    console.log(summonerInfo.value);
    return summonerInfo.value;
  }

  async function getMatchHistoryQueryResult(puuid?: string) {
    if (!puuid) {
      puuid = (await getCurrentSummoner())?.puuid;
    }
    matchHistoryQueryResult.value = await lcuApi.queryMatchHistory(
      puuid,
      pageRange.value,
    );
    console.log(matchHistoryQueryResult.value);
  }

  return {
    connectStatus,
    getCurrentSummoner,
    getMatchHistoryQueryResult,
    pageRange,
    summonerInfo,
    matchHistoryQueryResult,
  };
});

export default useLCUStore;
