<script setup lang="ts">
import { useRouter } from "vue-router";
import { Ref, ref } from "vue";
import { ArrowLeft } from "@element-plus/icons-vue";
import useSettingStore from "@/store/setting";
import { storeToRefs } from "pinia";
import { SettingModel } from "@@/config/type";

const router = useRouter();

const { settingModel } = storeToRefs(useSettingStore());

function goBack() {
  router.go(-1);
}
</script>

<template>
  <div class="p-4">
    <el-page-header @back="goBack" :icon="ArrowLeft">
      <template #title >
        <span> 返回 </span>
      </template>
      <template #content>
        <span class="font-600 mr-3 text-slate-50"> 设置页 </span>
      </template>
    </el-page-header>

    <div class="setting-group mt-4">
      <h1 class="text-xl">游戏</h1>
      <el-divider></el-divider>
      <div>
        <h2 class="text-sm">自动接收对局：</h2>
        <el-switch
          v-model="settingModel.autoAccept"
          style="padding: 20px 0"
        ></el-switch>
        <h2 class="text-sm">自动接收对局延时：</h2>
        <div class="flex flex-row flex-nowrap items-center">
          <div style="line-height: 20px; height: 26px">
            {{ settingModel.autoAcceptDelay }}ms
          </div>
          <el-slider :max="900"
            v-model="settingModel.autoAcceptDelay"
            style="padding: 20px 10px"
          ></el-slider>
        </div>
      </div>
    </div>

    <div class="setting-group mt-4">
      <h1 class="text-xl">常规</h1>
      <el-divider></el-divider>
      <div>
        <h2 class="text-sm">关闭主界面时：</h2>
        <el-radio-group v-model="settingModel.exitDirectly">
          <el-radio :label="true" size="large">直接退出</el-radio>
          <el-radio :label="false" size="large">最小化</el-radio>
        </el-radio-group>
        <el-checkbox v-model="settingModel.exitAsk" class="ml-[50px]"
          >每次询问</el-checkbox
        >
      </div>
    </div>
  </div>
</template>

<style scoped>
:deep(.el-divider--horizontal) {
  margin: 5px 0;
  padding-bottom: 10px;
}

.setting-group {
  padding: 12px;
}
</style>
