<script lang="jsx" setup>
import { ref, computed, onMounted, watch, toValue } from "vue";
import { Delete, CirclePlus, RefreshRight, Download } from "@element-plus/icons-vue";
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import { useI18n } from "vue-i18n";

import { ElMessage, TableV2SortOrder, ElMessageBox } from "element-plus";
// import "element-plus/theme-chalk/src/message.scss";

import { filterRow, VtHeaderFilter } from "@/components/filters";
import { VtCell, VtTableDialog, VtColumnSelector, VtExportDialog } from "@/components";

import { useApiFetch, cacheSelectOptions } from "@/utils";

defineOptions({
	inheritAttrs: false
});

const props = defineProps({
	modelValue: {
		type: Array,
		default: () => []
		// required: true
	},
	remote: {
		type: Boolean,
		default: false
	},
	url: {
		type: String
	},
	editUrl: {
		type: String
	},
	columns: {
		type: Array,
		required: true
	},
	height: {
		type: Number,
		default: 800
	},
	pageSizes: {
		type: Array,
		default: () => [100, 200, 300, 400]
	},
	pageSize: {
		type: Number,
		default: 100
	},
	showPagination: {
		type: Boolean,
		default: true
	},
	showRowEditButton: {
		type: Boolean,
		default: true
	},
	showRowDeleteButton: {
		type: Boolean,
		default: true
	},
	showOperationColumn: {
		type: Boolean,
		default: true
	},
	showDownloadButton: {
		type: Boolean,
		default: true
	},
	designMode: {
		type: Boolean,
		default: false
	},
	exportFooter: {
		type: Boolean,
		default: true
	},
	exportCustomFooter: {
		type: Array,
		default: () => []
	},
	exportFormulaFooter: {
		type: Array,
		default: () => []
	},
	exportFilename: {
		type: String,
		default: "export-file"
	},
	apiServer: {
		type: String
	},
	accessToken: {
		type: String
	},
	canAdd: {
		type: Boolean,
		default: false
	},
	canEdit: {
		type: Boolean,
		default: false
	},
	canDelete: {
		type: Boolean,
		default: false
	},
	canExport: {
		type: Boolean,
		default: false
	},
	canRefresh: {
		type: Boolean,
		default: true
	},
	acessToken: {
		type: String,
		default: ""
	},
	columnTitleI18n: {
		type: Boolean,
		default: true
	}
});

const emit = defineEmits([
	"update:modelValue",
	"add",
	"edit",
	"delete",
	"operation",
	"onFetchError"
]);

const { t, locale } = useI18n();

function emitFetchError(ctx) {
	emit("onFetchError", ctx);
}

const { apiFetch } = useApiFetch(emitFetchError);

// 表格数据，v-model绑定
const data = computed({
	get() {
		return props.modelValue;
	},
	set(val) {
		emit("update:modelValue", val);
	}
});

const customColumns = ref([]); // 定制化列
const customOrder = ref({
	name: null,
	order: null
}); // 自定义排序

// 已选择的数据
const selectedItems = computed(() => localData.value.filter((row) => row.checked));

const loading = ref(false);
const currentPage = ref(1);
const pageSize = ref(props.pageSize || 100);
const small = ref(false);
const disabled = ref(false);
const background = ref(false);
const pageRows = ref(20);
const operationColumns = ref([]); // 操作列
const cusotmFooterData = ref({}); // 底部数据

// const remoteData = ref([]); // 远程数据
const remoteTotal = ref(0); // 远程数据总数
const filteredData = ref([]);
const operation = ref("edit"); // 操作类型，用于区分是编辑还是新增，新增为"add"

// 表单显示用的数据
const localData = ref(props.remote ? [] : data.value);

// 表单当前页面显示的数据（非远程数据时使用）
const currentPageData = computed(() => {
	if (!filteredData.value || filteredData.value.length === 0) {
		return [];
	}
	const dataLength = filteredData.value.length;
	let start = (currentPage.value - 1) * pageSize.value;
	if (start >= dataLength) {
		start = dataLength - pageSize.value;
	}
	if (start < 0) {
		start = 0;
	}
	let end = start + pageSize.value;
	if (end > dataLength) {
		end = dataLength;
	}
	return filteredData.value.slice(start, end);
	//   return props.data;
});

// 是否显示下载按钮
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
const total = computed(() => (props.remote ? remoteTotal.value : filteredData.value.length));

// 生成操作列
// console.log("props.operationColumns", props.operationColumns);
operationColumns.value.push({
	key: "operations",
	title: t("Table.Operations"),
	cellRenderer: ({ rowIndex, rowData }) => {
		const onEdit = () => {
			// console.log("Edit", rowIndex, rowData);
			form.value = rowData;
			operation.value = "edit";
			dialogFormVisible.value = true;
		};
		const onDelete = () => {
			deleteData(rowIndex, rowData);
		};
		if (props.showOperationColumn !== false) {
			return (
				<>
					{props.showRowEditButton && props.canEdit ? (
						<ElButton size="small" onClick={onEdit}>
							{t("Table.Edit")}
						</ElButton>
					) : (
						<span></span>
					)}
					{props.showRowDeleteButton && props.canDelete ? (
						<ElButton size="small" type="danger" onClick={onDelete}>
							{t("Table.Delete")}
						</ElButton>
					) : (
						<span></span>
					)}
				</>
			);
		}
	},
	width: 150,
	align: "center",
	fixed: true
});

const filterStat = ref({});

/**
 * JqGrid格式的过滤条件
 */

const jqFilterString = computed(() => {
	const filterList = ref([]);
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

// 表格列
const tableColumns = computed(() => {
	if (props.columns.length === 0) {
		return [];
	}

	props.columns.forEach((col) => {
		if (!col.dataType) {
			col.dataType = "text";
		}
		col.headerCellRenderer = (item) => {
			return (
				<div class="flex items-center justify-center">
					<span class="mr-2 text-sm">
						{props.columnTitleI18n ? t(item.column.title) : item.column.title}
					</span>
					<VtHeaderFilter column={col} onFiltered={onFiltered} />
				</div>
			);
		};

		if (col.formatter && typeof col.formatter === "function") {
			// 自定义Cell显示格式
			col.cellRenderer = (data) => {
				return <span>{col.formatter(data)}</span>;
			};
		} else {
			// 默认Cell显示格式
			col.cellRenderer = ({ rowData, rowIndex }) => {
				return (
					<VtCell
						column={col}
						cellValue={rowData[col.dataKey]}
						row={rowData}
						index={rowIndex}
					/>
				);
			};
		}
	});
	// console.log("showOperationColumn", props.showOperationColumn);
	const opColumns = props.showOperationColumn === false ? [] : operationColumns.value;
	// console.log("opCulmns", opColumns)
	return [...opColumns, selectionColumn, ...customColumns.value];
});

const dialogFormVisible = ref(false);
const dialogColumnSelector = ref(false);
const form = ref({});

const loadRemotePromise = (url, page_size, current_page, filters = null, sort = null) => {
	const postData = {
		pageSize: page_size,
		currentPage: current_page,
		filters: filters == null ? null : JSON.stringify(filters)
	};
	if (sort && sort.order != null && sort.name != null) {
		postData.sColumn = sort.name;
		postData.sOrder = sort.order === "ascending" ? "asc" : "desc";
	}

	return new Promise((resolve, reject) => {
		try {
			apiFetch(url, props.accessToken)
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
const loadRemoteData = (url, page_size, current_page, filters = null, sort = null) => {
	loading.value = true;
	loadRemotePromise(url, page_size, current_page, filters, sort)
		.then((data) => {
			localData.value = data.rows;
			remoteTotal.value = data.records;
			cusotmFooterData.value = data.userdata;
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
		props.url,
		pageRows.value,
		currentPage.value,
		jqFilterString.value,
		customOrder.value
	);
}

function deleteData(rowIndex, rowData) {
	if (props.designMode === true) {
		ElMessage.warning(t("Table.DesignMode"));
		return;
	}
	//try {
	ElMessageBox.confirm(t("Table.AreYouSureDelete"), t("Table.Warning"), {
		confirmButtonText: t("Table.OK"),
		cancelButtonText: t("Table.Cancel"),
		type: "warning"
	}).then(() => {
		// console.log("Delete", rowIndex, rowData);
		if (props.remote) {
			// remoteData.value.splice(rowIndex, 1);
			// 远程删除数据
			if (!props.editUrl || props.editUrl.length == 0) {
				ElMessage.error("editUrl is not defined");
				throw new Error("editUrl is not defined");
			}
			try {
				loading.value = true;
				apiFetch(props.editUrl, props.accessToken)
					.post({
						data: rowData,
						operation: "del"
					})
					.then((resp) => {
						if (resp.data?.value === false) {
							ElMessage.error(resp.data.data);
							throw new Error(resp.data.data);
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
	});
	// .catch(() => {
	// 	ElMessage({
	// 		type: "info",
	// 		message: "Delete canceled"
	// 	});
	// });
	// } catch (err) {
	// 	console.error(err);
	// }
}

/**
 * 多选列
 */
const SelectionCell = (data) => {
	const { value, intermediate, onChange } = data;
	return <ElCheckbox onChange={onChange} modelValue={value} indeterminate={intermediate} />;
};
const selectionColumn = {
	key: "selection",
	width: 50,
	align: "center",
	cellRenderer: ({ rowData }) => {
		const onChange = (value) => (rowData.checked = value);
		return <SelectionCell value={rowData.checked} onChange={onChange} />;
	},

	headerCellRenderer: () => {
		const _data = toValue(localData);
		const onChange = (value) =>
			(localData.value = _data.map((row) => {
				row.checked = value;
				return row;
			}));
		const allSelected = _data.every((row) => row.checked);
		const containsChecked = _data.some((row) => row.checked);

		return (
			<SelectionCell
				value={allSelected}
				intermediate={containsChecked && !allSelected}
				onChange={onChange}
			/>
		);
	}
};

const sortState = ref({
	key: "column-0",
	order: TableV2SortOrder.ASC
});

function refreshLocalData() {
	filterData();
	if (props.remote == true) {
		refreshRemoteData();
	} else {
		localData.value = currentPageData.value;
	}
}

function _emptyRow() {
	const row = {};
	props.columns.forEach((col) => {
		if (col.editable === true) {
			if (col.dataType === "select") {
				if (col.editoptions) {
					if (col.editoptions.defaultValue !== undefined) {
						row[col.dataKey] = col.editoptions.defaultValue;
					} else {
						const s_col = col;
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
				if (col.editoptions && col.editoptions.defaultValue !== undefined) {
					row[col.dataKey] = col.editoptions?.defaultValue;
				} else {
					row[col.dataKey] = null;
				}
			}
		} else if (col.editable === false) {
			// editable 为 false ，但有 defaultValue 值时，设置默认值。
			// 应用场景，XX 为需传送到后台的字段，但UI编辑时不需要维护它。
			if (col.editoptions && col.editoptions.defaultValue !== undefined) {
				row[col.dataKey] = col.editoptions?.defaultValue;
			}
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
	operation.value = "add";
	dialogFormVisible.value = true;
	emit("add");
	// emit("operation", "add", {});
}

/**
 * 批量删除
 */
function onDelete() {
	if (props.designMode === true) {
		ElMessage.warning(t("Table.DesignMode"));
		return;
	}

	const selectedRows = localData.value.filter((row) => row.checked);
	// console.log("selectedRows", selectedRows);
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
					const ids = selectedRows.map((row) => row.Id).join(",");
					loading.value = true;
					apiFetch(props.editUrl, props.accessToken)
						.post({
							data: null,
							ids: ids,
							operation: "del"
						})
						.then((resp) => {
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
				} catch (err) {
					console.error(err);
				}
			} else {
				selectedRows.forEach((row) => {
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

function onColumnSort(sortBy) {
	console.log("onColumnSort", sortBy);
	sortState.value = sortBy;
}

function onFiltered(field, val) {
	// console.log("test", field, val);
	if (val == null) {
		delete filterStat.value[field];
	} else {
		filterStat.value[field] = val;
	}
	refreshLocalData();
	// console.log(JSON.stringify(jqFilterString.value));
}

/**
 * 刷新数据，当远程数据时使用
 */
function onRefresh() {
	// console.log("onRefresh");
	refreshRemoteData();
}

/**
 * 修改数据，用于远程修改数据
 * @param {*} val 修改后的值
 */
function onModified(val) {
	// console.log("onModified", val);
	if (props.designMode === true) {
		ElMessage.warning(t("Table.DesignMode"));
		return;
	}
	if (!val) {
		return;
	}
	if (props.remote === true) {
		loading.value = true;
		apiFetch(props.editUrl, props.accessToken)
			.post({
				operation: "edit",
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
				emit("edit", val);
				loading.value = false;
			});
	} else {
		// 本地数据
		switch (operation.value) {
			case "add":
				data.value.push(val);
				emit("add", val);
				break;
			case "edit":
				const index = data.value.indexOf(form.value);
				data.value.splice(index, 1, val);
				emit("edit", form.value);
				break;
			default:
				ElMessage.error("Unsupport operation!");
				break;
		}
		refreshLocalData();
	}
}

/**
 * 显示列选择器
 */
function onShowColumnSelect() {
	// console.log("onColumnSelect");
	dialogColumnSelector.value = true;
}

// 监听当前页码和每页显示条数的变化，变化后从远程加载数据
watch(
	[currentPage, pageSize],
	([current_page, page_size], [old_current_page, old_page_size]) => {
		// console.log("currentPage", current_page);
		// if (current_page !== old_current_page || page_size !== old_page_size) {
		//   router.push({
		//     query: {
		//       page: current_page,
		//       size: page_size,
		//     },
		//   });
		// }
		if (props.remote) {
			loadRemoteData(props.url, page_size, current_page, jqFilterString.value);
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
	[() => props.columns, () => locale.value],
	([newValue, localeValue], [oldValue, oldLocaleValue]) => {
		// console.log("columns", newValue);
		if (newValue) {
			customColumns.value = newValue;
			if (props.remote) {
				cacheSelectOptions(customColumns.value, props.accessToken);
			}
		}
		if (localeValue && props.columnTitleI18n) {
			// 更新多语言
			customColumns.value.forEach((col) => {
				col.title = t(col.title);
			});
		}
	},
	{ immediate: true }
);

onMounted(() => {
	dayjs.extend(localizedFormat);

	if (props.remote === true) {
		refreshRemoteData();
	} else {
		refreshLocalData();
	}
});

// #region 导出数据
const downloading = ref(false);
const showExportDialog = ref(false); // 是否显示导出对话框
const exportRange = ref("c"); // 导出范围。"a"：所有数据；"c"：当前页数据；"s"：选中数据
const exportData = ref([]); // 导出数据

// 导出底部数据
const exportFooterData = computed(() => {
	if (props.exportFooter !== true) return null;
	if (props.exportCustomFooter && props.exportCustomFooter.length > 0) {
		return props.exportCustomFooter;
	} else if (props.userDataOnFooter) {
		return [cusotmFooterData.value];
	}
	return null;
});
// 导出底部公式数据
const exportFormulaFooterData = computed(() => {
	if (props.exportFormulaFooter && props.exportFormulaFooter.length > 0) {
		return props.exportFormulaFooter;
	}
	return null;
});

function onDownload() {
	generateExportData(exportRange.value);
	showExportDialog.value = true;
}

function generateExportData(range) {
	if (range === "c") {
		exportData.value = localData.value; // 当前页的数据
	} else if (range === "s") {
		exportData.value = selectedItems.value;
	} else {
		if (props.remote) {
			downloading.value = true;
			exportData.value = [];
			loadRemotePromise(props.url, 0, 1, jqFilterString.value)
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

// #region 排序数据
/**
 * 对本地数据进行排序
 * @param {String} prop 字段名
 * @param {String | null} order 排序方向，"ascending"：升序；"descending"：降序；null：不排序
 */
function sortLocalData(prop, order) {
	// console.log("sortLocalData", column, prop, order);
	if (order === "ascending") {
		localData.value.sort((a, b) => {
			if (a[prop] > b[prop]) {
				return 1;
			} else if (a[prop] < b[prop]) {
				return -1;
			} else {
				return 0;
			}
		});
	} else if (order === "descending") {
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
function sortRemoteData(prop, order) {
	loadRemoteData(props.url, pageRows.value, currentPage.value, jqFilterString.value, {
		name: prop,
		order: order
	});
}

// function onSortChange({ column, prop, order }) {
// 	customOrder.value.name = prop;
// 	customOrder.value.order = order;
// 	if (props.remote === true) {
// 		sortRemoteData(prop, order);
// 	} else {
// 		sortLocalData(prop, order);
// 	}
// }
// #endregion
</script>

<template>
	<div>
		<div :style="`height: ${height}px`">
			<el-auto-resizer>
				<template #default="{ height, width }">
					<el-table-v2
						v-loading="loading"
						v-bind="$attrs"
						:columns="tableColumns"
						:data="localData"
						:width="width"
						:height="height"
						fixed
						:sort-by="sortState"
						@column-sort="onColumnSort"
					>
						<template #footer>
							<slot name="footer"></slot>
						</template>
						<template #empty>
							<slot name="empty"></slot>
						</template>
					</el-table-v2>
				</template>
			</el-auto-resizer>
		</div>
		<el-scrollbar class="pt-3" v-if="showPagination">
			<el-pagination
				v-model:current-page="currentPage"
				v-model:page-size="pageSize"
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
						@click="onDelete"
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
						style="--el-pagination-button-color: #0d2"
						@click="onDownload"
						v-if="showDownloadButton"
					/>
					<el-divider
						direction="vertical"
						v-if="designMode !== true && showDownloadButton === true"
					/>
					<el-button text @click="onShowColumnSelect" v-if="designMode !== true">
						<div class="i-mdi-table-large text-4"></div>
					</el-button>
					<el-divider direction="vertical" />
				</el-space>
				<!-- <el-space>
          <el-button
            type="default"
            :icon="Search"
            style="--el-pagination-button-color: #0000ff"
          />
          <el-button
            type="default"
            :icon="Share"
            style="--el-pagination-button-color: #ff00ff"
          />
          <el-button
            type="default"
            :icon="Upload"
            style="--el-pagination-button-color: #00ff00"
          />
        </el-space> -->
				<slot name="pagination" :selected-rows="selectedItems"></slot>
			</el-pagination>
		</el-scrollbar>
		<!-- <div>
			{{ filterStat }}
		</div> -->
		<vt-table-dialog
			v-model:data="form"
			v-model:show="dialogFormVisible"
			:columns="columns"
			:operation="operation"
			@confirm="onModified"
		/>
		<VtColumnSelector
			v-model="customColumns"
			v-model:show="dialogColumnSelector"
			:column-title-i18n="columnTitleI18n"
		/>
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
	</div>
</template>
