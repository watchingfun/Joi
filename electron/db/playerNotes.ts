import Database from "better-sqlite3";
import { DBConfig } from "./index";
import { PageObj, PlayerNote, PlayerNotePageQuery } from "../types/type";
import { getDB } from "./better-sqlite3";
import { writeToCSV } from "../db/util";

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
	insertPlayerTagRelation: (puuid: string, tags?: string[]) => void;
	updatePlayerTagRelation: (puuid: string, tags?: string[]) => void;
	updateNote: (val: PlayerNote) => void;
	addNote: (value: PlayerNote) => void;
	deleteNote: (id: string) => void;
	getNote: (id: string) => PlayerNote;
	getAllTag: () => string[];
	exportToCSV: (filename: string) => void;
}

const useDB = (db: Database.Database): PlayerNotesDB => ({
	tableName: "player_notes",
	tableVersion: 1,
	initTableIfNotExists() {
		db.exec(`create table IF NOT EXISTS player_notes
(
    id           text not null
        constraint player_notes_pk
            primary key,
    summonerName text,
    createTime   TIMESTAMP default CURRENT_TIMESTAMP,
    updateTime   TIMESTAMP,
    gameIds      text,
    tags         text,
    remark       text
);

create index IF NOT EXISTS  player_notes_createTime_index
    on player_notes (createTime desc);

create table IF NOT EXISTS player_tags_relation
(
    puuid text not null,
    tag   text not null,
    constraint player_tags_relation_pk
        primary key (puuid, tag)
);

create index IF NOT EXISTS player_tags_relation_tag_index
    on player_tags_relation (tag);

`);
	},

	initData() {},

	queryPageNotes(pageQuery: PlayerNotePageQuery = defaultPageQuery) {
		let baseSql = " from player_notes note join player_tags_relation relation on note.id = relation.puuid ";
		let conditions: string[] = [];

		if (pageQuery.id) {
			conditions.push("note.id = :id");
		}
		if (pageQuery.summonerName) {
			conditions.push("note.summonerName like ('%' || :summonerName || '%')");
		}
		if (pageQuery.tag instanceof Array && pageQuery.tag.length > 0) {
			conditions.push("relation.tag in (:tag)");
		}

		if (conditions.length > 0) {
			baseSql = baseSql + " where " + conditions.join(" and ");
		}

		const count_stmt = db.prepare("SELECT count(distinct note.id) as count " + baseSql);
		const countResult = (count_stmt.get(pageQuery) as any).count;
		if (countResult === 0) {
			return emptyPageObj;
		}
		const stmt = db.prepare("SELECT distinct note.* " + baseSql + " order by note.createTime desc limit :start,:size");
		pageQuery.start = pageQuery.start * pageQuery.size;
		const list = stmt.all(pageQuery) as PlayerNote[];

		return { total: countResult, data: list } as PageObj<PlayerNote>;
	},

	updatePlayerTagRelation(puuid: string, tags?: string[]) {
		const deleteStmt = db.prepare("delete from player_tags_relation where puuid = :puuid");
		deleteStmt.run({ puuid });
		this.insertPlayerTagRelation(puuid, tags);
	},

	insertPlayerTagRelation(puuid: string, tags?: string[]) {
		const insertStmt = db.prepare("insert into player_tags_relation (puuid, tag) values (:puuid, :tag)");
		tags?.forEach((tag) => {
			insertStmt.run({ puuid, tag });
		});
	},

	updateNote(val: PlayerNote) {
		const update = db.prepare(
			"update player_notes set tags = :tags ,updateTime = current_timestamp, summonerName = :summonerName, gameIds = :gameIds, remark = :remark where id = :id"
		);
		const updateInfo = update.run({
			id: val.id,
			tags: JSON.stringify(val.tags),
			summonerName: val.summonerName,
			gameIds: JSON.stringify(val.gameIds),
			remark: val.remark
		});
		if (updateInfo.changes === 0) {
			return;
		}
		this.updatePlayerTagRelation(val.id, val.tags);
	},

	addNote(val: PlayerNote) {
		const insert = db.prepare(
			"insert into player_notes (id, summonerName, gameIds, tags, remark) values (:id, :summonerName, :gameIds, :tags, :remark)"
		);
		insert.run({
			id: val.id,
			tags: JSON.stringify(val.tags),
			summonerName: val.summonerName,
			gameIds: JSON.stringify(val.gameIds),
			remark: val.remark
		});
		this.insertPlayerTagRelation(val.id, val.tags);
	},

	deleteNote(puuid: string) {
		const delStmt = db.prepare("delete from player_notes where id = :id");
		delStmt.run({ id: puuid });
	},

	getNote(puuid: string) {
		const select = db.prepare("select * from player_notes where id = :id");
		return JSON.parse(select.get({ id: puuid }) as any) as PlayerNote;
	},

	getAllTag() {
		const selectStmt = db.prepare("select tag from player_tags_relation group by tag");
		return (selectStmt.all() as { tag: string }[]).map((i) => i.tag);
	},

	exportToCSV(filename: string) {
		const stmt = db.prepare("SELECT * FROM player_notes");
		return writeToCSV(filename, stmt);
	}
});

const playerNotesDB = useDB(getDB());
export default playerNotesDB;
