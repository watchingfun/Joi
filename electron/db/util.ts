import {Statement} from "better-sqlite3";
import fs from "node:fs";

function* toRows(stmt: Statement) {
  yield stmt.columns().map((column) => column.name);
  yield* stmt.raw().iterate();
}

export function writeToCSV(filename: string, stmt: Statement) {
  return new Promise((resolve, reject) => {
    const stream = fs.createWriteStream(filename);
    for (const row of toRows(stmt)) {
      stream.write((row as string[]).join(",") + "\n");
    }
    stream.on("error", reject);
    stream.end(resolve);
  });
}
