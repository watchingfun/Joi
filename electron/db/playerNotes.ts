import Database from "better-sqlite3";
import { DBConfig } from "./index";
import { PageObj, PlayerNote, PlayerNotePageQuery } from "../types/type";
import { getDB } from "./better-sqlite3";
import { parseXLSX, writeToXLSX } from "../db/util";
import logger from "../lib/logger";
import { dialog } from "electron";
import dayjs from "dayjs";

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
	deletePlayerTagRelation: (puuid: string) => void;
	updatePlayerTagRelation: (puuid: string, tags?: string[]) => void;
	updateNote: (val: PlayerNote) => void;
	addNote: (value: PlayerNote) => number;
	deleteNote: (id: string) => void;
	getNote: (id: string) => PlayerNote;
	getAllTag: () => string[];
	exportNotes(filename: string): Promise<any>;
	importNotes(): Promise<number>;
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
		let baseSql = " from player_notes note left join player_tags_relation relation on note.id = relation.puuid ";
		let conditions: string[] = [];

		if (pageQuery.id) {
			conditions.push("note.id = :id");
		}
		if (pageQuery.summonerName) {
			conditions.push("note.summonerName like ('%' || :summonerName || '%')");
		}
		if (pageQuery.tag instanceof Array && pageQuery.tag.length > 0) {
			conditions.push("relation.tag in (SELECT value FROM json_each(:tag))");
			pageQuery.tag = JSON.stringify(pageQuery.tag);
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
		pageQuery.start = (pageQuery.start - 1) * pageQuery.size;
		const list = stmt.all(pageQuery) as PlayerNote[];
		try {
			list.forEach((item) => (item.tags = JSON.parse(item.tags as unknown as string)));
		} catch (e) {
			logger.error(e);
		}
		return { total: countResult, data: list } as PageObj<PlayerNote>;
	},

	deletePlayerTagRelation(puuid: string) {
		const deleteStmt = db.prepare("delete from player_tags_relation where puuid = :puuid");
		deleteStmt.run({ puuid });
	},

	updatePlayerTagRelation(puuid: string, tags?: string[]) {
		this.deletePlayerTagRelation(puuid);
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
			tags: val.tags ? JSON.stringify(val.tags) : null,
			summonerName: val.summonerName,
			gameIds: val.gameIds ? JSON.stringify(val.gameIds) : null,
			remark: val.remark
		});
		if (updateInfo.changes === 0) {
			return;
		}
		this.updatePlayerTagRelation(val.id, val.tags);
	},

	addNote(val: PlayerNote) {
		const insert = db.prepare(
			"insert into player_notes (id, summonerName, gameIds, tags, remark, createTime, updateTime) values (:id, :summonerName, :gameIds, :tags, :remark, :createTime, :updateTime)"
		);
		const info = insert.run({
			id: val.id,
			tags: val.tags ? JSON.stringify(val.tags) : null,
			summonerName: val.summonerName,
			gameIds: val.gameIds ? JSON.stringify(val.gameIds) : null,
			remark: val.remark,
			createTime: val.createTime ? val.createTime : dayjs().format("YYYY-MM-DD HH:mm:ss"),
			updateTime: val.updateTime
		});
		if (info.changes === 0) {
			return 0;
		}
		this.insertPlayerTagRelation(val.id, val.tags);
		return info.changes;
	},

	deleteNote(puuid: string) {
		const delStmt = db.prepare("delete from player_notes where id = :id");
		delStmt.run({ id: puuid });
    this.deletePlayerTagRelation(puuid);
	},

	getNote(puuid: string) {
		const select = db.prepare("select * from player_notes where id = :id");
		return JSON.parse(select.get({ id: puuid }) as any) as PlayerNote;
	},

	getAllTag() {
		const selectStmt = db.prepare("select tag from player_tags_relation group by tag");
		return (selectStmt.all() as { tag: string }[]).map((i) => i.tag);
	},

	exportNotes(filename: string) {
		const stmt = db.prepare("SELECT * FROM player_notes");
		const sheetOptions = {
			"!cols": [{ wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 100 }]
		};
		return writeToXLSX(filename, stmt, { sheetOptions });
	},

	async importNotes() {
		const { dialog } = require("electron");
		return await dialog
			.showOpenDialog({
				title: "选择Excel文件",
				properties: ["openFile"],
				filters: [{ name: "xlsx", extensions: ["xlsx"] }]
			})
			.then((res) => {
				if (!res.canceled) {
					const filePath = res.filePaths[0];
					console.log(filePath);
					const dataList: string[][] = parseXLSX(filePath);
					const colName = ["id", "summonerName", "gameIds", "tags", "remark", "createTime", "updateTime"];
					const fieldsMap = {} as Record<string, number>;
					dataList[0].forEach((str, index) => {
						for (let col of colName) {
							if (str === col) {
								fieldsMap[col] = index;
								break;
							}
						}
					});
					if (Object.keys(fieldsMap).length !== colName.length) {
						throw new Error("字段缺失, 请以导出文件为例填写");
					}
					dataList.shift();
					const playNotes = dataList.map((val, index) => {
						const record = {} as Record<string, string>;
						Object.keys(fieldsMap).forEach((key) => {
							record[key] = val[fieldsMap[key]];
						});
						if (record["tags"]) {
							try {
								record["tags"] = JSON.parse(record["tags"]);
							} catch (e) {
								logger.error((e as Error).message);
							}
						}
						return record as unknown as PlayerNote;
					});

					const totalInsert = playNotes.reduce((p, c) => {
						let i = 0;
						try {
							i = this.addNote(c);
						} catch (e) {
							logger.error((e as Error).message);
						}
						return i + p;
					}, 0);
					logger.info("导入行数：" + totalInsert);
					return totalInsert;
				}
				return 0;
			});
	}
});

const playerNotesDB = useDB(getDB());
export default playerNotesDB;
