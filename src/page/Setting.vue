<script setup lang="ts">
import { useRouter } from "vue-router";
import useSettingStore from "@/store/setting";
import { storeToRefs } from "pinia";
import { checkUpdate } from "@/utils/updateCheck";

const router = useRouter();

const { settingModel } = storeToRefs(useSettingStore());

const appVersion = __APP_VERSION__;
const fetching = ref(false);

function goBack() {
	router.go(-1);
}

function handleCheckUpdate() {
	fetching.value = true;
	checkUpdate().finally(() => (fetching.value = false));
}
</script>

<template>
	<div class="p-4 flex-1 flex flex-col h-0">
		<n-page-header @back="goBack">
			<template #title>
				<n-divider vertical />
				<span class="font-600 mr-3 text-slate-50"> 设置 </span>
			</template>
		</n-page-header>

		<n-scrollbar class="flex-1 flex flex-col overflow-auto">
			<div>
				<div class="setting-group mt-4">
					<h1 class="text-xl">游戏</h1>
					<n-divider></n-divider>
					<div>
						<h2 class="text-sm pt-2 font-bold">自动接收对局：</h2>
						<div class="py-[10px]">
							<n-switch v-model:value="settingModel.autoAccept"></n-switch>
						</div>

						<h2 class="text-sm pt-2 font-bold">自动接收对局延时：</h2>
						<div class="flex flex-row flex-nowrap items-center py-[10px]">
							<div style="line-height: 20px; height: 26px; padding-right: 10px">
								{{ settingModel.autoAcceptDelay }}ms
							</div>
							<n-slider
								:max="9000"
								:format-tooltip="(s: string) => `${s}ms`"
								v-model:value="settingModel.autoAcceptDelay"></n-slider>
						</div>

						<h2 class="text-sm pt-2 font-bold">自动应用符文：</h2>
						<div class="py-[10px]">
							<n-switch v-model:value="settingModel.autoConfigRune"></n-switch>
						</div>

						<h2 class="text-sm pt-2 font-bold">自动应用符文来源：</h2>
						<div class="py-[10px]">
							<n-radio-group v-model:value="settingModel.autoConfigRuneOPGGPriority">
								<n-radio size="large" :value="true">OPGG</n-radio>
								<n-radio size="large" :value="false">自定义</n-radio>
							</n-radio-group>
						</div>

						<h2 class="text-sm pt-2 font-bold">自动发送当前队伍评分：</h2>
						<div class="py-[10px]">
							<n-switch v-model:value="settingModel.autoSendMyTeamAnalysis"></n-switch>
						</div>
					</div>
				</div>

				<div class="setting-group mt-4">
					<h1 class="text-xl">常规</h1>
					<n-divider></n-divider>
					<div>
						<h2 class="text-sm pt-2 font-bold">关闭主界面时：</h2>
						<div class="py-[10px]">
							<n-radio-group v-model:value="settingModel.exitDirectly">
								<n-radio size="large" :value="true">直接退出</n-radio>
								<n-radio size="large" :value="false">最小化</n-radio>
							</n-radio-group>
							<n-checkbox v-model:checked="settingModel.exitAsk" class="ml-[50px]">每次询问</n-checkbox>
						</div>
					</div>
				</div>

				<div class="setting-group mt-4">
					<div class="flex flex-row gap-5 items-center">
						<div><b>当前版本：</b>{{ appVersion }}</div>
						<n-button @click="handleCheckUpdate" :loading="fetching"> 检查更新</n-button>
					</div>
				</div>
			</div>
		</n-scrollbar>
	</div>
</template>

<style scoped>
:deep(.n-divider) {
	margin: 5px 0;
	padding-bottom: 10px;
}

:deep(.n-divider:not(.n-divider--vertical)) {
	margin-top: 10px;
	margin-bottom: unset;
}

.setting-group {
	padding: 12px;
}
</style>
