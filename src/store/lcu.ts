import { defineStore } from "pinia";
import { Ref, ref } from "vue";
import lcuApi from "@/api/lcuApi";
import {
  MatchHistoryQueryResult,
  PageRange,
  PageRanges,
  SummonerInfo,
} from "@@/lcu/interface";

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
  const summonerInfo = ref<SummonerInfo>();
  const matchHistoryQueryResult = ref<Array<MatchHistoryQueryResult>>([]);

  async function getCurrentSummoner() {
    summonerInfo.value = await lcuApi.getCurrentSummoner();
    return summonerInfo.value;
  }

  async function getMatchHistoryQueryResult(puuid?: string) {
    if (!puuid && connectStatus.value === ConnectStatusEnum.connected) {
      puuid = summonerInfo.value?.puuid || (await getCurrentSummoner())?.puuid;
    }
    matchHistoryQueryResult.value =
      (await lcuApi.queryMatchHistory(puuid as string, pageRange.value)) || [];
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
