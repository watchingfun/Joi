<template>
  <div class="relative shiny">
    <n-tabs
      ref="tabsInstRef"
      type="line"
      v-model:value="navStore.activeKey"
      animated
      size="large"
      :tabs-padding="36"
    >
      <n-tab
        v-for="menu in navStore.navMenus"
        :key="menu.key"
        :name="menu.key"
        @click="() => handleSelect(menu.key)"
      >
        {{ menu.name }}
      </n-tab>
    </n-tabs>
    <div
      class="search"
      style="
        display: flex;
        flex-flow: row nowrap;
        width: 204px;
        margin-right: 20px;
        position: absolute;
        top: 50%;
        transform: translateY(-54%);
        right: 0;
        gap: 4px;
      "
    >
      <n-input
        clearable
        @keyup.native.enter="search"
        v-model:value="searchVal"
        placeholder="输入召唤师昵称"
      />
      <n-button type="primary" quaternary @click="search"> 搜索</n-button>
    </div>
  </div>
</template>
<script setup lang="ts">
import useNavStore from "@/store/nav";
import { onMounted, ref, Ref } from "vue";
import {
  useMouse,
  UseMouseEventExtractor,
  useParentElement,
  watchThrottled,
} from "@vueuse/core";
import router from "@/router";
import useLCUStore from "@/store/lcu";
import { storeToRefs } from "pinia";
import { TabsInst } from "naive-ui";

const parentEl = useParentElement();
const navStore = useNavStore();

const handleSelect = (key: string) => {
  router.push({ name: key });
};

const extractor: UseMouseEventExtractor = (event) =>
  event instanceof Touch ? null : [event.offsetX, event.offsetY];

const { x, y } = useMouse({ target: parentEl, type: "page" });

watchThrottled(
  [x, y],
  ([preX, preY], [currX, currY]) => {
    shiny.value?.style.setProperty("--x", currX + "");
    shiny.value?.style.setProperty("--y", currY + "");
  },
  { throttle: 200 },
);

const shiny = ref(null) as Ref<HTMLElement | null>;

onMounted(() => {
  shiny.value = document.querySelector(".shiny");
});

const tabsInstRef = ref<TabsInst | null>(null);

watch(
  () => navStore.activeKey,
  () => {
    nextTick(() => tabsInstRef.value?.syncBarPosition());
  },
);

const searchVal = storeToRefs(useLCUStore()).search;

function search() {
  router.push({
    name: "historyMatch",
    params: { summonerName: searchVal.value },
  });
}
</script>
<style scoped>
.shiny :deep(.n-tabs-tab--active) {
  text-shadow: #f8a982 0px 0px 20px;
}

.shiny :deep(.n-tabs-bar) {
  box-shadow: #f8a982 0px 4px 20px 5px;
}

.shiny {
  --x: 0;
  --y: 0;
  overflow: hidden;
  position: relative;
  flex-shrink: 0;
}

.shiny::after {
  content: "";
  position: absolute;
  top: calc(var(--y, 0) * 1px - 1000px);
  left: calc(var(--x, 0) * 1px - 1000px);
  width: 2000px;
  height: 2000px;
  background: radial-gradient(rgb(235 137 78 / 50%), #ffffff00 50%);
  opacity: 0;
  pointer-events: none;
  transition:
    opacity 0.5s ease-in-out,
    top 0.5s cubic-bezier(0.4, 0, 0.2, 1),
    left 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.shiny:hover::after {
  opacity: 0.4;
}
</style>
<style>
.search {
  transition: width 0.2s ease;
}

.search:has(div input:focus) {
  width: 240px !important;
}
</style>
