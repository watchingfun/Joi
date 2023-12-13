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

	loadSetting() {
		const dbSetting = settingDB.getSetting<SettingModel>();
		if (dbSetting) {
			this.model = { ...this.model, ...dbSetting };
		}
	}
}

//todo db 到这里都要重构成 lazy singleton
export const setting = new Setting(settingModelDefault);

ipcMain.on("updateSetting", (event, ...args) => {
	console.log("updateSetting", args[0]);
	return setting.updateSetting(JSON.parse(args[0] as string) as SettingModel);
});

//前台页面加载完成后获取设置
ipcMain.handle("getSetting", () => {
	return setting.model;
});
