import Database from "better-sqlite3";
import { DBConfig, PageQuery } from "./index";
import {CustomRune, PageObj, RunesDBObj, RunesPageQuery} from "../config/type";
import { getDB } from "./better-sqlite3";

const defaultPageQuery = {
  start: 0,
  size: 50,
};


const emptyPageObj: PageObj<RunesDBObj> = {
  total: 0,
  data: [],
};

export interface RunesDB extends DBConfig {
  queryPageRunes: (pageQuery?: PageQuery) => PageObj<RunesDBObj>;
  updateRune: (id: number, val: CustomRune) => void;
  addRune: (value: CustomRune) => void;
  deleteRune: (id: number) => void;
  getRune: (id: number) => CustomRune;
}

const useDB = (db: Database.Database): RunesDB => ({
  tableName: "runes",
  tableVersion: 1,
  initTableIfNotExists() {
    db.exec(`create table IF NOT EXISTS runes
(
    id integer not null
        constraint test_pk
            primary key autoincrement,
    value TEXT
);

`);
  },

  initData() {},

  queryPageRunes(pageQuery: RunesPageQuery = defaultPageQuery) {
    let baseSql = " FROM runes";
    let conditions: string[] = [];
    if (pageQuery.primaryPageId) {
      conditions.push("runes.value ->> 'primary_page_id' = :primaryPageId");
    }
    if (pageQuery.name) {
      conditions.push("runes.value ->> 'name' like ('%' || :name || '%')");
    }
    if (pageQuery.position && pageQuery.position.length > 0) {
      conditions.push(
        "exists(select * from json_each(runes.value->>'position') where json_each.value in(:position))",
      );
    }
    if (pageQuery.mode && pageQuery.mode.length > 0) {
      conditions.push(
        "exists(select * from json_each(runes.value->>'mode') where json_each.value in(:mode))",
      );
    }
    if (pageQuery.role && pageQuery.role.length > 0) {
      conditions.push(
        "exists(select * from json_each(runes.value->>'role') where json_each.value in(:role))",
      );
    }
    if (conditions.length > 0) {
      baseSql = baseSql + " where " + conditions.join(" and ");
    }

    const count_stmt = db.prepare("SELECT count(*) as count " + baseSql);
    const countResult = (count_stmt.get(pageQuery) as any).count;
    if (countResult === 0) {
      return emptyPageObj;
    }
    const stmt = db.prepare(
      "SELECT id, value " + baseSql + " limit :start,:size",
    );
    const list = stmt
      .all(pageQuery)
      .map((i: any) => ({ id: i.id, value: JSON.parse(i.value) }));

    return { total: countResult, data: list } as PageObj<RunesDBObj>;
  },

  updateRune(id: number, val: CustomRune) {
    const update = db.prepare("update runes set value = :value where id = :id");
    update.run({ id, value: JSON.stringify(val) });
  },

  addRune(val: CustomRune) {
    const insert = db.prepare("insert into runes (value) values (:value)");
    insert.run({ value: JSON.stringify(val) });
  },
  deleteRune(id: number) {
    const delStmt = db.prepare("delete from runes where id = :id");
    delStmt.run({ id: id });
  },
  getRune(id: number) {
    const select = db.prepare("select value from runes where id = :id");
    return JSON.parse((select.get({ id: id }) as any).value) as CustomRune;
  },
});

const runesDB = useDB(getDB());
export default runesDB;
