<script setup lang="ts">
import {
  Dismiss16Regular,
  Settings16Regular,
  Subtract16Regular,
} from "@vicons/fluent";
import Logo from "@/components/Logo.vue";
import router from "@/router";
import useSettingStore from "@/store/setting";

const showModal = ref(false);

const minimizeHandler = () => {
  window.ipcRenderer.invoke("titleBarControl:minimize");
};
const settingHandler = () => {
  router.push({ name: "setting" });
};
const closeHandler = () => {
  showModal.value = true;
};
const settingStore = useSettingStore();

const unAsk = computed({
  get() {
    return !settingStore.settingModel.exitAsk;
  },
  set(newValue: boolean) {
    settingStore.settingModel.exitAsk = !newValue;
  },
});
const handleCloseConfirm = async () => {
  showModal.value = false;
  initWait(); //确认弹窗关闭后再关闭窗口，避免恢复窗口第一帧图像展示弹窗
  await leaveWait.value.wait;
  if (settingStore.settingModel.exitDirectly) {
    window.ipcRenderer.invoke("titleBarControl:close");
  } else {
    window.ipcRenderer.invoke("titleBarControl:close", "hide");
  }
};

const leaveWait = ref<{ wait: Promise<void>; done: Function }>({
  wait: Promise.resolve(),
  done: () => {},
});

function initWait() {
  leaveWait.value.wait = new Promise(
    (resolve) => (leaveWait.value.done = resolve),
  );
}

const afterLeave = () => {
  leaveWait.value.done();
};
</script>

<template>
  <div class="title-bar relative">
    <div class="center-title rise">Joi</div>
    <div class="flex flex-row flex-nowrap justify-between items-center bar">
      <div class="pl-[10px]">
        <Logo class="w-5 h-5"></Logo>
      </div>
      <div class="flex flex-row controls">
        <div id="minimize" @click="minimizeHandler">
          <Subtract16Regular />
        </div>
        <div id="setting" @click="settingHandler">
          <Settings16Regular />
        </div>
        <div id="close" @click="closeHandler">
          <Dismiss16Regular />
        </div>
      </div>
    </div>
  </div>
  <Teleport to="body">
    <n-modal
      v-model:show="showModal"
      transform-origin="center"
      :auto-focus="false"
      display-directive="show"
      :on-after-leave="afterLeave"
    >
      <n-card
        style="width: 400px"
        class="closeAskDialog"
        title="关闭提示"
        aria-modal="true"
      >
        <div>
          <n-radio-group v-model:value="settingStore.settingModel.exitDirectly">
            <n-space>
              <n-radio :value="false"> 最小化到系统托盘</n-radio>
              <n-radio :value="true"> 直接退出</n-radio>
            </n-space>
          </n-radio-group>
        </div>
        <template #action>
          <div class="flex flex-row justify-between items-center">
            <n-checkbox v-model:checked="unAsk">不再提示</n-checkbox>
            <n-space>
              <n-button @click="() => (showModal = false)">取消</n-button>
              <n-button type="primary" @click="handleCloseConfirm"
                >确认
              </n-button>
            </n-space>
          </div>
        </template>
      </n-card>
    </n-modal>
  </Teleport>
</template>

<style scoped>
.controls div {
  font-size: 16px;
  padding: 10px;
}

.controls svg {
  width: 1em;
  height: 1em;
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

.controls > div {
  -webkit-app-region: no-drag;
  transition: 0.2s ease-in-out background-color;
}

/* latin */
@font-face {
  font-family: "Audiowide";
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url("/fonts/Audiowide.woff2") format("woff2");
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA,
    U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191,
    U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
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
<style>
.closeAskDialog .n-card__action {
  padding: 10px 20px;
}
</style>
