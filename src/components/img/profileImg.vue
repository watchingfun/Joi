<template>
  <el-avatar
    :width="props.width"
    :src="
      'http://ddragon.leagueoflegends.com/cdn/13.14.1/img/profileicon/' +
      profileIconId +
      '.png'
    "
  />
</template>
<script setup>
//`https://wegame.gtimg.com/g.26-r.c2d3c/helper/lol/assis/images/resources/usericon/${profileIconId}.png`
// props
const props = defineProps(["width", "profileIconId"]);
</script>
