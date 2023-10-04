<template>
  <el-menu
      :default-active="activeIndex"
      mode="horizontal"
      background-color="transparent"
      text-color="#fff"
      active-text-color="#ffc276"
      @select="handleSelect"
      style="height: 50px"
  >
    <el-menu-item index="1">主页</el-menu-item>
    <el-menu-item index="2">对局</el-menu-item>
    <el-menu-item index="3">战绩查询</el-menu-item>
  </el-menu>
</template>
<script setup lang="ts">
import { ref } from 'vue'

const activeIndex = ref('1')
const handleSelect = (key: string, keyPath: string[]) => {
  console.log(key, keyPath)
}
</script>
<style scoped>
.el-menu{
  user-select:none;
}
</style>
