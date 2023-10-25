import Database from "better-sqlite3";
import {DBConfig} from "./index";

export interface SettingDB extends DBConfig{

}

export default (db: Database.Database) => ({
    tableName: 'app_setting',
    initTableIfNotExists(){
        db.exec(`create table IF NOT EXISTS app_setting
(
    id    integer not null
        constraint app_setting_pk
            primary key autoincrement,
    key   TEXT    not null,
    value TEXT
);

`)
    },

});
