<script setup lang="ts"></script>

<template>
  <div>
    <!--    <el-button plain type="primary" @click="getCurrentSummoner">获取当前召唤师信息</el-button>-->
<!--    <el-button v-for="(key, i) of func" onclick="func[key]"> key </el-button>-->
  </div>
</template>

<style scoped>
.rotate {
  animation: rotation 2s infinite linear;
}

@keyframes rotation {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(365deg);
  }
}
</style>
