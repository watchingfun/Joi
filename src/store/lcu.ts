import { defineStore } from "pinia";
import { Ref, ref } from "vue";
import lcuApi from "@/api/lcuApi";
import {
  MatchHistoryQueryResult,
  PageRange,
  PageRanges,
  SummonerInfo,
} from "@@/lcu/interface";
import useAppStore from "@/store/app";

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
  const querySummonerInfo = ref<SummonerInfo>();
  const search = ref("");
  const matchHistoryQueryResult = ref<Array<MatchHistoryQueryResult>>([]);

  async function getCurrentSummoner() {
    summonerInfo.value = await lcuApi.getCurrentSummoner();
    return summonerInfo.value;
  }

  async function getMatchHistoryQueryResult({
    summonerName,
    puuid,
  }: {
    summonerName?: string;
    puuid?: string;
  }) {
    //优先通过puuid查询,如果没有就用名字查询
    if (puuid) {
      if (querySummonerInfo.value?.puuid === puuid) {
      } else {
        querySummonerInfo.value = await lcuApi.getSummonerByPuuid(puuid);
        if (!querySummonerInfo.value) {
          useAppStore().message.warning(`查询不到召唤师[${puuid}]`);
          matchHistoryQueryResult.value = [];
          return;
        }
      }
    } else if (summonerName) {
      if (querySummonerInfo.value?.displayName === summonerName) {
        puuid = querySummonerInfo.value?.puuid;
      } else {
        querySummonerInfo.value = await lcuApi.getSummonerByName(summonerName);
        puuid = querySummonerInfo.value?.puuid;
        if (!puuid) {
          useAppStore().message.warning(`查询不到召唤师[${summonerName}]`);
          matchHistoryQueryResult.value = [];
          return;
        }
      }
    } else {
      //如果名字和puuid都没传，那就是查询自己
      querySummonerInfo.value =
        summonerInfo.value || (await getCurrentSummoner());
      puuid = querySummonerInfo.value?.puuid;
    }

    matchHistoryQueryResult.value =
      (await lcuApi.queryMatchHistory(puuid as string, pageRange.value)) || [];
  }

  function refreshConnectStatus() {
    lcuApi.queryConnectStatus().then((connected: boolean = false) => {
      connectStatus.value = connected
        ? ConnectStatusEnum.connected
        : ConnectStatusEnum.disconnect;
    });
  }

  return {
    connectStatus,
    getCurrentSummoner,
    getMatchHistoryQueryResult,
    pageRange,
    summonerInfo,
    matchHistoryQueryResult,
    refreshConnectStatus,
    querySummonerInfo,
    search,
  };
});

export default useLCUStore;
