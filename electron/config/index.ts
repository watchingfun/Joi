import { ipcMain } from "electron";
import { SettingModel, settingModelDefault } from "../types/type";
import settingDB from "../db/setting";

class Setting {
  model: SettingModel;

  constructor(setting: SettingModel) {
    this.model = setting;
  }

  setSetting(setting: SettingModel) {
    this.model = setting;
  }

  updateSetting(setting: SettingModel) {
    this.model = setting;
    settingDB.updateSetting("app", setting);
  }
}

export const setting = new Setting(settingModelDefault);

ipcMain.on("updateSetting", (event, ...args) => {
  console.log("updateSetting", args[0]);
  return setting.updateSetting(JSON.parse(args[0] as string) as SettingModel);
});
ipcMain.handle("getSetting", () => {
  setting.setSetting(settingDB.getSetting());
  return setting.model;
});
