<script lang="ts" setup>
import { ref, computed, onMounted } from "vue";
import { Search, ArrowRight, Select as SelectIcon } from "@element-plus/icons-vue";
import { useI18n } from "vue-i18n";
import VtStringFilterMore from "./VtStringFilterMore.vue";

import type { VtTable } from "@/types";
import { ElPopover } from "element-plus";

const props = defineProps<{
	column: VtTable.Column<"text">;
	defaultFilter?: string | VtTable.Filter;
}>();

const emit = defineEmits(["filtered"]);

const popoverRef = ref<InstanceType<typeof ElPopover> | null>(null);
const filterMoreRef = ref<InstanceType<typeof ElPopover> | null>(null);
const filterString = ref("");
const { t } = useI18n();

const showFilterMore = ref(false);
const filterMoreString = ref(null);
const field = computed(() => props.column.dataKey || props.column.key);

const filterMoreButtons = ref<VtTable.FilterMoreMenuItem<"button" | "divider">[]>([
	{
		checked: false,
		key: "CustomFilter",
		text: "CustomFilter",
		type: "button"
	},
	{
		type: "divider"
	},
	{
		checked: false,
		key: "bw",
		text: "beginWith",
		type: "button"
	},
	{
		checked: false,
		key: "bn",
		text: "notBeginWith",
		type: "button"
	},
	{
		type: "divider"
	},
	{
		checked: false,
		key: "ew",
		text: "endsWith",
		type: "button"
	},
	{
		checked: false,
		key: "en",
		text: "notEndsWith",
		type: "button"
	},
	{
		type: "divider"
	},
	{
		checked: false,
		key: "cn",
		text: "contains",
		type: "button"
	},
	{
		checked: false,
		key: "nc",
		text: "notContains",
		type: "button"
	}
]);

const moreFiltered = computed(() => filterMoreButtons.value.some((item) => item.checked));

const filtered = computed(() => {
	return moreFiltered.value === true || (filterString.value && filterString.value.length > 0);
});

/**
 * 合并的查询条件
 */
const filteredString = computed(() => {
	if (filtered.value !== true) {
		return null;
	} else {
		if (moreFiltered.value === true) {
			return filterMoreString.value;
		} else {
			return {
				groupOp: "and",
				rules: [
					{
						field: props.column.dataKey,
						op: "bw",
						data: filterString.value
					}
				]
			};
		}
	}
});

/**
 * 清除更多筛选的选择
 */
function clearFilterMoreSelections() {
	filterMoreButtons.value.forEach((item) => {
		item.checked = false;
	});
}

onMounted(() => {
	// 根据默认值设置查询输入框的值
	if (filtered.value !== true) {
		const df = props.defaultFilter;
		if (df) {
			clearFilterMoreSelections();
			if (typeof df === "string") {
				filterString.value = df;
			} else if (df.rules && df.rules.length > 0) {
				filterMoreButtons.value[0].checked = true;
				filterMoreString.value = df;
			}
		}
	}
});

/**
 * 输入框查询
 */
function onFilter() {
	// console.log("onFilter");
	clearFilterMoreSelections();
	filterMoreString.value = null;
	popoverRef.value.hide();

	emit("filtered", field.value, filteredString.value);
}

function onReset() {
	// console.log("onReset");
	filterString.value = "";
	clearFilterMoreSelections();
	filterMoreString.value = null;
	popoverRef.value.hide();
	emit("filtered", field.value, null);
}

let filterButton = null;
let prevFilterButton = null;
let prevFilterString = null;
/**
 * 点击更多筛选的项时的处理逻辑
 * @param {Object} item 当前选择的项
 */
function onFilterMore(item) {
	// console.log("onFilterMore", item);
	// console.log("column", props.column);
	prevFilterButton = filterButton;
	showFilterMore.value = true;
	if (filterButton === null) {
		// 自定义的时候指定op，其它为key
		if (item.key === "CustomFilter") {
			filterMoreString.value = {
				groupOp: "and",
				rules: [{ field: field.value, op: "bw", data: "" }]
			};
		} else {
			filterMoreString.value = {
				groupOp: "and",
				rules: [{ field: field.value, op: item.key, data: "" }]
			};
		}
	} else if (filterButton.key != item.key) {
		filterButton.checked = false;
		prevFilterString = Object.assign({}, filterMoreString.value);
		// 自定义的时候指定op，其它为key
		if (item.key === "CustomFilter") {
			filterMoreString.value = {
				groupOp: "and",
				rules: [{ field: field.value, op: "bw", data: "" }]
			};
		} else {
			filterMoreString.value = {
				groupOp: "and",
				rules: [{ field: field.value, op: item.key, data: "" }]
			};
		}
	}
	filterButton = item;
	filterMoreRef.value.hide();
}

function onCancelFilterMore() {
	// console.log("onCancelFilterMore");
	filterButton = prevFilterButton;
	if (filterButton != null) {
		filterButton.checked = true;
		filterMoreString.value = prevFilterString;
	}
}

function onFilteredMore(val) {
	// console.log("onFilteredMore val", val);
	if (filterButton != null) {
		// 使用更多选择时，清空输入框的值
		filterString.value = "";

		const item = filterButton;
		// 选择其中一项时，取消其它项的选择
		clearFilterMoreSelections();
		item.checked = !item.checked;
	}
	emit("filtered", field.value, val);
}
</script>

<template>
	<div>
		<el-popover ref="popoverRef" trigger="click" :width="200">
			<template #default>
				<div class="vt-filter-wrapper">
					<div class="filter-group">
						<el-popover
							ref="filterMoreRef"
							class="vt-filter-more"
							placement="right-start"
						>
							<template #default>
								<div class="flex" v-for="menu in filterMoreButtons">
									<div class="flex-initial w-15 p-y-[8px]">
										<el-icon
											v-if="menu.checked === true && menu.type !== 'divider'"
										>
											<SelectIcon />
										</el-icon>
									</div>
									<div class="flex-initial w-64">
										<el-button
											text
											style="
												margin-left: 0;
												padding-left: 0;
												padding-right: 20px;
											"
											@click="onFilterMore(menu)"
											v-if="menu.type !== 'divider'"
											>{{ t(`Table.${menu.text}`) }}...</el-button
										>
										<el-divider style="margin: 10px 0" v-else></el-divider>
									</div>
								</div>
							</template>
							<template #reference>
								<div class="flex">
									<div class="flex-initial w-10 mt-1">
										<el-icon v-if="moreFiltered === true">
											<SelectIcon />
										</el-icon>
									</div>
									<div class="flex-initial w-64">
										{{ t("Table.TextFilter") }}
										<el-icon class="float-right">
											<ArrowRight />
										</el-icon>
									</div>
								</div>
							</template>
						</el-popover>
						<el-divider style="margin: 10px 0"></el-divider>
						<el-input
							v-model.lazy="filterString"
							:placeholder="t('Table.Search')"
						></el-input>
					</div>
					<div class="vt-table__string-filter">
						<el-button text @click="onReset">
							{{ t("Table.Reset") }}
						</el-button>
						<el-button text type="primary" :icon="Search" @click="onFilter">
							{{ t("Table.OK") }}
						</el-button>
					</div>
				</div>
			</template>
			<template #reference>
				<div class="cursor-pointer" @click="$event.stopPropagation()">
					<div class="i-mdi-filter-outline" v-if="!filtered"></div>
					<div class="i-mdi-filter" v-else></div>
				</div>
			</template>
		</el-popover>
		<vt-string-filter-more
			v-model:show="showFilterMore"
			v-model:filter="filterMoreString"
			:field="column.dataKey"
			:field-name="column.title"
			@filtered="onFilteredMore"
			@canceled="onCancelFilterMore"
		/>
	</div>
</template>

<style lang="scss">
.vt-table__string-filter {
	border-top: var(--el-border);
	margin: 12px -12px -12px;
	padding: 3px 12px;
	display: flex;
	justify-content: space-between;

	.el-button {
		padding: 10px 20px;
	}
}
</style>
