<script setup>
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import { ElDialog } from "element-plus";

const props = defineProps({
	show: {
		type: Boolean,
		default: false
	},
	columns: {
		type: Array,
		required: true
	},
	data: {
		type: Array,
		required: true
	},
	range: {
		type: String,
		default: "a"
	},
	filename: {
		type: String,
		default: "export-file"
	},
	footer: {
		type: Array,
		default: () => []
	},
	formulaFooter: {
		type: Array,
		default: () => []
	},
	width: {
		type: Number,
		default: 650
	},
	loading: {
		type: Boolean,
		default: false
	}
});

const emit = defineEmits(["update:show", "update:range"]);

const { t } = useI18n();

const form = ref({ dataRange: 0, fileType: "xlsx" });
const formLabelWidth = ref(100);
const downloading = ref(false); // 显示下载中状态

const isLoading = computed(() => {
	return downloading.value || props.loading;
});

const dialogFormVisible = computed({
	get() {
		return props.show;
	},
	set(val) {
		emit("update:show", val);
	}
});

const dataRange = computed({
	get() {
		return props.range;
	},
	set(val) {
		emit("update:range", val);
	}
});

function onCancel() {
	// console.log("onCancel");
	dialogFormVisible.value = false;
}

function onConfirm() {
	// console.log("onConfirm");
	downloading.value = true;
	import("./excel")
		.then((excel) => {
			excel.useExcelExport().exportVtTableToFile({
				columns: props.columns,
				data: props.data,
				filename: props.filename,
				type: form.value.fileType || "xlsx",
				footer: props.footer,
				formulaFooter: props.formulaFooter
			});
		})
		.finally(() => {
			downloading.value = false;
			dialogFormVisible.value = false;
		});
}

function onRangeChanged(val) {
	dataRange.value = val;
}
</script>

<template>
	<el-dialog
		v-model="dialogFormVisible"
		:title="t('Table.Export')"
		:width="width"
		:close-on-click-modal="false"
		:close-on-press-escape="false"
		:show-close="false"
	>
		<template #default>
			<el-form v-model="form" v-loading="isLoading">
				<el-form-item :label="t('Table.ExportData')" :label-width="formLabelWidth">
					<el-radio-group v-model="dataRange" @change="onRangeChanged">
						<el-radio-button value="a" name="dataRange">{{
							t("Table.All")
						}}</el-radio-button>
						<el-radio-button value="c" name="dataRange">{{
							t("Table.CurrentPage")
						}}</el-radio-button>
						<el-radio-button value="s" name="dataRange">{{
							t("Table.SelectedRows")
						}}</el-radio-button>
					</el-radio-group>
				</el-form-item>
				<el-form-item :label="t('Table.FileType')" :label-width="formLabelWidth">
					<el-radio-group v-model="form.fileType">
						<el-radio-button value="xlsx" name="fileType">Excel(.xlsx)</el-radio-button>
						<el-radio-button value="csv" name="fileType">CSV(.csv)</el-radio-button>
						<el-radio-button value="txt" name="fileType">Text(.txt)</el-radio-button>
					</el-radio-group>
				</el-form-item>
			</el-form>
			<div class="ml-10">{{ t("Table.TotalRowsN", [data.length]) }}</div>
		</template>
		<template #footer>
			<span class="dialog-footer">
				<el-button @click="onCancel" :disabled="isLoading">
					{{ t("Table.Cancel") }}</el-button
				>
				<el-button type="primary" @click="onConfirm" :disabled="isLoading">
					{{ t("Table.Confirm") }}
				</el-button>
			</span>
		</template>
	</el-dialog>
</template>
