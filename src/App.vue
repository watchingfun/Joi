<script setup lang="ts">
import HeaderBar from "@/components/HeaderBar.vue";
import Nav from "@/components/Nav.vue";
import Footer from "@/components/Footer.vue";
</script>

<template>
  <div class="flex flex-col h-screen">
    <HeaderBar></HeaderBar>
    <Nav></Nav>
    <router-view v-slot="{ Component }">
      <keep-alive>
        <component :is="Component" />
      </keep-alive>
    </router-view>
    <div style="height: 25px; flex-shrink: 0"></div>
    <Footer></Footer>
  </div>
</template>

<style></style>
