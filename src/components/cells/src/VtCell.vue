<script lang="ts" setup>
import { computed } from "vue";
import { numberFormat, integerFormat, datetimeCellFormat } from "@/components/filters";
import VtSelectCell from "./VtSelectCell.vue";

import type { VtTable } from "@/types";

const props = defineProps<{ column: VtTable.IColumn; row: any; cellValue: any; index: number }>();

const type = computed(() => props.column?.dataType);

const column = computed(() => props.column);

const row = computed(() => props.row);

const cellValue = computed(() => props.cellValue);

/**
 * 获取小数位显示位数
 * @param {Object} col 列配置
 */
function getDecimalPlaces(col: VtTable.Column<"number" | "int">): number {
	let decimal = 2;
	if (col.formatoptions) {
		const colFormat = col.formatoptions as VtTable.FormatOption<"number">;
		decimal = colFormat?.decimalPlaces ?? 2;
	}
	return decimal;
}

/**
 * 自定义格式化单元格。根据列的类型和格式化配置，格式化单元格的值
 * @param row 行数据
 * @param col 表格列设置
 * @param cell_value 单元格值
 * @param index 单元格索引
 */
function customFormatter(
	row: any,
	col: VtTable.Column<VtTable.ColumnDataType>,
	cell_value: any,
	index: number
) {
	if(!cell_value) return "";
	const { dataType, formatter, formatoptions } = col;
	if (formatter === true) {
		if (formatoptions && formatoptions.custom) {
			if (typeof formatoptions.custom === "string") {
				const fn = new Function("row", "col", "cell_value", "index", formatoptions.custom);
				return fn(row, col, cell_value, index);
			} else if (typeof formatoptions.custom === "function") {
			// 	return eval(formatoptions.custom)(row, col, cell_value, index);
			// } else {
				return formatoptions.custom(row, col, cell_value, index);
			}
		}
	}
	switch (dataType) {
		case "number":
			return numberFormat(cell_value, getDecimalPlaces(col as VtTable.Column<"number">));
		case "int":
		case "integer":
			return integerFormat(cell_value);
		case "date":
		case "datetime":
		case "datetime-h":
		case "datetime-m":
			return datetimeCellFormat(cell_value, dataType);
		case "time":
		case "time-h":
		case "time-m":
			return datetimeCellFormat(cell_value, dataType);
		default:
			return cell_value.toString();
	}
}

const linkHtml = computed(() => {
	return customFormatter(row.value, column.value, cellValue.value, props.index);
});
</script>

<template>
	<span>
		<VtSelectCell
			v-if="type === 'select'"
			:cell-value="cellValue"
			:options="(column as VtTable.Column<'select'>).editoptions?.options || []"
		/>
		<span v-else-if="type === 'link' || type === 'html'" v-html="linkHtml"></span>
		<template v-else>{{ customFormatter(row, column, cellValue, index) }}</template>
	</span>
</template>
