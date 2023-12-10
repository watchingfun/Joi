import { makeRequest } from "../util/util";
import { load } from "cheerio";

const rowNames = ["英雄", "胜率", "造伤", "承伤", "治疗", "护盾", "CD", "韧性", "其他"];
export type RowData = {
	英雄: string;
	胜率: string;
	造伤: string;
	承伤: string;
	治疗: string;
	护盾: string;
	CD: string;
	韧性: string;
	其他: string;
};

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
	const headers = [];
	$("thead tr:nth-child(3) th").each((index, element) => {
		headers.push($(element).text().trim());
	});

	// 提取表格数据
	const tableData = [];
	$("tbody tr").each((index, row) => {
		const rowData = {};
		$(row)
			.find("td")
			.each((cellIndex, cell) => {
				if (cellIndex === 0) {
					rowData[headers[cellIndex]] = $(cell).find(".herofullname").text().trim();
				} else {
					rowData[headers[cellIndex]] = $(cell).text().trim();
				}
			});
		tableData.push(rowData);
	});
	return tableData as RowData[];
}
