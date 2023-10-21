<script setup lang="ts">
import "overlayscrollbars/overlayscrollbars.css";
</script>

<template>
  <router-view v-slot="{ Component }">
    <keep-alive>
      <component :is="Component" />
    </keep-alive>
  </router-view>
</template>

<style></style>
