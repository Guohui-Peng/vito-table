<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useI18n } from "vue-i18n";
import VtTransfer from "./VtTransfer.vue";

import type { VtTable as VT } from "@/types";

interface ColumnSelector {
	id: string;
	key: string;
	label: string;
}

const props = withDefaults(
	defineProps<{
		show: boolean;
		modelValue: VT.Column<VT.ColumnDataType>[];
		/**
		 * 列标题是否使用多语言 I18n 控件，默认为 true
		 */
		columnTitleI18n?: boolean;
	}>(),
	{
		modelValue: () => [],
		show: false,
		columnTitleI18n: true
	}
);

const emit = defineEmits(["update:modelValue", "update:show"]);

const { t } = useI18n();

const columns = computed({
	get() {
		return props.modelValue;
	},
	set(newValue) {
		emit("update:modelValue", newValue);
	}
});

const dialogFormVisible = computed({
	get() {
		return props.show;
	},
	set(val) {
		emit("update:show", val);
	}
});

const data = computed<ColumnSelector[]>({
	get() {
		return columns.value.map((item) => {
			return {
				id: item.key,
				key: item.key,
				label: props.columnTitleI18n ? t(item.title) : item.title
			};
		});
	},
	set(newValue) {
		if (newValue && newValue.length > 0) {
			const cols: any[] = [];
			newValue.forEach((item) => {
				const colIndex = columns.value.findIndex((f) => f.key === item.key);
				if (colIndex > -1) {
					cols.push(columns.value[colIndex]);
				}
			});
			columns.value = cols;
		}
	}
});

const hideColumns = (value: VT.Column<VT.ColumnDataType>[]) => {
	const hiddenCols: string[] = [];
	if (value.length > 0) {
		const cols = value.filter((f) => f.hidden === true);
		cols.forEach((col) => {
			hiddenCols.push(col.key);
		});
	}
	return hiddenCols;
};

const value = ref<any[]>([]);

function onCancel() {
	dialogFormVisible.value = false;
}

function onConfirm() {
	// 根据value中的key，设置columns中的hidden属性，设置列是否隐藏
	columns.value.forEach((item) => {
		if (value.value.includes(item.key)) {
			item.hidden = true;
		} else {
			item.hidden = false;
		}
	});
	// 列排序
	const cols = data.value.map((item) => {
		return columns.value.filter((f) => f.key === item.key)[0];
	});
	columns.value = cols;

	dialogFormVisible.value = false;
}

watch(
	() => props.show,
	(newValue, oldValue) => {
		if (newValue === true) {
			value.value = hideColumns(props.modelValue);
		}
	}
);
</script>

<template>
	<el-dialog
		class="vt-column-selector"
		v-model="dialogFormVisible"
		:title="t('Table.ColumnSelector')"
		:width="750"
	>
		<VtTransfer
			v-model="value"
			:titles="[t('Table.DisplayColumns'), t('Table.HiddenColumns')]"
			v-model:data="data"
			filterable
		/>
		<template #footer>
			<span class="dialog-footer">
				<el-button @click="onCancel"> {{ t("Table.Cancel") }}</el-button>
				<el-button type="primary" @click="onConfirm">
					{{ t("Table.Confirm") }}
				</el-button>
			</span>
		</template>
	</el-dialog>
</template>
