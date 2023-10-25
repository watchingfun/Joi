import { app } from "electron";
import path from "node:path";
import fs from "node:fs";
import Database from "better-sqlite3";
import logger from "../lib/logger";
//@ts-ignore
const bind_path = import.meta.env.VITE_BETTER_SQLITE3_BINDING;
const TAG = "[better-sqlite3] ";

let db: Database.Database | undefined;
process.on("exit", () => db?.close());

export function getDB() {
  if (db) {
    return db;
  }
  return getSqlite3();
}

function getSqlite3(
  filename = path.join(app.getPath("userData"), "better-sqlite3.sqlite3"),
): Database.Database {
  db = new Database(filename, {
    // https://github.com/WiseLibs/better-sqlite3/blob/v8.5.2/lib/database.js#L36
    // https://github.com/WiseLibs/better-sqlite3/blob/v8.5.2/lib/database.js#L50
    nativeBinding: bind_path,
    verbose: process.env.production
      ? () => {}
      : (message?: unknown, ...additionalArgs: unknown[]) =>
          logger.debug("sql", message, additionalArgs),
  });
  db.pragma("journal_mode = WAL");
  logger.debug(TAG, bind_path, "load");
  return db;
}

function* toRows(stmt) {
  yield stmt.columns().map((column) => column.name);
  yield* stmt.raw().iterate();
}

function writeToCSV(filename, stmt) {
  return new Promise((resolve, reject) => {
    const stream = fs.createWriteStream(filename);
    for (const row of toRows(stmt)) {
      stream.write(row.join(",") + "\n");
    }
    stream.on("error", reject);
    stream.end(resolve);
  });
}
