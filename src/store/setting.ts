import { defineStore } from "pinia";
import { Ref, ref } from "vue";
import { watchDeep } from "@vueuse/core";
import { SettingModel, settingModelDefault } from "@@/config/type";

async function setCache(key: string, val: object | null | undefined) {
  return new Promise<void>((resolve, reject) => {
    try {
      if (!val) {
        localStorage.removeItem(key);
      } else {
        localStorage.setItem(key, JSON.stringify(val));
      }
      resolve();
    } catch (e) {
      reject(e);
    }
  });
}

function getCache<T>(key: string) {
  return new Promise<T | null>((resolve, reject) => {
    try {
      let val = localStorage.getItem(key);
      if (val) {
        try {
          resolve(JSON.parse(val) as T);
        } catch (e) {
          reject(e);
        }
      } else {
        resolve(null);
      }
    } catch (e) {
      reject(e);
    }
  });
}

const SETTING_KEY = "JOI-SETTING";

const useSettingStore = defineStore("setting", () => {
  const settingModel = ref(settingModelDefault) as Ref<SettingModel>;

  const initSettingModel = async (): Promise<SettingModel> => {
    settingModel.value = (await getCache(SETTING_KEY)) || settingModelDefault;
    return settingModel.value;
  };

  const getSetting = async () => {
    return settingModel.value || (await initSettingModel());
  };

  watchDeep(
    () => settingModel,
    async (value, oldValue) => {
      if (!oldValue) {
        return;
      }
      console.log("settingModel updateSetting", value.value);
      await setCache(SETTING_KEY, value.value);
      window.ipcRenderer.send("updateSetting", JSON.stringify(value.value));
    },
  );

  return { settingModel, initSettingModel, getSetting };
});
export default useSettingStore;
