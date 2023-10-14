<template>
  <el-menu
    router
    :default-active="defaultActiveIndex"
    mode="horizontal"
    background-color="transparent"
    text-color="#fff"
    active-text-color="#ffc276"
    @select="handleSelect"
    style="height: 50px"
  >
    <el-menu-item :index="menu.key" v-for="menu in navStore.navMenus"
      >{{ menu.name }}
    </el-menu-item>
  </el-menu>
</template>
<script setup lang="ts">
import useNavStore from "@/store/nav";
import {computed, toRef, watch} from "vue";

const navStore = useNavStore();
const defaultActiveIndex = computed(()=>navStore.activeKey);
const handleSelect = (key: string, keyPath: string[]) => {
  navStore.navMenus.find((item) => item.key === key);
};
</script>
<style scoped>
.el-menu {
  user-select: none;
}
</style>
