import type { VtTable } from "@/types";
import { useApiFetch } from "./vt-fetch";

/**
 * 对远程获取select的options进行缓存
 * @param {Array} columns 表格的列配置
 * @returns 配置列
 */
export function cacheSelectOptions(
	columns: VtTable.Column<VtTable.ColumnDataType>[],
	access_token: string | undefined | null
): VtTable.Column<VtTable.ColumnDataType>[] {
	const { apiFetch } = useApiFetch();
	columns.forEach((col) => {
		if (col.dataType === "select") {
			if (col.editoptions) {
				const options = col.editoptions as VtTable.EditOption<"select">;
				if (options.dataUrl && options.dataUrl.length > 0) {
					apiFetch(options.dataUrl, access_token)
						.get()
						.json()
						.then((resp) => {
							// console.log(resp);
							options.options = resp.data.value;
						});
				}
			}
		}
	});
	return columns;
}

/**
 * 解析select选项
 * @param {Array | String} options 选项
 * @returns
 */
export function parseOptions(options: any[] | string): any[] {
	// console.log("parseOptions", options);
	if (typeof options === "string") {
		return options
			.split(";")
			.map((opt) => opt.split(":"))
			.map(([key, name]) => ({
				label: name,
				value: key
			}));
	}
	return options ?? [];
}
