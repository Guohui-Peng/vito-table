import * as XLSX from "xlsx";
import type { VtTable } from "@/types/table";

// https://docs.sheetjs.com/docs/getting-started/examples/export
// 公式：https://docs.sheetjs.com/docs/csf/features/formulae
export function useExcelExport() {
	/**
	 * 将Json导出Excel
	 * @param {Object} param0 {rows, filename, sheetName, autoWidth, type, header, merges:合并范围, colMaxWidth: 列最大宽度，防止列宽过大, footer: 最后一行数据}
	 */
	function exportJsonToFile({
		rows = [],
		filename = "exprot_file.xlsx",
		sheetName = "Sheet1",
		autoWidth = true,
		type = "xlsx",
		header = [],
		merges = [],
		colMaxWidth = 50,
		footer = []
	}: VtTable.Json2ExcelParams) {
		/* generate worksheet and workbook */
		const worksheet = XLSX.utils.json_to_sheet(rows);
		const workbook = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

		if (footer && footer.length > 0) {
			if (Array.isArray(footer[0])) {
				for (let i = 0; i < footer.length; i++) {
					XLSX.utils.sheet_add_aoa(worksheet, footer[i]);
				}
			} else {
				XLSX.utils.sheet_add_aoa(worksheet, footer);
			}
		}

		/* fix headers */
		if (header && header.length > 0) {
			if (Array.isArray(header[0]) && header[0].length > 0) {
				for (let i = 0; i < header.length; i++) {
					const headerRow = header[i] as string[];
					XLSX.utils.sheet_add_aoa(worksheet, [headerRow], { origin: "A" + (i + 1) });
				}
			} else {
				XLSX.utils.sheet_add_aoa(worksheet, [header], { origin: "A1" });
			}
		}

		/* auto width */
		if (autoWidth) {
			// /*设置worksheet每列的最大宽度*/
			const colWidth = rows.map((row) =>
				Object.values(row).map((val) => {
					/*先判断是否为null/undefined*/
					if (val == null) {
						return {
							wch: 10
						};
					} else if (val.toString().charCodeAt(0) > 255) {
						/*再判断是否为中文*/
						return {
							wch: val.toString().length * 2
						};
					} else if (val instanceof Date) {
						return {
							wch: 15
						};
					} else {
						return {
							wch: val.toString().length
						};
					}
				})
			);
			/*以第一行为初始值*/
			let result = colWidth[0];
			for (let i = 1; i < colWidth.length; i++) {
				for (let j = 0; j < colWidth[i].length; j++) {
					if (result[j]["wch"] < colWidth[i][j]["wch"]) {
						result[j]["wch"] = colWidth[i][j]["wch"];
					}
					if (result[j]["wch"] > colMaxWidth) result[j]["wch"] = colMaxWidth;
				}
			}
			worksheet["!cols"] = result;
		}

		/* merge cells */
		if (merges.length > 0) {
			if (!worksheet["!merges"]) worksheet["!merges"] = [];
			for(let x in merges){
				worksheet["!merges"].push(XLSX.utils.decode_range(merges[x]));
			}
			// merges.forEach((item) => {
			// 	worksheet["!merges"].push(XLSX.utils.decode_range(item));
			// });
		}

		if (!filename.includes(".")) {
			filename += "." + type;
		}

		/* create an XLSX file and try to save */
		XLSX.writeFile(workbook, filename, { compression: true, bookType: type });
	}
	/**
	 * 将Footer转换为数组
	 * @param {Array} footer 最后一行
	 * @param {*} columnKeys 数据列定义
	 * @returns 转换后的数组
	 */
	function convertFooter(footer: any[], columnKeys: string[]): string[] {
		if (!footer || footer.length === 0) return [];
		const footerData = footer[0];
		const row = [];
		if (typeof footerData === "string") {
			// 是字符串时，直接返回数组
			footer.forEach((item) => {
				row.push(item);
			});
		} else if (typeof footerData === "object") {
			// 是对象时，按照列定义转换为数组
			for (let j = 0; j < columnKeys.length; j++) {
				const key = columnKeys[j];
				row.push(footerData.hasOwnProperty(key) ? footerData[key] : null);
			}
		} else {
			return footer;
		}
		return row;
	}

	// [{column-0:"Total"},{column-1:{t:"n",f:"COUNT"}},{column-4:{t:"n",f:"SUM"}},{column-5:{t:"n",f:"SUM"}}]
	// [{column-0:"Total"},{column-4:1000},{column-5:100.000}]
	/**
	 * 转换底部行的计算公式为Excel公式
	 * @param footer 尾部数据
	 * @param columnKeys 列 Key 数组
	 * @param headerRows 头部行数
	 * @param dataRows 数据行数
	 */
	function convertFormulaFooter(
		footer: Record<string, any>,
		columnKeys: string[],
		headerRows: number,
		dataRows: number
	) {
		if (!footer) return [];
		if (Array.isArray(footer) && footer.length === 0) return [];
		const row = [];
		// console.log("footer", footer);
		for (let j = 0; j < columnKeys.length; j++) {
			const key = columnKeys[j];
			// console.log("key", key);
			const value = footer.hasOwnProperty(key) ? footer[key] : null;
			// console.log("value", value);
			if (value === null) {
				row.push(null);
				continue;
			}

			if (typeof value === "object") {
				if (value.f) {
					const fromAdd = XLSX.utils.encode_cell({ c: j, r: headerRows });
					const toAdd = XLSX.utils.encode_cell({
						c: j,
						r: headerRows + dataRows - 1
					});
					let formula = value.f + "(" + fromAdd + ":" + toAdd + ")";
					row.push({ t: value.t || "n", f: formula, z: value.z });
				} else {
					row.push(null);
				}
			} else {
				row.push(value);
			}
		}
		return row;
	}
	/**
	 * 格式化日期时间格式
	 * @param {String} colType 类型
	 * @returns 格式化的日期时间格式
	 */
	function getDatetimeFormat(colType: VtTable.TableDateTimeType) {
		if (colType === "datetime") {
			return "YYYY-MM-DD HH:mm:ss";
		} else if (colType === "datetime-m") {
			return "YYYY-MM-DD HH:mm";
		} else if (colType === "datetime-h") {
			return "YYYY-MM-DD HH";
		} else if (colType === "time") {
			return "HH:mm:ss";
		} else if (colType === "time-m") {
			return "HH:mm";
		} else if (colType === "time-h") {
			return "HH";
		} else if (colType === "date") {
			return "YYYY-MM-DD";
		}
		return "";
	}

	function getCellFormat(column: VtTable.Column<VtTable.ColumnDataType>) {
		const colType = column.dataType || "text";
		// 设置日期、时间格式
		const dateFormats = [
			"date",
			"datetime",
			"datetime-m",
			"datetime-h",
			"time",
			"time-m",
			"time-h"
		];
		if (!colType) {
			return null;
		}
		if (colType === "number") {
			let decimalLength =
				(column as VtTable.Column<"number">).formatoptions?.decimalPlaces ?? 2;
			return "#,##0." + "".padEnd(decimalLength, "0");
		} else if (colType === "int") {
			return "#,##0";
		}
		if (dateFormats.includes(colType)) {
			return getDatetimeFormat(colType as VtTable.TableDateTimeType);
		}
		return null;
	}

	/**
	 * 将Json导出Excel
	 * @param {Object} param0 {data: 数据, filename, sheetName, autoWidth, type, columns: 列定义, merges:合并范围, colMaxWidth: 列最大宽度，防止列宽过大,
	 * formulaFooter: 公式底部行，如：[{column-0:"Total"},{column-1:{t:"n",f:"COUNT"}},{column-4:{t:"n",f:"SUM"}},{column-5:{t:"n",f:"SUM"}}]}
	 */
	function exportVtTableToFile({
		data = [],
		columns = [],
		filename = "exprot_file.xlsx",
		sheetName = "Sheet1",
		autoWidth = true,
		type = "xlsx",
		merges = [],
		colMaxWidth = 30,
		footer = [],
		formulaFooter = []
	}: VtTable.Table2ExcelParams) {
		const header = columns.map((item) => item.title);
		const columnTypes = columns.map((item) => item.dataType || "text");
		const tHeaderKey = columns.map((col) => col.dataKey);
		const rows = data.map((row) => {
			return tHeaderKey.map((key) => {
				return row[key];
			});
		});
		/* generate worksheet and workbook */
		const worksheet = XLSX.utils.json_to_sheet(rows);
		const workbook = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

		/* fix headers */
		let columnTitles: string[] = [];
		if (header && header.length > 0) {
			// if (Array.isArray(typeof header[0])) {
			// 	columnTitles = header[0];
			// 	for (let i = 0; i < header.length; i++) {
			// 		XLSX.utils.sheet_add_aoa(worksheet, [header[i]], { origin: "A" + (i + 1) });
			// 	}
			// } else {
			columnTitles = header;
			XLSX.utils.sheet_add_aoa(worksheet, [header], { origin: "A1" });
			// }
		}

		if (formulaFooter && formulaFooter.length > 0) {
			const footerData = convertFormulaFooter(formulaFooter[0], tHeaderKey, 1, rows.length);
			XLSX.utils.sheet_add_aoa(worksheet, [footerData], { origin: -1 });
		}

		if (footer && footer.length > 0) {
			if (Array.isArray(footer[0])) {
				const footerDataArray = [];
				for (let i = 0; i < footer.length; i++) {
					const footerData = convertFooter(footer[i], tHeaderKey);
					footerDataArray.push(footerData);
				}
				XLSX.utils.sheet_add_aoa(worksheet, footerDataArray, { origin: -1 });
			} else {
				const footerData = convertFooter(footer, tHeaderKey);
				console.log(footerData);
				XLSX.utils.sheet_add_aoa(worksheet, [footerData], { origin: -1 });
			}
		}

		/* 显示格式化。*/
		for (let i = 0; i < columns.length; i++) {
			// 头部不需要设置格式
			const cellFormat = getCellFormat(columns[i]);
			// console.log("cellFormat", cellFormat);
			const colType = columnTypes[i];
			if (cellFormat) {
				for (let j = 1; j <= rows.length; j++) {
					let address = XLSX.utils.encode_cell({ c: i, r: j });
					// if (colType === "int") {
					// 	worksheet[address].t = "n";
					// } else if (colType === "number") {
					// 	worksheet[address].t = "n";
					// 	worksheet[address].v = columns[i].formatoptions?.decimalPlaces ?? 2;
					// }
					worksheet[address].z = cellFormat;
				}
			}
		}

		/* auto width */
		if (autoWidth) {
			// /*设置worksheet每列的最大宽度*/
			const colWidth = rows.map((row) =>
				Object.values(row).map((val, index) => {
					/*先判断是否为null/undefined*/
					const colType = columnTypes[index];
					if (val == null) {
						return {
							wch: 10
						};
					} else if (val.toString().charCodeAt(0) > 255) {
						/*再判断是否为中文*/
						return {
							wch: val.toString().length * 2
						};
					} else if (colType.startsWith("time")) {
						return {
							wch: 10
						};
					} else if (colType.startsWith("datetime")) {
						return {
							wch: 21
						};
					} else if (colType === "date") {
						return {
							wch: 12
						};
					} else {
						return {
							wch: val.toString().length
						};
					}
				})
			);
			/*以列标题长度为初始值*/
			let result = columnTitles.map((title) => {
				return {
					wch: title
						? title.toString().charCodeAt(0) > 255
							? title.length * 2
							: title.length
						: 10
				};
			});
			// console.log(result);
			for (let i = 0; i < colWidth.length; i++) {
				for (let j = 0; j < columnTitles.length; j++) {
					if (result[j]["wch"] < colWidth[i][j]["wch"]) {
						result[j]["wch"] = colWidth[i][j]["wch"];
					}
					if (result[j]["wch"] > colMaxWidth) result[j]["wch"] = colMaxWidth;
				}
			}
			worksheet["!cols"] = result;
		}

		/* merge cells */
		if (merges.length > 0) {
			if (!worksheet["!merges"]) worksheet["!merges"] = [];
			for(let x in merges){
				worksheet["!merges"].push(XLSX.utils.decode_range(merges[x]));
			}
			// merges.forEach((item) => {
			// 	worksheet["!merges"].push(XLSX.utils.decode_range(item));
			// });
		}

		if (!filename.includes(".")) {
			filename += "." + type;
		}

		/* create an XLSX file and try to save */
		XLSX.writeFile(workbook, filename, { compression: true, bookType: type });
	}

	return { exportVtTableToFile };
}
