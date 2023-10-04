<script setup lang="ts">
import { Close, Minus, Setting } from "@element-plus/icons-vue";
import Logo from "@/components/Logo.vue";

const minimizeHandler = () => {
  window.ipcRenderer.invoke('titleBarControl:minimize')
};
const settingHandler = () => {
  window.ipcRenderer.invoke('titleBarControl:setting')
};
const closeHandler = () => {
  window.ipcRenderer.invoke('titleBarControl:close')
};
</script>

<template>
  <div class="title-bar relative">
    <div class="center-title">Joi</div>
    <div class="flex flex-row flex-nowrap justify-between items-center">
      <div class="pl-[10px]">
        <Logo class="w-5 h-5"></Logo>
      </div>
      <div class="flex flex-row controls">
        <el-icon id="minimize" @click="minimizeHandler">
          <Minus />
        </el-icon>
        <el-icon id="setting" @click="settingHandler">
          <Setting />
        </el-icon>
        <el-icon id="close" @click="closeHandler">
          <Close />
        </el-icon>
      </div>
    </div>
  </div>
</template>

<style scoped>
.controls :deep(.el-icon) {
  width: unset;
  height: unset;
  padding: 10px;
}

.center-title {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  font-size: 25px;
}

#minimize:hover {
  background-color: rgba(255, 255, 255, 0.45);
}

#setting:hover {
  background-color: rgba(245, 92, 45, 0.45);
}

#close:hover {
  background-color: rgba(255, 0, 0, 0.45);
}

.controls > .el-icon {
  -webkit-app-region: no-drag;
  transition: 0.2s ease-in-out background-color;
}
</style>
