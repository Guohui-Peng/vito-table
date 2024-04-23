<script lang="ts" setup>
import { ref, computed } from "vue";
import { Search } from "@element-plus/icons-vue";
import { useI18n } from "vue-i18n";
import { parseOptions } from "@/utils";

import type { VtTable } from "@/types";
import { ElPopover } from "element-plus";

const props = defineProps<{
	column: VtTable.Column<"select">;
	defaultFilter?: string | VtTable.Filter;
}>();

const emit = defineEmits(["filtered"]);

const popoverRef = ref<InstanceType<typeof ElPopover> | null>(null);
const filterString = ref("");
const { t } = useI18n();

// const options = ref([]);

const show = ref(false); // 是否显示弹出框
const field = computed(() => props.column.dataKey || props.column.key);

const filtered = computed(() => {
	return filterString.value && filterString.value.length > 0;
});

/**
 * 合并的查询条件
 */
const filteredString = computed(() => {
	if (filtered.value !== true) {
		return null;
	} else {
		return {
			groupOp: "and",
			rules: [
				{
					field: props.column.dataKey,
					op: "in",
					data: filterString.value
				}
			]
		};
	}
});

const options = computed(() => {
	return parseOptions(
		props.column.searchoptions?.options || props.column.editoptions?.options || []
	);
});

/**
 * 输入框查询
 */
function onFilter() {
	show.value = false;

	emit("filtered", field.value, filteredString.value);
}

function onReset() {
	filterString.value = "";
	show.value = false;
	emit("filtered", field.value, null);
}

// watch(
// 	() => show.value,
// 	(newVal, oldVal) => {
//         console.log("column changed", newVal);
//         if(newVal === true) {
//             options.value = props.column.searchoptions?.value || props.column.editoptions?.value || [];
//         }
// 	},
// 	{ immediate: true }
// );
</script>

<template>
	<div>
		<el-popover ref="popoverRef" :visible="show" :width="270">
			<template #default>
				<div class="vt-filter-wrapper">
					<div class="filter-group">
						<el-select
							v-model="filterString"
							multiple
							:placeholder="t('Table.Search')"
							style="width: 240px"
						>
							<el-option
								v-for="item in options"
								:key="item.value"
								:label="item.label"
								:value="item.value"
							/>
						</el-select>
					</div>
					<div class="vt-table__select-filter">
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
				<div class="cursor-pointer" @click.stop="show = !show">
					<div class="i-mdi-filter-outline" v-if="!filtered"></div>
					<div class="i-mdi-filter" v-else></div>
				</div>
			</template>
		</el-popover>
	</div>
</template>

<style lang="scss" scoped>
.vt-table__select-filter {
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
