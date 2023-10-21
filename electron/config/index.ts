import { ipcMain } from "electron";
import { SettingModel, settingModelDefault } from "./type";

class Setting {
  model: SettingModel;
  init: Promise<unknown>;
  _initCall?: Function;

  constructor() {
    this.model = settingModelDefault;
    let _this = this;
    this.init = new Promise((resolve, reject) => {
      _this._initCall = resolve;
    });
  }

  updateSetting(setting: SettingModel) {
    typeof this._initCall === "function" &&
      this._initCall() &&
      (this._initCall = undefined);
    this.model = setting;
  }
}

export const setting = new Setting();

export const setupSettingHandler = () => {
  ipcMain.on("updateSetting", (event, ...args) => {
    return setting.updateSetting(JSON.parse(args[0] as string) as SettingModel);
  });
};
