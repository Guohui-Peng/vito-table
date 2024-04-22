<script lang="ts" setup>
import { ref, computed, onMounted, watch } from "vue";
import { useI18n } from "vue-i18n";
import { Delete, CirclePlus, RefreshRight, Download } from "@element-plus/icons-vue";

import { filterRow } from "./filters/filter";
import VtTableDialog from "./VtTableDialog.vue";
import VtExportDialog from "./exports/VtExportDialog.vue";
import VtColumnSelector from "./VtColumnSelector.vue";
import { numberFormat, integerFormat } from "./filters/format";
import { VtHeaderFilter } from "./filters";
import { VtCell } from "./cells";
import { useApiFetch } from "./vtFetch";
import { cacheSelectOptions } from "./utils";
import { ElMessage, ElMessageBox } from "element-plus";

import type { ElTableColumn, ElTable } from "element-plus";
import type { VtTable as VT } from "@/types";

defineOptions({
	inheritAttrs: false
});

const props = withDefaults(
	defineProps<{
		modelValue?: any[];
		columns: VT.Column<VT.ColumnDataType>[];
		pageSizes?: number[];
		pageSize?: number;
		remote?: boolean;
		url?: string;
		editUrl?: string;
		showPagination?: boolean;
		showRowEditButton?: boolean;
		showRowDeleteButton?: boolean;
		showOperationColumn?: boolean;
		/**
		 * 选择显示的列
		 */
		showSelectionColumn?: boolean;
		/**
		 * 是否显示底部数据行
		 */
		showFooterRow?: boolean;
		/**
		 * 是否显示下载按钮
		 */
		showDownloadButton?: boolean;
		/**
		 * 是否在底部显示用户自定义数据
		 */
		userDataOnFooter?: boolean;
		/**
		 * 用户自定义底部数据
		 */
		userFooterData?: any;
		/**
		 * 高度。默认705，如果显示底部数据行，则高度为705，否则为673
		 */
		height?: number;
		/**
		 * 导出数据是否显示底部数据
		 */
		exportFooter?: boolean;
		exportCustomFooter?: any[];
		exportFormulaFooter?: any[];
		exportFilename?: string;
		/**
		 * 是否设计模式。设计模式不允许编辑数据。
		 */
		designMode?: boolean;
		apiServer?: string;
		token?: string;
		canAdd?: boolean;
		canEdit?: boolean;
		canDelete?: boolean;
		canExport?: boolean;
		canRefresh?: boolean;
	}>(),
	{
		modelValue: () => [],
		exportFilename: "export-file",
		pageSize: 20,
		pageSizes: () => [20, 50, 100, 200, 300, 400],
		remote: false,
		showPagination: true,
		showRowEditButton: true,
		showRowDeleteButton: true,
		showOperationColumn: true,
		showSelectionColumn: true,
		showFooterRow: false,
		showDownloadButton: true,
		userDataOnFooter: false,
		userFooterData: {},
		height: 705,
		exportFooter: true,
		designMode: false,
		exportCustomFooter: () => [],
		exportFormulaFooter: () => [],
		canAdd: false,
		canEdit: false,
		canDelete: false,
		canExport: false,
		canRefresh: true
	}
);

//const emit = defineEmits(["update:modelValue", "add", "edit", "delete", "operation"]);
const emit = defineEmits<{
	"update:modelValue": [val: any[]];
	add: [row: any];
	edit: [row: any];
	delete: [index: number, row: any];
	operation: [row: any];
}>();

const { t } = useI18n();

const apiFetch = useApiFetch(props.apiServer ?? "/api", props.token);

// 表格数据，v-model绑定
const data = computed({
	get() {
		return props.modelValue;
	},
	set(val) {
		emit("update:modelValue", val);
	}
});

const currentPage = ref<number>(1);
const pageRows = ref<number>(20);
const loading = ref<boolean>(false);
const small = ref<boolean>(false);
const disabled = ref<boolean>(false);
const background = ref<boolean>(false);
const filteredData = ref<any[]>([]);
const filterStat = ref<Record<string, VT.Filter>>({});
const tableRef = ref<InstanceType<typeof ElTable> | null>(null);
const form = ref<any>({}); // 编辑的当前行数据
const dialogFormVisible = ref<boolean>(false); // 是否显示编辑对话框
const dialogColumnSelector = ref<boolean>(false); // 是否显示列选择对话框
const customColumns = ref<VT.Column<VT.ColumnDataType>[]>([]); // 自定义的列，根据用户选择显示列及顺序
const cusotmFooterData = ref<Record<string, any>>({}); // 底部数据
const operation = ref("edit"); // 操作类型，用于区分是编辑还是新增，新增为"add"
const customOrder = ref<VT.Sort | undefined>(undefined); // 自定义排序

// 表单显示用的数据
const localData = ref(props.remote ? [] : data.value);
// 表单当前页面显示的数据（非远程数据时使用）
const currentPageData = computed(() => {
	if (!filteredData.value || filteredData.value.length === 0) {
		return [];
	}
	const dataLength = filteredData.value.length;
	let start = (currentPage.value - 1) * pageRows.value;
	if (start >= dataLength) {
		start = dataLength - pageRows.value;
	}
	if (start < 0) {
		start = 0;
	}
	let end = start + pageRows.value;
	if (end > dataLength) {
		end = dataLength;
	}
	return filteredData.value.slice(start, end);
	//   return props.data;
});

const remoteTotal = ref<number>(0); // 远程数据总数

const showRowEditButton = computed(() => {
	return props.showRowEditButton && props.canEdit;
});

const showRowDeleteButton = computed(() => {
	return props.showRowDeleteButton && props.canDelete;
});

const showEditButton = computed(() => {
	return props.canEdit;
});

const showDeleteButton = computed(() => {
	return props.canDelete;
});

const showDownloadButton = computed(() => {
	return props.showDownloadButton && props.canExport;
});

const showAddButton = computed(() => {
	return props.canAdd;
});

// 总数量
const total = computed<number>(() =>
	props.remote ? remoteTotal.value : filteredData.value.length
);
// 已选择的数据
const selectedItems = computed(() => data.value.filter((row) => row.checked));

const autoHeight = computed<number>(() => {
	if (props.height) {
		return props.height;
	} else {
		//return window.innerHeight - 200;
		if (props.showFooterRow === true) {
			return 705;
		} else {
			return 705 - 32;
		}
	}
});

const url = computed<string>(() => {
	if (props.remote === true) {
		return props.url ?? "";
	} else {
		return "";
	}
});

/**
 * JqGrid格式的过滤条件
 */

const jqFilterString = computed<VT.Filter | undefined>(() => {
	const filterList = ref<VT.Filter[]>([]);
	// console.log("jqFilterString", filterStat.value);
	Object.values(filterStat.value).forEach((item) => {
		if (item != null) {
			filterList.value.push(item);
		}
	});
	if (filterList.value.length === 1) {
		return filterList.value[0];
	} else {
		return {
			groupOp: "and",
			rules: [],
			groups: filterList.value
		};
	}
});

const tableColumns = computed(() => {
	return customColumns.value
		.filter((col) => col.hidden !== true)
		?.map((col) => Object.assign({}, { id: col.key }, col));
});

const summaryMethod = (params: VT.SummaryMethod) => {
	// console.log("params", params);
	const sums: any[] = [];
	const { columns, data } = params;
	if (props.userDataOnFooter) {
		if (cusotmFooterData.value) {
			const footerData = cusotmFooterData.value;
			columns.forEach((column, index) => {
				if (footerData.hasOwnProperty(column.property)) {
					const pColumn = props.columns.find((col) => col.dataKey === column.property);
					if (pColumn) {
						if (pColumn.dataType === "number") {
							sums[index] = numberFormat(
								footerData[column.property],
								getDecimalPlaces(pColumn as VT.Column<"number">)
							);
						} else if (pColumn.dataType === "int") {
							sums[index] = integerFormat(footerData[column.property]);
						} else {
							sums[index] = footerData[column.property];
						}
					} else {
						sums[index] = footerData[column.property];
					}
				} else {
					sums[index] = "";
				}
			});
		}
	} else {
		columns.forEach((column, index) => {
			if (index === 0) {
				sums[index] = "Total";
				return;
			}
			const pColumn = props.columns.find((col) => col.dataKey === column.property);
			if (pColumn) {
				if (pColumn.dataType === "int" || pColumn.dataType === "number") {
					const values = data.map((item) => Number(item[column.property]));
					sums[index] = values.reduce((prev, curr) => {
						const value = Number(curr);
						if (!isNaN(value)) {
							return prev + curr;
						} else {
							return prev;
						}
					}, 0);
					if (pColumn.dataType === "number") {
						sums[index] = numberFormat(
							sums[index],
							getDecimalPlaces(pColumn as VT.Column<"number">)
						);
					} else {
						sums[index] = integerFormat(sums[index]);
					}
				} else {
					sums[index] = "";
				}
			} else {
				sums[index] = "";
			}
		});
	}
	return sums;
};

/**
 * 将数据按jqFilterString进行过滤
 */
function filterData() {
	if (props.remote == true) {
		// 远程数据需要重新加载数据
		return;
	} else {
		if (jqFilterString.value == null) {
			filteredData.value = data.value;
			return;
		}
		const filter = jqFilterString.value;
		// console.log("filterData", filter);
		const fData = data.value.filter((row) => {
			return filterRow(row, filter);
		});
		filteredData.value = fData;
	}
}

function refreshLocalData() {
	filterData();
	if (props.remote == true) {
		refreshRemoteData();
	} else {
		localData.value = currentPageData.value;
	}
}

async function deleteData(rowIndex: number, rowData: Object) {
	try {
		await ElMessageBox.confirm(t("Table.AreYouSureDelete"), t("Table.Warning"), {
			confirmButtonText: t("Table.OK"),
			cancelButtonText: t("Table.Cancel"),
			type: "warning"
		});

		// console.log("Delete", rowIndex, rowData);
		if (props.remote) {
			// remoteData.value.splice(rowIndex, 1);
			// 远程删除数据
			if (!props.editUrl || props.editUrl.length == 0) {
				ElMessage.error("editUrl is not defined");
				throw new Error("editUrl is not defined");
			}
			try {
				// const resp = await request.post(props.editUrl, {
				// 	id: rowData.id,
				// 	action: "delete"
				// });
				loading.value = true;
				apiFetch<Result<any>>(props.editUrl)
					.post({
						data: rowData,
						operation: "del"
					})
					.then((resp) => {
						// console.log("Delete: ", resp.data.value);
						if (resp.data.value?.success === false) {
							const message = resp.data.value.msg || resp.data.value.data;
							ElMessage.error(message);
							throw new Error(message);
						}
						loading.value = false;
						// 重新加载数据
						refreshRemoteData();
					});
			} catch (err) {
				console.error(err);
			}
		} else {
			localData.value.splice(rowIndex, 1);
			const index = data.value.indexOf(rowData);
			data.value.splice(index, 1);
			refreshLocalData();
			// emit("update:modelValue", localData.value);
		}
		emit("delete", rowIndex, rowData);
	} catch (err) {
		console.error(err);
	}
}

function onFiltered(field: string, val: any) {
	// console.log("onFiltered", field, val);
	if (val == null) {
		delete filterStat.value[field];
	} else {
		filterStat.value[field] = val;
	}
	refreshLocalData();
	// console.log(JSON.stringify(jqFilterString.value));
}

const loadRemotePromise = (
	url: string,
	page_size: number,
	current_page: number,
	filters: VT.Filter | undefined = undefined,
	sort: VT.Sort | undefined = undefined
): Promise<GridResult<any>> => {
	const postData: VT.TableRequstParams = {
		pageSize: page_size,
		currentPage: current_page,
		filters: filters ? JSON.stringify(filters) : undefined
	};
	if (sort && sort.order != null && sort.name != null) {
		postData.sColumn = sort.name;
		postData.sOrder = sort.order === "ascending" ? "asc" : "desc";
	}

	return new Promise((resolve, reject) => {
		try {
			apiFetch<GridResult<any>>(url)
				.post(postData)
				.json()
				.then((resp) => {
					resolve(resp.data.value);
				});
		} catch (err) {
			console.error(err);
			reject(err);
		}
	});
};

/**
 * 从远程加载数据
 */
const loadRemoteData = (
	url: string,
	page_size: number,
	current_page: number,
	filters: VT.Filter | undefined = undefined,
	sort: VT.Sort | undefined = undefined
) => {
	loading.value = true;
	if (!url) {
		loading.value = false;
		localData.value = [];
		remoteTotal.value = 0;
		cusotmFooterData.value = [];
		return;
	}
	loadRemotePromise(url, page_size, current_page, filters, sort)
		.then((data) => {
			localData.value = data.rows ?? [];
			remoteTotal.value = data.records ?? 0;
			cusotmFooterData.value = data.userdata ?? [];
		})
		.catch((err) => {
			console.error(err);
			ElMessage.error(err.message);
		})
		.finally(() => {
			loading.value = false;
		});
};

/**
 * 刷新远程数据
 */
function refreshRemoteData() {
	loadRemoteData(
		url.value,
		pageRows.value,
		currentPage.value,
		jqFilterString.value,
		customOrder.value
	);
}

function onDelete(rowIndex: number, rowData: any) {
	if (props.designMode === true) {
		ElMessage.warning(t("Table.DesignMode"));
		return;
	}
	deleteData(rowIndex, rowData);
}

function onBatchDelete() {
	if (props.designMode === true) {
		ElMessage.warning(t("Table.DesignMode"));
		return;
	}

	const selectedRows = tableRef.value!.getSelectionRows();
	// console.log("selectedRows", selectedRows);
	// return;
	if (selectedRows.length == 0) {
		ElMessage.warning(t("Table.PleaseSelectAtLeastOneRow"));
		return;
	}
	ElMessageBox.confirm(t("Table.AreYouSureDeleteN", [selectedRows.length]), t("Table.Warning"), {
		confirmButtonText: t("Table.OK"),
		cancelButtonText: t("Table.Cancel"),
		type: "warning"
	})
		.then(() => {
			if (props.remote == true) {
				// 远程删除数据
				try {
					if (props.editUrl) {
						const ids = selectedRows.map((row: any) => row.Id).join(",");
						loading.value = true;
						apiFetch(props.editUrl)
							.post({
								data: null,
								ids: ids,
								operation: "del"
							})
							.json()
							.then((resp) => {
								// console.log(resp)
								if (resp.data?.value) {
									const r = resp.data.value;
									if (r.success === false) {
										console.error(r.data);
										ElMessage.error(r.data);
									}
								}
								loading.value = false;
								// 重新加载数据
								refreshRemoteData();
							});
					} else {
						ElMessage.error("editUrl is not defined");
					}
				} catch (err) {
					console.error(err);
				}
			} else {
				selectedRows.forEach((row: any) => {
					const index = data.value.indexOf(row);
					data.value.splice(index, 1);
				});
				// localData.value = currentPageData.value; // Refresh current page data
				refreshLocalData();
			}
		})
		.catch((e) => {
			console.log(e);
		});
}

function onRefresh() {
	// console.log("onRefresh");
	refreshRemoteData();
}

// #region 导出数据
const downloading = ref<boolean>(false);
const showExportDialog = ref<boolean>(false); // 是否显示导出对话框
const exportRange = ref<VT.ExportRangeType>("c"); // 导出范围。"a"：所有数据；"c"：当前页数据；"s"：选中数据
const exportData = ref<any[]>([]); // 导出数据
// 导出底部数据
const exportFooterData = computed(() => {
	if (props.exportFooter !== true) return undefined;
	if (props.exportCustomFooter && props.exportCustomFooter.length > 0) {
		return props.exportCustomFooter;
	} else if (props.userDataOnFooter) {
		return [cusotmFooterData.value];
	}
	return undefined;
});
// 导出底部公式数据
const exportFormulaFooterData = computed(() => {
	if (props.exportFormulaFooter && props.exportFormulaFooter.length > 0) {
		return props.exportFormulaFooter;
	}
	return undefined;
});

function onDownload() {
	generateExportData(exportRange.value);
	showExportDialog.value = true;
}

function generateExportData(range: VT.ExportRangeType) {
	// console.log("generateExportData", range);
	if (range === "c") {
		exportData.value = localData.value; // 当前页的数据
	} else if (range === "s") {
		// const selectedRows = tableRef.value!.getSelectionRows();
		// console.log(selectedRows);
		exportData.value = tableRef.value!.getSelectionRows();
	} else {
		if (props.remote) {
			downloading.value = true;
			exportData.value = [];
			loadRemotePromise(url.value, 0, 1, jqFilterString.value)
				.then((data) => {
					exportData.value = data.rows || [];
				})
				.finally(() => {
					downloading.value = false;
				});
		} else {
			exportData.value = filteredData.value;
		}
	}
}

watch(
	() => exportRange.value,
	(val) => {
		generateExportData(val);
	}
);
// #endregion

function _emptyRow() {
	const row: Record<string, any> = {};
	props.columns.forEach((col) => {
		if (col.dataType === "select") {
			if (col.editoptions) {
				if (!col.editoptions.defaultValue) {
					row[col.dataKey] = col.editoptions.defaultValue;
				} else {
					const s_col = col as VT.Column<"select">;
					if (
						s_col &&
						s_col.editoptions &&
						s_col.editoptions.options &&
						s_col.editoptions.options.length > 0
					) {
						row[col.dataKey] = s_col.editoptions.options[0].value;
					} else {
						row[col.dataKey] = "";
					}
				}
			} else {
				row[col.dataKey] = "";
			}
			//row[col.dataKey] = col.editoptions?.defaultValue || "";
		} else {
			row[col.dataKey] = col.editoptions?.defaultValue || null;
		}
	});
	return row;
}

function onAdd() {
	if (props.designMode === true) {
		ElMessage.warning(t("Table.DesignMode"));
		return;
	}
	form.value = _emptyRow();
	// console.log("form.value", form.value);
	operation.value = "add";
	dialogFormVisible.value = true;
}

const onEdit = ({ row }: VT.EditRowParams) => {
	if (props.designMode === true) {
		ElMessage.warning(t("Table.DesignMode"));
		return;
	}
	form.value = row;
	// console.log("form", form.value);
	operation.value = "edit";
	dialogFormVisible.value = true;
};

/**
 * 修改数据，用于远程修改数据
 * @param {*} val 修改后的值
 */
function onModified(val: any) {
	// console.log("onModified", val);
	if (!val) {
		return;
	}
	if (props.remote === true) {
		// 远程数据
		if (props.editUrl) {
			loading.value = true;
			apiFetch<Result<any>>(props.editUrl)
				.post({
					operation: operation.value,
					data: val
				})
				.json()
				.then((resp) => {
					// console.log(resp.data);
					const r = resp.data.value;
					if (r.success === false) {
						console.error(r.data);
						ElMessage.error(r.data);
					}
					refreshRemoteData();
				})
				.then(() => {
					loading.value = false;
				});
		} else {
			ElMessage.error("editUrl is not defined");
		}
	} else {
		// 本地数据
		switch (operation.value) {
			case "add":
				data.value.push(val);
				break;
			case "edit":
				const index = data.value.indexOf(form.value);
				data.value.splice(index, 1, val);
				break;
			default:
				ElMessage.error("Unsupport operation!");
				break;
		}
		refreshLocalData();
	}
}

function onSelectionChange(selection: any[]) {
	// const selectedRows = tableRef.value.getSelectionRows();
	currentPageData.value.forEach((row) => {
		row.checked = selection.includes(row);
	});
}

/**
 * 对数值型显示时靠右对齐
 * @param {String} type dataType
 */
function getAlignType(type: VT.ColumnDataType) {
	if (type === "int" || type === "integer" || type === "number") {
		return "right";
	} else {
		return "left";
	}
}

/**
 * 获取小数位显示位数
 * @param {Object} col 列配置
 */
function getDecimalPlaces(col: VT.Column<"number">) {
	let decimal = 2;
	if (col.formatoptions && col.formatoptions.decimalPlaces) {
		decimal = col.formatoptions.decimalPlaces;
	}
	return decimal;
}

// #region 排序数据
/**
 * 对本地数据进行排序
 * @param {String} prop 字段名
 * @param {String | null} order 排序方向，"ascending"：升序；"descending"：降序；null：不排序
 */
function sortLocalData(prop: string, order: VT.SortOrderType) {
	// console.log("sortLocalData", column, prop, order);
	if (order === "ascending" || order === "asc") {
		localData.value.sort((a, b) => {
			if (a[prop] > b[prop]) {
				return 1;
			} else if (a[prop] < b[prop]) {
				return -1;
			} else {
				return 0;
			}
		});
	} else if (order === "descending" || order === "desc") {
		localData.value.sort((a, b) => {
			if (a[prop] > b[prop]) {
				return -1;
			} else if (a[prop] < b[prop]) {
				return 1;
			} else {
				return 0;
			}
		});
	} else {
		// 不排序
		refreshLocalData();
	}
}
/**
 * 对远程数据进行排序，重新从服务器请求数据
 * @param {String} prop 字段名
 * @param {String | null} order 排序方向，"ascending"：升序；"descending"：降序；null：不排序
 */
function sortRemoteData(prop: string, order: VT.SortOrderType) {
	loadRemoteData(url.value, pageRows.value, currentPage.value, jqFilterString.value, {
		name: prop,
		order: order
	});
}

function onSortChange({ column, prop, order }: VT.SortChangeParams) {
	if (!customOrder.value) {
		customOrder.value = {
			name: prop,
			order: order
		};
	} else {
		customOrder.value.name = prop;
		customOrder.value.order = order;
	}
	if (props.remote === true) {
		sortRemoteData(prop, order);
	} else {
		sortLocalData(prop, order);
	}
}
// #endregion

// 监听当前页码和每页显示条数的变化，变化后从远程加载数据
watch(
	[currentPage, pageRows],
	([current_page, page_size], [old_current_page, old_page_size]) => {
		if (props.remote === true) {
			loadRemoteData(url.value, page_size, current_page, jqFilterString.value);
		} else {
			localData.value = currentPageData.value;
		}
	}
	// { immediate: true }
);
watch(
	() => props.modelValue,
	(data) => {
		// console.log("modelValue", data);
		if (!props.remote) {
			refreshLocalData();
		}
	},
	{ immediate: true }
);
watch(
	() => props.columns,
	(newValue, oldValue) => {
		// console.log("columns", newValue);
		if (newValue) {
			customColumns.value = newValue;
			cacheSelectOptions(customColumns.value);
		}
	},
	{ immediate: true }
);
watch(
	() => props.userFooterData,
	(newValue, oldValue) => {
		if (props.remote !== true) {
			cusotmFooterData.value = newValue;
		}
	},
	{ immediate: true }
);
watch(
	[() => props.remote, () => props.url],
	([new_remote, new_url], [old_remote, old_url]) => {
		if (new_remote === true) {
			refreshRemoteData();
		} else {
			refreshLocalData();
		}
	},
	{ immediate: true }
);

onMounted(() => {
	if (props.remote === true) {
		refreshRemoteData();
	} else {
		refreshLocalData();
	}
});
</script>

<template>
	<div class="vt-table">
		<el-table
			ref="tableRef"
			:data="localData"
			:border="true"
			:height="autoHeight"
			tooltip-effect="dark"
			size="small"
			:show-summary="showFooterRow"
			:summary-method="summaryMethod"
			style="width: 100%"
			v-loading="loading"
			v-bind="$attrs"
			@selection-change="onSelectionChange"
			@sort-change="onSortChange"
		>
			<el-table-column
				fixed
				:label="t('Table.Operations')"
				width="120"
				:align="'center'"
				:resizable="false"
				v-if="showOperationColumn"
			>
				<template #default="scope">
					<el-button
						link
						type="primary"
						size="small"
						@click="onEdit(scope)"
						v-if="showRowEditButton"
						>{{ t("Table.Edit") }}</el-button
					>
					<el-button
						link
						type="primary"
						size="small"
						@click="onDelete(scope.$index, scope.row)"
						v-if="showRowDeleteButton"
						>{{ t("Table.Delete") }}</el-button
					>
					<slot name="moreRowButtons" :row="scope.row"></slot>
				</template>
			</el-table-column>
			<el-table-column
				fixed
				type="selection"
				width="55"
				:resizable="false"
				:align="'center'"
				v-if="showSelectionColumn"
			/>
			<el-table-column
				v-for="col in tableColumns"
				:key="col.key"
				:prop="col.dataKey"
				:label="col.title"
				:width="col.width"
				:min-width="col.minWidth"
				v-bind="col.attrs"
				:align="getAlignType(col.dataType)"
				:show-overflow-tooltip="true"
				:sortable="col.sortable ? 'custom' : false"
				header-align="left"
			>
				<template #default="{ row, column, $index }">
					<vt-cell
						:cell-value="row[column.property]"
						:row="row"
						:index="$index"
						:column="col"
					/>
				</template>
				<template #header="{ column, $index }">
					{{ column.label }}
					<vt-header-filter
						:column="col"
						class="el-table__column-filter-trigger"
						@filtered="onFiltered"
						v-if="col.search === true"
					/>
				</template>
			</el-table-column>
		</el-table>
		<el-scrollbar class="pt-3" v-if="showPagination">
			<el-pagination
				v-model:current-page="currentPage"
				v-model:page-size="pageRows"
				:page-sizes="pageSizes"
				:small="small"
				:disabled="disabled"
				:background="background"
				layout="slot, sizes, prev, pager, next, jumper, total"
				:total="total"
			>
				<el-space>
					<el-button
						type="default"
						:icon="CirclePlus"
						style="--el-pagination-button-color: #ff00ff"
						v-if="showAddButton"
						@click="onAdd"
					/>
					<el-button
						type="danger"
						:icon="Delete"
						style="--el-pagination-button-color: #ff0000"
						@click="onBatchDelete"
						v-if="showDeleteButton"
					/>
					<el-divider direction="vertical" />
				</el-space>
				<el-space v-if="remote === true">
					<el-button
						type="default"
						:icon="RefreshRight"
						style="--el-pagination-button-color: #777"
						@click="onRefresh"
					/>
					<el-divider direction="vertical" />
				</el-space>
				<el-space>
					<el-button
						type="default"
						:icon="Download"
						:loading="downloading"
						style="--el-pagination-button-color: #0d2"
						@click="onDownload"
						v-if="showDownloadButton"
					/>
					<el-divider
						direction="vertical"
						v-if="designMode !== true && showDownloadButton === true"
					/>
					<el-button text @click="dialogColumnSelector = true" v-if="designMode !== true">
						<div class="i-mdi-table-large text-4"></div>
					</el-button>
					<el-divider direction="vertical" />
				</el-space>
				<slot name="morePageButtons" :selected-rows="selectedItems"></slot>
				<slot name="pagination" :selected-rows="selectedItems"></slot>
			</el-pagination>
		</el-scrollbar>
		<vt-table-dialog
			v-model:data="form"
			v-model:show="dialogFormVisible"
			:columns="columns"
			:operation="operation"
			@confirm="onModified"
		/>
		<vt-column-selector v-model="customColumns" v-model:show="dialogColumnSelector" />
		<vt-export-dialog
			:columns="tableColumns"
			:data="exportData"
			v-model:show="showExportDialog"
			v-model:range="exportRange"
			:footer="exportFooterData"
			:formula-footer="exportFormulaFooterData"
			:filename="exportFilename"
			:loading="downloading"
		/>
		<!-- <div class="mt-5">
			{{ filterStat }}
		</div> -->
	</div>
	<!-- <div>
		{{ tableColumns }}
	</div> -->
</template>
