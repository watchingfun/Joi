import Database from "better-sqlite3";
import { DBConfig } from "./index";
import { PageObj, PlayerNote, PlayerNotePageQuery } from "../types/type";
import { getDB } from "./better-sqlite3";

const defaultPageQuery = {
	start: 0,
	size: 50
};

const emptyPageObj: PageObj<PlayerNote> = {
	total: 0,
	data: []
};

export interface PlayerNotesDB extends DBConfig {
	queryPageNotes: (pageQuery?: PlayerNotePageQuery) => PageObj<PlayerNote>;
	updateNote: (id: string, val: PlayerNote) => void;
	addNote: (value: PlayerNote) => void;
	deleteNote: (id: string) => void;
	getNote: (id: string) => PlayerNote;
}

const useDB = (db: Database.Database): PlayerNotesDB => ({
	tableName: "player_notes",
	tableVersion: 1,
	initTableIfNotExists() {
		db.exec(`CREATE TABLE IF NOT EXISTS player_notes
(
    id           text not null
        constraint player_notes_pk
            primary key,
    summonerName text,
    createTime   text,
    updateTime   text,
    value        text,
    tags         text generated always as (json_extract(value, '$.tags')) virtual
);

create index player_notes_dg_tmp_tags_index
    on player_notes (tags);

create index player_notes_summonerName_index
    on player_notes (summonerName);

`);
	},

	initData() {},

  queryPageNotes(pageQuery: PlayerNotePageQuery = defaultPageQuery) {
		let baseSql = " FROM runes";
		let conditions: string[] = [];

		if (conditions.length > 0) {
			baseSql = baseSql + " where " + conditions.join(" and ");
		}

		const count_stmt = db.prepare("SELECT count(*) as count " + baseSql);
		const countResult = (count_stmt.get(pageQuery) as any).count;
		if (countResult === 0) {
			return emptyPageObj;
		}
		const stmt = db.prepare("SELECT id, value " + baseSql + " order by id desc limit :start,:size");
		pageQuery.start = pageQuery.start * pageQuery.size;
		const list = stmt.all(pageQuery).map((i: any) => ({ id: i.id, value: JSON.parse(i.value) }));

		return { total: countResult, data: list } as PageObj<PlayerNote>;
	},

  updateNote(id: string, val: PlayerNote) {
		const update = db.prepare("update runes set value = :value where id = :id");
		update.run({ id, value: JSON.stringify(val) });
	},

  addNote(val: PlayerNote) {
		const insert = db.prepare("insert into runes (value) values (:value)");
		insert.run({ value: JSON.stringify(val) });
	},
  deleteNote(id: string) {
		const delStmt = db.prepare("delete from runes where id = :id");
		delStmt.run({ id: id });
	},
  getNote(id: string) {
		const select = db.prepare("select value from runes where id = :id");
		return JSON.parse((select.get({ id: id }) as any).value) as PlayerNote;
	}
});

const playerNotesDB = useDB(getDB());
export default playerNotesDB;
