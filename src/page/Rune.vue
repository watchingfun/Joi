<script setup lang="ts">
import { runesMap } from "@/common/runes";
import RuneEdit from "@/components/RuneEdit.vue";
import {
  CustomRune,
  PageObj,
  RunesDBObj,
  RunesPageQuery,
} from "@@/config/type";
import runesApi from "@/api/runesApi";
import EpicLoading from "@/components/EpicLoading.vue";
import { watchDebounced } from "@vueuse/core";
import { ComputedRef } from "vue";
import RuneCard from "@/components/DBRuneCard.vue";
import { OverlayScrollbarsComponent } from "overlayscrollbars-vue";
import { TransitionSlide } from "@morev/vue-transitions";

const tabs = [
  {
    name: "全部",
    id: 0,
    config: { key: "all", icon: null },
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
const showEditRune = ref(false);

const message = useMessage();
const loading = ref(false);

function addRune(runeConfig: CustomRune, id: number) {
  if (id) {
    runesApi.updateCustomRune(id, runeConfig).then(() => {
      message.success("更新成功");
      showEditRune.value = false;
      fetchData();
    });
  } else {
    runesApi.addCustomRune(runeConfig).then(() => {
      message.success("保存成功");
      showEditRune.value = false;
      fetchData();
    });
  }
}

const page = ref(1);
const pageSize = ref(10);
const searchVal = ref<string>();

const pageQueryObj: ComputedRef<RunesPageQuery> = computed(() => ({
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
    : parseInt(String(total / pageSizeNum)) + 1;
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

watch(activeKey, () => {
  page.value = 1;
  fetchData();
});

const editRuneObj = ref<RunesDBObj>();

const showAddHandler = () => {
  editRuneObj.value = undefined;
  showEditRune.value = true;
};
const showEditHandler = (rune: RunesDBObj) => {
  editRuneObj.value = rune;
  showEditRune.value = true;
};
const dialog = useDialog();
const deleteRuneHandler = (id: number) => {
  runesApi.deleteCustomRune(id).then(() => {
    message.success("删除成功");
    fetchData();
  });
};

onMounted(() => {
  fetchData();
});
</script>

<template>
  <div class="flex flex-col items-center flex-1 relative min-h-0">
    <div
      class="flex flex-row flex-nowrap justify-evenly items-center gap-[10px]"
      style="width: 100%; border-bottom: 1px rgba(128, 128, 128, 0.52) solid"
    >
      <n-tabs
        style="width: 500px; padding: 10px 0 0 0"
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
          <span
            :class="tab.config?.key"
            class="flex flex-row justify-center gap-1 pb-[5px]"
          >
            <n-image
              width="20"
              preview-disabled
              :src="(tab.config?.icon as string).toLowerCase()"
              v-if="tab.config?.icon"
            ></n-image>
            <span> {{ tab.name }}</span>
          </span>
        </n-tab>
      </n-tabs>
      <n-input
        style="width: 150px"
        placeholder="搜索"
        v-model:value="searchVal"
        clearable
      ></n-input>
      <n-button @click="showAddHandler">新增</n-button>
    </div>
    <div class="content relative flex flex-1 flex-col min-h-0 w-full">
      <overlay-scrollbars-component
        style="height: 100%"
        class="scroll-wrapper"
        element-loading-background="rgba(122, 122, 122, 0.6)"
        :options="{ scrollbars: { autoHide: 'move' } }"
      >
        <transition-slide
          :offset="[-16, 0]"
          mode="out-in"
          class="w-full h-full"
        >
          <epic-loading
            :loading="loading"
            class="w-full h-full"
            :key="activeKey"
          >
            <div
              class="flex flex-row justify-start gap-[30px] mx-5 flex-wrap pt-5 pb-[50px]"
            >
              <rune-card
                @edit="showEditHandler"
                @delete="deleteRuneHandler"
                v-for="rune in pageResult.data"
                :rune="rune"
              ></rune-card>
            </div>
          </epic-loading>
        </transition-slide>
      </overlay-scrollbars-component>
      <div
        class="absolute bottom-0 p-[10px] right-0 w-full flex flex-row justify-center pagination"
      >
        <n-pagination
          v-model:page="page"
          v-model:page-size="pageSize"
          @update-page="fetchData"
          :page-count="pageCount"
          :page-sizes="[10, 20, 30, 50]"
          :page-slot="8"
          size="small"
        >
          <template #suffix> 总计数量 {{ pageResult.total }}</template>
        </n-pagination>
      </div>
    </div>
    <RuneEdit
      v-model:show="showEditRune"
      @save="addRune"
      :rune="editRuneObj"
    ></RuneEdit>
  </div>
</template>

<style scoped>
.scroll-wrapper :deep(div[data-overlayscrollbars-contents]) {
  height: 100%;
}

:deep(.n-tabs-tab--active):has(.c_8000) {
  text-shadow: 0 0 9px #ffca68;
}

:deep(.n-tabs-tab--active):has(.c_8100) {
  text-shadow: 0 0 9px #ffca68;
}

.pagination {
  background: rgba(28, 28, 28, 0.6);
  backdrop-filter: saturate(50%) blur(4px);
}
</style>
