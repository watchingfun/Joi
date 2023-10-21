<template>
  <el-avatar
    :src="`https://wegame.gtimg.com/g.26-r.c2d3c/helper/lol/assis/images/resources/usericon/${profileIconId}.png`"
  >
    <img :src="defaultImg" />
  </el-avatar>
</template>
<script setup lang="ts">
// props
defineProps({
  profileIconId: { type: Number, required: true },
});
const defaultImg = "./img/defaultAvatar.png";
</script>
