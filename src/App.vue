<script setup lang="ts">
import "overlayscrollbars/overlayscrollbars.css";
import { darkThemeOverrides } from "@/theme";
import { darkTheme, zhCN } from "naive-ui";
</script>

<template>
  <n-config-provider
    :inline-theme-disabled="true"
    :locale="zhCN"
    :theme="darkTheme"
    :theme-overrides="darkThemeOverrides"
  >
    <n-global-style />
    <n-message-provider>
      <router-view v-slot="{ Component }">
        <keep-alive>
          <component :is="Component" />
        </keep-alive>
      </router-view>
    </n-message-provider>
  </n-config-provider>
</template>

<style></style>
