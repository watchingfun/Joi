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
    <div class="center-title rise">Joi</div>
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
  font-family: "Audiowide";
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

/* latin */
@font-face {
  font-family: 'Audiowide';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url('/fonts/Audiowide.woff2') format('woff2');
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}

.rise {
  opacity: 0;
  --hs: 225, 100%;
  --shadow: hsl(var(--hs), 15%);
  filter: drop-shadow(0.015em 0.015em 0.025em var(--shadow));
  animation: rise 2s ease-in-out 0.5s forwards;
}

@keyframes rise {
  to {
    opacity: 90%;
  }
}
</style>
