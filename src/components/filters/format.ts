import dayjs from "./dayjs.mjs";

import type { VtTable } from "@/types";


/**
 * 将日期时间格式化为指定格式
 * @param {String | null} value 日期时间
 * @param {"date" | "datetime"} dateType 日期时间格式
 * @returns 格式化后的日期时间
 */
export const datetimeFormat = (
	value?: string | number | Date | dayjs.Dayjs | null,
	dateType: VtTable.DateType | string = "date"
): string => {
	if (value) {
		if (dateType === "date") {
			return dayjs(value).format("YYYY-MM-DD");
		} else {
			return dayjs(value).format("YYYY-MM-DD HH:mm:ss");
		}
	} else {
		return "";
	}
};

/**
 * 将时间格式化为指定格式
 * @param {String | null} value 时间
 * @returns 格式化后的时间
 */
export const timeFormat = (value?: String | number | Date | dayjs.Dayjs | null): string => {
	if (value) {
		const v = value.toString();
		return dayjs(v).format("HH:mm:ss");
	} else {
		return "";
	}
};

/**
 * 按dataType格式化日期、时间的显示样式
 * @param {String | null | Number} value 日期时间或时间
 * @param {"date" | "datetime" | "time"} type 日期时间类型
 */
export const datetimeCellFormat = (
	value?: string | number | Date | dayjs.Dayjs | null,
	type: VtTable.TableDateTimeType | string = "date"
): string => {
	let formatValue = undefined;
	if (type === "date") {
		formatValue = dayjs(value).format("YYYY-MM-DD");
	} else if (type === "datetime") {
		formatValue = dayjs(value).format("YYYY-MM-DD HH:mm:ss");
	} else if (type === "datetime-m") {
		formatValue = dayjs(value).format("YYYY-MM-DD HH:mm");
	} else if (type === "datetime-h") {
		formatValue = dayjs(value).format("YYYY-MM-DD HH");
	} else if (type === "time") {
		formatValue = dayjs(value).format("HH:mm:ss");
	} else if (type === "time-m") {
		formatValue = dayjs(value).format("HH:mm");
	} else if (type === "time-h") {
		formatValue = dayjs(value).format("HH");
	} else {
		formatValue = dayjs(value).format();
	}
	return formatValue;
};

export const toBaseDatetime = (type: VtTable.TableDateTimeType): VtTable.DateTimeType => {
	let dateType: VtTable.DateTimeType = "date";
	if (!type) {
		return dateType;
	}
	if (type.startsWith("datetime")) {
		dateType = "datetime";
	} else if (type.startsWith("time")) {
		dateType = "time";
	}
	return dateType;
};

/**
 * 将数字格式化为指定格式
 * @param {any} value 待转换的值
 * @param {number} decimals 小数位数，默认为2
 * @returns 格式化后的数字
 */
export const numberFormat = (value?: any, decimals: number = 2): string => {
	if (value || value === 0) {
		if (isNaN(Number(value))) {
			return value.toString();
		} else {
			return Number(value).toLocaleString("en-US", {
				minimumFractionDigits: decimals,
				maximumFractionDigits: decimals
			});
		}
	} else {
		return "";
	}
};

/**
 * 将整形数字格式化为指定格式
 * @param {any} value 待转换的值
 * @returns 格式化后的数字
 */
export const integerFormat = (value?: any) => {
	return numberFormat(value, 0);
};
