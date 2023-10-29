<script setup lang="ts">
import { runesMap } from "@/common/runes";
import RuneAdd from "@/components/RuneEdit.vue";
import { CustomRune } from "@@/config/type";
import runesApi from "@/api/runesApi";

const tabs = [
  {
    name: "全部",
    config: { key: "all" },
  },
  {
    name: "精密",
    config: runesMap.get("Precision"),
  },
  {
    name: "主宰",
    config: runesMap.get("Domination"),
  },
  {
    name: "巫术",
    config: runesMap.get("Sorcery"),
  },
  {
    name: "坚决",
    config: runesMap.get("Resolve"),
  },
  {
    name: "启迪",
    config: runesMap.get("Inspiration"),
  },
];
const activeKey = ref("全部");
const showAddRune = ref(false);

const message = useMessage();

function addRune(runeConfig: CustomRune) {
  runesApi.addCustomRunes(runeConfig).then(() => message.success("保存成功"));
}
</script>

<template>
  <div class="flex flex-col items-center">
    <div
      class="flex flex-row flex-nowrap justify-evenly items-center gap-[10px]"
    >
      <n-tabs
        style="width: 400px; padding: 20px 0"
        v-model:value="activeKey"
        justify-content="space-around"
        animated
        size="small"
        :tabs-padding="36"
      >
        <n-tab v-for="tab in tabs" :name="tab.name" :key="tab.name">
          <span :class="tab.config?.key">{{ tab.name }}</span>
        </n-tab>
      </n-tabs>
      <n-input style="width: 150px" placeholder="搜索"></n-input>
      <n-button @click="() => (showAddRune = true)">新增</n-button>
    </div>
    <div></div>
    <RuneAdd v-model:show="showAddRune" @save="addRune"></RuneAdd>
  </div>
</template>

<style scoped>
:deep(.n-tabs-tab--active):has(.c_8000) {
  text-shadow: 0px 0px 9px #ffca68;
}

:deep(.n-tabs-tab--active):has(.c_8100) {
  text-shadow: 0px 0px 9px #ffca68;
}
</style>
