<script setup lang="tsx">
import ConnectStatus from "@/components/ConnectStatus.vue";
import useAppStore from "@/store/app";
import { computed, onMounted, onUnmounted, ref } from "vue";
import lcuApi from "@/api/lcuApi";
import useLCUStore, { ConnectStatusEnum } from "@/store/lcu";
import {
	ArrowClockwiseDashes20Filled,
	Games20Regular,
	SkipForwardTab24Regular,
	Toolbox20Regular
} from "@vicons/fluent";
import { Github } from "@vicons/fa";
import { debounce, random } from "lodash";
import useSettingStore from "@/store/setting";

const appStore = useAppStore();
const settingStore = useSettingStore();
let timer: ReturnType<typeof setInterval> | null;
const diffTime = ref();
const visible = ref(false);
const message = useMessage();

const killLCURenderHandler = () => {
	visible.value = false;
	if (lcuStore.connectStatus !== ConnectStatusEnum.connected) {
		message.error("未连接到英雄联盟客户端");
		return;
	}
	lcuApi.lcuKillRender().then(() => message.success("请求已发送！"));
};

const playAgain = () => {
	visible.value = false;
	if (lcuStore.connectStatus !== ConnectStatusEnum.connected) {
		message.error("未连接到英雄联盟客户端");
		return;
	}
	lcuApi.playAgain().then(() => message.success("请求已发送！"));
};

const startLoLClient = () => {
	lcuApi.startLoLClient().finally(() => message.success("请求已发送！"));
};

const gotoGithub = debounce(
	() => setTimeout(() => window.ipcRenderer.send("open-url", "https://github.com/watchingfun/Joi"), 1000),
	1000
);
const clickGithub = () => {
	const emojis = ["😘", "🥺", "😊", "😉", "😎", "😍", "😋", "😊", "😉", "🤗", "😚", "🫡", "😏", "🥳"];
	message.info("点个star吧", {
		icon: () => {
			return <div style="font-size:18px;line-height:1em">{emojis[random(emojis.length - 1)]}</div>;
		}
	});
	gotoGithub();
};

onMounted(() => {
	timer = setInterval(() => {
		diffTime.value = appStore.bootTime.fromNow(true);
	}, 1000);
});
onUnmounted(() => {
	if (timer) {
		clearInterval(timer);
		timer = null;
	}
});
const lcuStore = useLCUStore();

const footerStyle = computed(() => {
	if (lcuStore.connectStatus === ConnectStatusEnum.disconnect) {
		return {
			backgroundColor: "rgba(211,86,86,0.88)"
		};
	} else {
		return {};
	}
});
</script>

<template>
	<div style="height: 24px; flex-shrink: 0"></div>
	<div
		class="footer"
		:class="[lcuStore.connectStatus === ConnectStatusEnum.connecting ? 'loaderBar' : '']"
		:style="footerStyle">
		<div class="info flex flex-row flex-nowrap items-center justify-between h-full">
			<div class="ml-2 flex flex-row items-center">
				<div @click="clickGithub" title="Joi Repository" class="github-icon mr-2">
					<Github></Github>
				</div>
				<div class="pr-1">v{{ appStore.appVersion }}</div>
				<div>
					已运行时间:
					{{ diffTime }}
				</div>
			</div>

			<n-popover trigger="click" v-model:show="visible">
				<template #trigger>
					<div class="flex flex-row items-center cursor-pointer" style="gap: 2px">
						<n-icon>
							<Toolbox20Regular></Toolbox20Regular>
						</n-icon>
						<span class="shrink-0">工具箱</span>
					</div>
				</template>
				<div class="flex flex-col gap-2">
					<n-button-group vertical>
						<n-button @click="killLCURenderHandler">
							<template #icon>
								<n-icon>
									<ArrowClockwiseDashes20Filled></ArrowClockwiseDashes20Filled>
								</n-icon>
							</template>
							重启客户端界面
						</n-button>
						<n-button @click="playAgain">
							<template #icon>
								<n-icon>
									<SkipForwardTab24Regular></SkipForwardTab24Regular>
								</n-icon>
							</template>
							&emsp;跳过结算界面
						</n-button>
						<n-button @click="startLoLClient">
							<template #icon>
								<n-icon>
									<Games20Regular></Games20Regular>
								</n-icon>
							</template>
							&emsp;启动英雄联盟
						</n-button>
					</n-button-group>
				</div>
			</n-popover>

			<div class="flex flex-row items-center">
				<div>自动再来一局：</div>
				<n-switch v-model:value="settingStore.settingModel.autoPlayAgain" size="small"></n-switch>
			</div>
      <div class="flex flex-row items-center">
        <div>自动接收对局：</div>
        <n-switch v-model:value="settingStore.settingModel.autoAccept" size="small"></n-switch>
      </div>
			<div class="flex flex-row items-center">
				<ConnectStatus class="mr-1" :connect-status="lcuStore.connectStatus"></ConnectStatus>
			</div>
		</div>
	</div>
</template>

<style scoped>
.footer {
	font-size: 12px;
	position: absolute;
	bottom: 0;
	width: 100%;
	height: 24px;
	display: flex;
	flex-flow: column nowrap;
	background-color: rgba(255, 255, 255, 0.1);
	transition:
		opacity,
		background-color 0.4s ease;
}

.info {
	flex: 1;
	margin-bottom: 2px;
}

.kill-btn {
	cursor: pointer;
}

.kill-btn:hover {
	color: #fa9f49;
}

.github-icon {
	width: 12px;
	height: 12px;
	display: block;
	cursor: pointer;
}

.footer:after {
	content: "";
	width: 100%;
	height: 100%;
	position: absolute;
	background-image: linear-gradient(90deg, #ffffff00 0%, #d179457a 50%, #ffffff00 100%);
	animation: backgroundBar 1s linear infinite;
	opacity: 0;
	transition: opacity 1s ease;
	pointer-events: none;
}

.footer.loaderBar:after {
	opacity: 1;
}

@keyframes backgroundBar {
	0% {
		background-position-x: 0;
	}
	100% {
		background-position-x: 800px;
	}
}
</style>
