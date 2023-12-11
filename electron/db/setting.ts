import Database from "better-sqlite3";
import { DBConfig } from "./index";
import { settingModelDefault } from "../types/type";
import { getDB } from "./better-sqlite3";

export interface SettingDB extends DBConfig {
	getSetting: <T>(key?: string) => T | undefined;
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

	getSetting<T>(key: string = "app") {
		const stmt = db.prepare("SELECT key, value FROM app_setting where key = :key");
		const config = stmt.get({ key: key }) as any;
		if (config?.value) {
			return JSON.parse(config.value) as T;
		} else {
			return undefined;
		}
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
