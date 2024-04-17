import type { VtTable } from "@/types";

/**
 * 过滤行
 * @param {Object} row 行数据
 * @param {Object} filter 过滤规则
 * @returns
 */
export function filterRow(row: any, filter: VtTable.Filter): boolean {
	if (filter.groups) {
		return filter.groups.every((group) => {
			return filterRow(row, group);
		});
	} else if (filter.rules) {
		// console.log("filterRow", filter.rules);
		return filter.rules.every((rule) => {
			const field = rule.field;
			const op = rule.op;
			const data = rule.data;
			const value = row[field];
			// console.log("filterRow", field, op, data, value);
			switch (op) {
				case "eq":
					return value == data;
				case "ne":
					return value != data;
				case "lt":
					return value < data;
				case "le":
					return value <= data;
				case "gt":
					return value > data;
				case "ge":
					return value >= data;
				case "bw":
					return value.startsWith(data);
				case "bn":
					return !value.startsWith(data);
				case "in":
					return data.includes(value);
				case "ni":
					return !data.includes(value);
				case "ew":
					return value.endsWith(data);
				case "en":
					return !value.endsWith(data);
				case "cn":
					return value.includes(data);
				case "nc":
					return !value.includes(data);
				default:
					return true;
			}
		});
	} else {
		return true;
	}
}
