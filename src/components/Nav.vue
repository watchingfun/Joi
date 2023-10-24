<template>
  <div class="relative">
    <n-tabs type="line" v-model:value="navStore.activeKey" animated>
      <n-tab
        v-for="menu in navStore.navMenus"
        :key="menu.key"
        :name="menu.key"
        @click="() => handleSelect(menu.key)"
      >
        {{ menu.name }}
      </n-tab>
    </n-tabs>
    <n-input-group
      class="search"
      style="
        width: 180px;
        margin-right: 20px;
        position: absolute;
        top: 5px;
        right: 0;
      "
    >
      <n-input
        clearable
        @keyup.native.enter="search"
        v-model="searchVal"
        placeholder="输入召唤师昵称"
      />
      <n-button type="primary" ghost> 搜索</n-button>
    </n-input-group>
  </div>
</template>
<script setup lang="ts">
import useNavStore from "@/store/nav";
import { computed, onMounted, ref, Ref } from "vue";
import {
  useMouse,
  UseMouseEventExtractor,
  useParentElement,
  watchThrottled,
} from "@vueuse/core";
import { Search } from "@element-plus/icons-vue";
import router from "@/router";
import useLCUStore from "@/store/lcu";
import { storeToRefs } from "pinia";

const parentEl = useParentElement();
const navStore = useNavStore();
const defaultActiveIndex = computed(() => navStore.activeKey);
const handleSelect = (key: string) => {
  //navStore.navMenus.find((item) => item.key === key);
  router.push({ name: key });
};

const extractor: UseMouseEventExtractor = (event) =>
  event instanceof Touch ? null : [event.offsetX, event.offsetY];

const { x, y } = useMouse({ target: parentEl, type: extractor });

watchThrottled(
  [x, y],
  ([preX, preY], [currX, currY]) => {
    shiny.value?.style.setProperty("--x", currX + "");
    shiny.value?.style.setProperty("--y", currY + "");
  },
  { throttle: 100 },
);

const shiny = ref(null) as Ref<HTMLElement | null>;

onMounted(() => {
  shiny.value = document.querySelector(".shiny");
});

const searchVal = storeToRefs(useLCUStore()).search;

function search() {
  router.push({ name: "historyMatch", params: { search: searchVal.value } });
}
</script>
<style scoped>
.el-menu {
  user-select: none;
}

.shiny {
  --x: 0;
  --y: 0;
  overflow: hidden;
  position: relative;
}

.shiny::after {
  content: "";
  position: absolute;
  top: calc(var(--y, 0) * 1px - 2000px);
  left: calc(var(--x, 0) * 1px - 2000px);
  width: 4000px;
  height: 4000px;
  background: radial-gradient(rgb(235 137 78 / 50%), #ffffff00 50%);
  opacity: 0;
  pointer-events: none;
  transition:
    top,
    left,
    opacity 0.6s ease;
}

.shiny:hover::after {
  opacity: 0.4;
}

:deep(.el-input__inner) {
  color: white;
}

.search :deep(.el-input__wrapper) {
  background-color: transparent;
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
