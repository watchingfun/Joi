<script setup lang="ts">
import HeaderBar from "@/components/HeaderBar.vue";
import Nav from "@/components/Nav.vue";
import Footer from "@/components/Footer.vue";
</script>

<template>
  <HeaderBar></HeaderBar>
  <Nav></Nav>
  <router-view></router-view>
  <Footer></Footer>
</template>

<style></style>
