<script setup lang="ts">
import { computed, ref, watch, toValue } from "vue";
import { ElInput, ElInputNumber, ElDatePicker, ElTimePicker } from "element-plus";
import { useI18n } from "vue-i18n";
import VtSelect from "./VtSelect.vue";

// import type { VtTable } from "@/types";

const props = withDefaults(
	defineProps<{
		show?: boolean;
		data: any;
		columns: any[];
		formLabelWidth?: string;
		operation?: string;
		width?: number;
	}>(),
	{
		show: false,
		formLabelWidth: "120px",
		operation: "edit",
		width: 800
	}
);

//const emit = defineEmits(["update:show", "update:data", "cancel", "confirm"]);
const emit = defineEmits<{
	"update:show": [value: boolean];
	"update:data": [value: any];
	cancel: [];
	confirm: [value: any];
}>();

const { t } = useI18n();

const dialogFormVisible = computed({
	get() {
		return props.show;
	},
	set(value) {
		emit("update:show", value);
	}
});

// 提交前临时保存数据
const form = ref<Record<string, any>>({});

const editableColumns = computed(() => props.columns.filter((i) => i.editable));

watch(
	() => toValue(props.data),
	(val) => {
		form.value = Object.assign({}, val);
	}
);

const supportedFormItems = [
	{
		name: "text",
		component: ElInput
	},
	{
		name: "textarea",
		component: ElInput,
		attrs: {
			type: "textarea",
			rows: 2
		}
	},
	{
		name: "int",
		component: ElInputNumber,
		attrs: {
			step: 1
		}
	},
	{
		name: "number",
		component: ElInputNumber
	},
	{
		name: "select",
		component: VtSelect
	},
	{
		name: "date",
		component: ElDatePicker,
		attrs: {
			type: "date"
		}
	},
	{
		name: "datetime",
		component: ElDatePicker,
		attrs: {
			type: "datetime"
		}
	},
	{
		name: "datetime-h",
		component: ElDatePicker,
		attrs: {
			type: "datetime"
		}
	},
	{
		name: "datetime-m",
		component: ElDatePicker,
		attrs: {
			type: "datetime"
		}
	},
	{
		name: "time",
		component: ElTimePicker
	},
	{
		name: "time-h",
		component: ElTimePicker,
		attrs: {
			format: "HH"
		}
	},
	{
		name: "time-m",
		component: ElTimePicker,
		attrs: {
			format: "HH:mm"
		}
	}
];

function getFormItem(item: any) {
	const colType = item.editType || item.dataType || "text";
	const supportedFormItem = supportedFormItems.find((i) => i.name === colType);
	if (!supportedFormItem) {
		// 不支持的显示为input文本框
		// throw new Error(`Unsupported form item type: ${item.type}`);
		return supportedFormItems[0];
	}
	return supportedFormItem;
}

function getFormItemAttrs(item: any) {
	const formItem = getFormItem(item);
	if (!formItem) {
		return {};
	}
	const colType = item.editType || item.dataType || "text";
	let attrs = Object.assign({}, formItem.attrs, item.attrs);
	if (colType === "select") {
		if (!item.editoptions) {
			throw new Error(`Select type must have editoptions`);
		}
		attrs = {
			...attrs,
			options: item.editoptions.value,
			url: item.editoptions.dataUrl
		};
	} else if (colType === "textarea") {
		if (item.editoptions) {
			attrs = {
				...attrs,
				rows: item.editoptions.rows || 2
			};
		}
	}

	if (item.editoptions) {
		if (props.operation === "add") {
			attrs = {
				...attrs,
				readonly: false,
				disabled: false
			};
		} else {
			attrs = {
				...attrs,
				readonly: item.editoptions.readonly || false,
				disabled: item.editoptions.disabled || false
			};
		}
	}
	// console.log("item", item)
	// console.log("attrs", attrs)
	return attrs;
}

function cancel() {
	form.value = Object.assign({}, props.data);
	//   console.log("cancel");
	emit("cancel");
	dialogFormVisible.value = false;
}

function submit() {
	const formValue = Object.assign(props.data, form.value);
	emit("update:data", formValue);
	emit("confirm", formValue);
	//   console.log("submit", formValue);
	dialogFormVisible.value = false;
}
</script>

<template>
	<el-dialog
		v-model="dialogFormVisible"
		:title="operation === 'edit' ? t('Table.Edit') : t('Table.Add')"
		:width="width"
	>
		<el-form v-model="form">
			<template v-for="col in editableColumns">
				<el-form-item :label="col.title" :label-width="formLabelWidth">
					<vt-select
						v-if="col.dataType === 'select'"
						v-model="form[col.dataKey]"
						:placeholder="col.placeholder || col.label"
						:column="col"
						v-bind="getFormItemAttrs(col)"
					/>
					<component
						v-else
						:is="getFormItem(col).component"
						v-model="form[col.dataKey]"
						:placeholder="col.placeholder || col.label"
						v-bind="getFormItemAttrs(col)"
					/>
				</el-form-item>
			</template>
		</el-form>
		<template #footer>
			<span class="dialog-footer">
				<el-button @click="cancel"> {{ t("Table.Cancel") }}</el-button>
				<el-button type="primary" @click="submit">
					{{ t("Table.Confirm") }}
				</el-button>
			</span>
		</template>
	</el-dialog>
</template>
