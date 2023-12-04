import { defineStore } from "pinia";
import { Ref, ref, WatchStopHandle } from "vue";
import { watchDebounced } from "@vueuse/core";
import { SettingModel, settingModelDefault } from "@@/types/type";

async function getSettingFromDB() {
	let res = (await window.ipcRenderer.invoke("getSetting")) as SettingModel;
	console.log("getSettingFromDB", res);
	return res;
}

const useSettingStore = defineStore("setting", () => {
	const settingModel = ref(settingModelDefault) as Ref<SettingModel>;

	let unWatch: WatchStopHandle | undefined;

	const initSettingModel = async (): Promise<SettingModel> => {
		unWatch && unWatch();
		settingModel.value = (await getSettingFromDB()) || settingModelDefault;
		unWatch = watchDebounced(
			() => settingModel,
			async (value, oldValue) => {
				console.log("settingModel updateSetting", value.value);
				window.ipcRenderer.send("updateSetting", JSON.stringify(value.value));
			},
			{ deep: true, debounce: 300 }
		);
		return settingModel.value;
	};

	return { settingModel, initSettingModel };
});
export default useSettingStore;
