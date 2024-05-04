<script setup>
import { ref, computed, watch } from "vue";
import { useI18n } from "vue-i18n";
import { datetimeFormat } from "./format";

const props = defineProps({
	show: {
		type: Boolean,
		default: false,
		required: true
	},
	fieldName: {
		type: String,
		required: true
	},
	field: {
		type: String,
		required: true
	},
	filter: {
		type: Object,
		default: (rawProps) => {
			return {
				groupOp: "and",
				rules: [
					{
						field: "",
						op: "eq",
						data: ""
					}
				]
			};
		}
	},
	dateType: {
		validator:(value)=>['date', 'datetime'].includes(value),
		default: "date"
	}
});

const emit = defineEmits(["filtered", "canceled", "update:show", "update:filter"]);

const showDialog = computed({
	get() {
		return props.show;
	},
	set(value) {
		emit("update:show", value);
	}
});

const { t } = useI18n();

const groupOperation = ref("and");

const validOperations = [
	{ value: "eq", label: "equal" },
	{ value: "lt", label: "lessThan" },
	{ value: "le", label: "lessThanOrEqual" },
	{ value: "gt", label: "greaterThan" },
	{ value: "ge", label: "greaterThanOrEqual" }
];
// 第2个条件默认为空，需要包含空选项
const validOperations2 = [{ value: "", label: "empty" }, ...validOperations];

const filterCondition1 = ref({
	operation: "eq",
	value: ""
});
const filterCondition2 = ref({
	operation: "",
	value: ""
});

const filterResult = computed(() => {
	if (filterCondition1.value.value.length == 0 && filterCondition2.value.value.length == 0) {
		return null;
	} else if (filterCondition2.value.value.length > 0) {
		return {
			groupOp: groupOperation.value,
			rules: [
				{
					field: props.field,
					op: filterCondition1.value.operation,
					data: datetimeFormat(filterCondition1.value.value, props.dateType)
				},
				{
					field: props.field,
					op: filterCondition2.value.operation,
					data: datetimeFormat(filterCondition2.value.value, props.dateType)
				}
			]
		};
	} else {
		return {
			groupOp: groupOperation.value,
			rules: [
				{
					field: props.field,
					op: filterCondition1.value.operation,
					data: datetimeFormat(filterCondition1.value.value, props.dateType)
				}
			]
		};
	}
});

function onConfirm() {
	// console.log("onConfirm", filterResult.value);
	emit("update:filter", filterResult.value);
	emit("filtered", filterResult.value);
	showDialog.value = false;
}

function onCancel() {
	// filterString.value = filterString.value;
	emit("canceled");
	showDialog.value = false;
}

// 监听值的变化，当操作为空时，默认设置为“等于”
watch(
	() => filterCondition2.value.value,
	(newValue) => {
		if (newValue.length > 0 && filterCondition2.value.operation.length == 0) {
			filterCondition2.value.operation = "eq";
		}
	}
);

watch(
	() => props.show,
	(newValue) => {
		if (newValue === true) {
			// 显示对话框时进行处理

			const initValue = props.filter;
			// 需先初始化条件，避免取消时，再显示时有残留
			groupOperation.value = "and";
			filterCondition1.value.operation = "eq";
			filterCondition1.value.value = "";
			filterCondition2.value.operation = "";
			filterCondition2.value.value = "";
			// console.log("initValue", initValue);

			if (initValue && initValue.rules) {
				groupOperation.value = initValue.groupOp;
				if (initValue.rules.length > 0) {
					const firstCondition = initValue.rules[0];
					filterCondition1.value.operation = firstCondition.op;
					filterCondition1.value.value = firstCondition.data;
				}
				if (initValue.rules.length > 1) {
					const secondCondition = initValue.rules[1];
					filterCondition2.value.operation = secondCondition.op;
					filterCondition2.value.value = secondCondition.data;
				}
			}
		}
	}
);
</script>

<template>
	<el-dialog
		class="vt-filter-more"
		:title="t('Table.CustomFilter')"
		:show-close="true"
		v-model="showDialog"
		:close-on-click-modal="false"
		:destroy-on-close="true"
		width="400px"
		:draggable="true"
		:append-to-body="true"
	>
		<el-divider content-position="left" style="margin-top: 0">{{ fieldName }}</el-divider>
		<div class="flex">
			<div class="flex-initial w-25">
				<el-select v-model="filterCondition1.operation">
					<el-option
						v-for="item in validOperations"
						:key="item.value"
						:label="t(`Table.${item.label}`)"
						:value="item.value"
					/>
				</el-select>
			</div>
			<div class="flex-initial w-64">
				<!-- <el-input v-model="filterCondition1.value"></el-input> -->
				<el-date-picker v-model.lazy="filterCondition1.value" :type="dateType" />
			</div>
		</div>
		<div class="flex items-center text-sm">
			<el-radio-group v-model="groupOperation" class="ml-4">
				<el-radio value="and">{{ t("Table.And") }}</el-radio>
				<el-radio value="or">{{ t("Table.Or") }}</el-radio>
			</el-radio-group>
		</div>
		<div class="flex">
			<div class="flex-initial w-25">
				<el-select v-model="filterCondition2.operation">
					<el-option
						v-for="item in validOperations2"
						:key="item.value"
						:label="t(`Table.${item.label}`)"
						:value="item.value"
					/>
				</el-select>
			</div>
			<div class="flex-initial w-64">
				<!-- <el-input v-model="filterCondition2.value"></el-input> -->
				<el-date-picker v-model.lazy="filterCondition2.value" :type="dateType" />
			</div>
		</div>
		<template #footer>
			<div class="mr-2">
				<el-button @click="onCancel">{{ t("Table.Cancel") }}</el-button>
				<el-button type="primary" @click="onConfirm">
					{{ t("Table.OK") }}
				</el-button>
			</div>
		</template>
	</el-dialog>
</template>

<style lang="scss" scoped>
.el-dialog__body {
	padding-top: 0 !important;
}
</style>
