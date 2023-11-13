import Database from "better-sqlite3";
import { DBConfig } from "./index";
import { SettingModel, settingModelDefault } from "../types/type";
import { cloneDeep } from "lodash";
import { getDB } from "./better-sqlite3";

export interface SettingDB extends DBConfig {
	getSetting: () => SettingModel;
	updateSetting: (key: string, val: any) => void;
}

const useDB = (db: Database.Database): SettingDB => ({
	tableName: "app_setting",
	tableVersion: 1,
	initTableIfNotExists() {
		db.exec(`create table IF NOT EXISTS app_setting
(
    key   TEXT    not null,
    value TEXT,
    CONSTRAINT app_setting_UN UNIQUE (key)
);

`);
	},

	initData() {
		const insert = db.prepare("INSERT INTO app_setting (key, value) VALUES (:key, :value)");
		insert.run({ key: "app", value: JSON.stringify(settingModelDefault) });
	},

	getSetting() {
		let setting = cloneDeep(settingModelDefault);
		const stmt = db.prepare("SELECT key, value FROM app_setting");
		const config = stmt.get() as any;
		let dbRecord = JSON.parse(config?.value || "{}");
		return { ...setting, ...dbRecord } as SettingModel;
	},

	updateSetting(key: string, val: Object) {
		const insert = db.prepare("insert into app_setting (key, value) values (:key, :value)");
		const deleteStmt = db.prepare("delete from app_setting where key = :key");
		deleteStmt.run({ key });
		insert.run({ key, value: JSON.stringify(val) });
	}
});

const settingDB = useDB(getDB());
export default settingDB;
