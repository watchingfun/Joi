import { getDB } from "./better-sqlite3";
import SettingDb from "./setting";
import TableVersionDb from "./tableVersion";
import { version } from "../../package.json";
import logger from "../lib/logger";

export interface DBConfig {
  initTableIfNotExists: Function;
  tableName: string;
}

export const initDb = () => {
  let db = getDB();

  let tableVersionDb = TableVersionDb(db);
  const ver = tableVersionDb.getTableVersion(tableVersionDb.tableName);
  if (ver === version) {
    return;
  }
  logger.info("%s !== %s 执行数据库初始化", ver, version);
  let settingDb = SettingDb(db);
  tableVersionDb.initTableIfNotExists();
  //每个表都手动记录版本号，为以后表结构变更更新提供信息
  const DBConfigs = [settingDb];
  DBConfigs.forEach((item: DBConfig) => {
    const result = tableVersionDb.initTableVersionRecord(item.tableName, 1);
    if (result.changes) {
      //如果插入版本号成功，说明该表没建立过
      item.initTableIfNotExists();
    } else {
      //这里取版本号，做对应策略表更新
    }
  });
};
