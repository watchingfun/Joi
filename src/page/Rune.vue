<script setup lang="ts">
import { runesMap } from "@/common/runes";
import RuneAdd from "@/components/RuneEdit.vue";
import {
  CustomRune,
  PageObj,
  RunesDBObj,
  RunesPageQuery,
} from "@@/config/type";
import runesApi from "@/api/runesApi";
import EpicLoading from "@/components/EpicLoading.vue";
import { watchDebounced } from "@vueuse/core";

const tabs = [
  {
    name: "全部",
    id: 0,
    config: { key: "all" },
  },
  {
    name: "精密",
    id: 8000,
    config: runesMap.get("Precision"),
  },
  {
    name: "主宰",
    id: 8100,
    config: runesMap.get("Domination"),
  },
  {
    name: "巫术",
    id: 8200,
    config: runesMap.get("Sorcery"),
  },
  {
    name: "坚决",
    id: 8400,
    config: runesMap.get("Resolve"),
  },
  {
    name: "启迪",
    id: 8300,
    config: runesMap.get("Inspiration"),
  },
];
const activeKey = ref(0);
const showAddRune = ref(false);

const message = useMessage();
const loading = ref(false);

function addRune(runeConfig: CustomRune) {
  runesApi.addCustomRunes(runeConfig).then(() => message.success("保存成功"));
}

const page = ref(1);
const pageSize = ref(10);
const searchVal = ref<string>();

const pageQueryObj: RunesPageQuery = computed(() => ({
  start: page.value - 1,
  size: pageSize.value,
  primaryPageId: activeKey.value,
  name: searchVal.value,
}));

const pageResult = ref<PageObj<RunesDBObj>>({ data: [], total: 0 });

const pageCount = computed(() => {
  let total = pageResult.value.total;
  let pageSizeNum = pageSize.value;
  return total % pageSizeNum === 0
    ? total / pageSizeNum
    : parseInt(total / pageSizeNum) + 1;
});

watchDebounced(
  () => searchVal.value,
  () => {
    fetchData();
  },
  { debounce: 500 },
);

function fetchData() {
  loading.value = true;
  runesApi
    .queryPageRunes(toRaw(unref(pageQueryObj.value)))
    .then((res) => (pageResult.value = res))
    .finally(() => {
      setTimeout(() => (loading.value = false), 0);
    });
}

function tabChange() {
  nextTick(fetchData);
}

onMounted(() => {
  fetchData();
});
</script>

<template>
  <div class="flex flex-col items-center">
    <div
      class="flex flex-row flex-nowrap justify-evenly items-center gap-[10px]"
    >
      <n-tabs
        @update-value="tabChange"
        style="width: 400px; padding: 20px 0"
        v-model:value="activeKey"
        justify-content="space-around"
        animated
        size="small"
        :tabs-padding="36"
      >
        <n-tab
          v-for="tab in tabs"
          :name="tab.id"
          :tab="tab.name"
          :key="tab.name"
        >
          <span :class="tab.config?.key">{{ tab.name }}</span>
        </n-tab>
      </n-tabs>
      <n-input
        style="width: 150px"
        placeholder="搜索"
        v-model:value="searchVal"
        clearable
      ></n-input>
      <n-button @click="() => (showAddRune = true)">新增</n-button>
    </div>
    <div>
      <n-pagination
        v-model:page="page"
        v-model:page-size="pageSize"
        :page-count="pageCount"
        :page-sizes="[10, 20, 30, 50]"
        :page-slot="8"
      >
        <template #suffix> 总计数量 {{ pageResult.total }} </template>
      </n-pagination>
      <epic-loading :loading="loading">
        {{ pageResult }}
      </epic-loading>
    </div>
    <RuneAdd v-model:show="showAddRune" @save="addRune"></RuneAdd>
  </div>
</template>

<style scoped>
:deep(.n-tabs-tab--active):has(.c_8000) {
  text-shadow: 0 0 9px #ffca68;
}

:deep(.n-tabs-tab--active):has(.c_8100) {
  text-shadow: 0 0 9px #ffca68;
}
</style>
