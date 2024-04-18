<script setup>
import { ref, computed, watch } from "vue";
import { useI18n } from "vue-i18n";
import VtTransfer from "./VtTransfer.vue";

const props = defineProps({
	show: {
		type: Boolean,
		default: false
	},
	modelValue: {
		type: Array,
		default: () => []
	}
});

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

const data = computed({
	get() {
		return columns.value.map((item) => {
			return {
				id: item.key,
				key: item.key,
				label: item.title
			};
		});
	},
	set(newValue) {
		if (newValue && newValue.length > 0) {
			const cols = [];
			newValue.forEach((item) => {
				if (columns.value.includes(item.key)) {
					cols.push(columns.value[item.key]);
				}
			});
			columns.value = cols;
		}
	}
});

const hideColumns = (value) => {
	const hiddenCols = [];
	if (value.length > 0) {
		const cols = value.filter((f) => f.hidden === true);
		cols.forEach((col) => {
			hiddenCols.push(col.key);
		});
	}
	return hiddenCols;
};

const value = ref([]);

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
		<vt-transfer
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
