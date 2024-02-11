import { Statement } from "better-sqlite3";
import fs from "node:fs";
import xlsx, {BuildOptions, WorkSheet, WorkSheetOptions} from "node-xlsx";

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

export function writeToXLSX(filename: string, stmt: Statement, buildOptions?: BuildOptions) {
	return new Promise((resolve, reject) => {
		const dataList: string[][] = [];
		for (const row of toRows(stmt)) {
			dataList.push(row as string[]);
		}
		const buffer = xlsx.build([{ name: "notes", data: dataList }] as WorkSheet<string>[], buildOptions);
		try {
			fs.writeFileSync(filename, buffer);
			resolve(void 0);
		} catch (e) {
			reject(e);
		}
	});
}

export function parseXLSX(filePath: string){
  // 解析得到文档中的所有 sheet
  const sheets = xlsx.parse(filePath);
  //只取第一个sheet
  return sheets[0].data;
}
