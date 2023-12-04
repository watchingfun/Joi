<script setup lang="tsx">
import ConnectStatus from "@/components/ConnectStatus.vue";
import useAppStore from "@/store/app";
import { computed, onMounted, onUnmounted, ref } from "vue";
import lcuApi from "@/api/lcuApi";
import useLCUStore, { ConnectStatusEnum } from "@/store/lcu";
import { ArrowClockwiseDashes20Filled } from "@vicons/fluent";
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
	lcuApi.lcuKillRender().then(() => message.success("kill请求已发送！"));
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
			<n-popconfirm @positive-click="killLCURenderHandler" width="340">
				<template #trigger>
					<div class="flex flex-row items-center cursor-pointer" style="gap: 2px">
						<div style="font-size: 12px; width: 1em; height: 1em; margin-top: 1px">
							<ArrowClockwiseDashes20Filled></ArrowClockwiseDashes20Filled>
						</div>
						重启客户端界面
					</div>
				</template>
				<p>
					此操作通过杀掉LeagueClientUxRender.exe进程来让客户端重启界面进程，可以解决各种黑屏，显示不全等问题。 确认执行?
				</p>
			</n-popconfirm>
			<div class="flex flex-row items-center">
				<div>自动再来一局：</div>
				<n-switch v-model:value="settingStore.settingModel.autoPlayAgain" size="small">自动再来一局</n-switch>
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
