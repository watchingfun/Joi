<script setup lang="ts">
import { useRouter } from "vue-router";
import useSettingStore from "@/store/setting";
import { storeToRefs } from "pinia";

const router = useRouter();

const { settingModel } = storeToRefs(useSettingStore());

function goBack() {
  router.go(-1);
}
</script>

<template>
  <div class="p-4">
    <n-page-header @back="goBack">
      <template #title>
        <n-divider vertical />
        <span class="font-600 mr-3 text-slate-50"> 设置 </span>
      </template>
    </n-page-header>

    <div class="setting-group mt-4">
      <h1 class="text-xl">游戏</h1>
      <n-divider></n-divider>
      <div>
        <h2 class="text-sm">自动接收对局：</h2>
        <n-switch
          v-model="settingModel.autoAccept"
          style="padding: 20px 0"
        ></n-switch>
        <h2 class="text-sm">自动接收对局延时：</h2>
        <div class="flex flex-row flex-nowrap items-center">
          <div style="line-height: 20px; height: 26px">
            {{ settingModel.autoAcceptDelay }}ms
          </div>
          <n-slider
            :max="9000"
            :format-tooltip="(s: string) => `${s}ms`"
            v-model="settingModel.autoAcceptDelay"
            style="padding: 20px 10px"
          ></n-slider>
        </div>
      </div>
    </div>

    <div class="setting-group mt-4">
      <h1 class="text-xl">常规</h1>
      <n-divider></n-divider>
      <div>
        <h2 class="text-sm">关闭主界面时：</h2>
        <n-radio-group v-model:value="settingModel.exitDirectly">
          <n-radio size="large" :value="true">直接退出</n-radio>
          <n-radio size="large" :value="false">最小化</n-radio>
        </n-radio-group>
        <n-checkbox v-model:checked="settingModel.exitAsk" class="ml-[50px]"
          >每次询问
        </n-checkbox>
      </div>
    </div>
  </div>
</template>

<style scoped>
:deep(.n-divider) {
  margin: 5px 0;
  padding-bottom: 10px;
}

.setting-group {
  padding: 12px;
}
</style>
