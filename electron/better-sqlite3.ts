import {app} from 'electron'
import path from 'node:path'
import Database from 'better-sqlite3'
import logger from "./lib/logger";

const bind_path = import.meta.env.VITE_BETTER_SQLITE3_BINDING
const TAG = '[better-sqlite3] '

export function getSqlite3(
    filename = path.join(app.getAppPath(), 'better-sqlite3.sqlite3')
): Database.Database {
    const db = new Database(filename, {
        // https://github.com/WiseLibs/better-sqlite3/blob/v8.5.2/lib/database.js#L36
        // https://github.com/WiseLibs/better-sqlite3/blob/v8.5.2/lib/database.js#L50
        nativeBinding: bind_path
    })
    logger.debug(TAG, bind_path, 'load')
    return db;
}
