<script setup lang="ts">
import Footer from "@/components/Footer.vue";
import Nav from "@/components/Nav.vue";
import HeaderBar from "@/components/HeaderBar.vue";
import { useRoute } from "vue-router";
import { TransitionSlide } from "@morev/vue-transitions";

const route = useRoute();
</script>

<template>
  <div class="flex flex-col h-screen">
    <HeaderBar></HeaderBar>
    <Nav :class="[route.name !== 'setting' ? '' : 'h-0 overflow-hidden']"></Nav>
    <router-view v-slot="{ Component }">
      <keep-alive>
        <transition-slide :offset="[-16, 0]" mode="out-in">
          <component :is="Component" />
        </transition-slide>
      </keep-alive>
    </router-view>
    <div style="height: 25px; flex-shrink: 0"></div>
    <Footer></Footer>
  </div>
</template>

<style scoped></style>
