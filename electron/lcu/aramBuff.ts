import { makeRequest } from "../util/util";
import { load } from "cheerio";
import { champDict } from "../const/lolDataConfig";
import logger from "../lib/logger";
import settingDB from "../db/setting";
import { AramChampData } from "../types/type";

const rowNames = ["英雄", "胜率", "造伤", "承伤", "治疗", "护盾", "CD", "韧性", "其他"];

//http://www.jddld.com/
export async function fetchJDDLDData() {
	const res = await makeRequest<string>({
		hostname: "www.jddld.com",
		port: 80,
		path: "/index.php?s=api&c=api&m=template&format=jsonp&name=index-table.html",
		method: "GET",
		headers: {
			Accept: "text/javascript, application/javascript"
		}
	});
	let dataStr = res.trim().substring("callback(".length);
	dataStr = dataStr.substring(0, dataStr.length - 1);
	const $ = load("<table>" + JSON.parse(dataStr).msg + "</table>");
	// 提取表头数据
	const headers: string[] = [];
	$("thead tr:nth-child(3) th").each((index, element) => {
		headers.push($(element).text().trim());
	});

	// 提取表格数据
	const tableData: AramChampData[] = [];
	const championLabelIdMap: { [key: string]: string } = Object.values(champDict).reduce(
		(p, c) => {
			p[c.label] = c.champId;
			return p;
		},
		{} as { [key: string]: string }
	);
	$("tbody tr").each((index, row) => {
		const rowData: Partial<AramChampData> & { [key: string]: string } = {};
		$(row)
			.find("td")
			.each((cellIndex, cell) => {
				if (cellIndex === 0) {
					const herofullname = $(cell).find(".herofullname").text().trim();
					const id = championLabelIdMap[herofullname.split("-")[0]];
					if (id) {
						rowData["id"] = id;
					} else {
						logger.error("找不到该英雄", herofullname);
					}
					rowData[headers[cellIndex]] = herofullname;
				} else {
					rowData[headers[cellIndex]] = $(cell).text().trim();
				}
			});
		tableData.push(<AramChampData>rowData);
	});
	return tableData as AramChampData[];
}

export async function getAramBuffData() {
	const aramChampData = settingDB.getSetting<AramChampData[]>("aramBuffData");
	if (aramChampData) {
		return aramChampData;
	} else {
		const data = await fetchJDDLDData();
		settingDB.updateSetting("aramBuffData", data);
		return data;
	}
}

//todo 英雄数据和这个buff数据 在设置里 提供一个手动更新功能
export async function updateAramBuffData() {
	const data = await fetchJDDLDData();
	settingDB.updateSetting("aramBuffData", data);
	return data;
}
