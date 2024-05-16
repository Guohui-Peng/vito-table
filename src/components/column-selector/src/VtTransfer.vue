<script lang="ts" setup>
import { ref, onMounted, computed } from "vue";
import type { TransferDataItem, TransferKey, TransferDirection } from "element-plus";
import Sortable from "./sortable.mjs";

defineOptions({ inheritAttrs: false });

const props = withDefaults(
	defineProps<{
		data: TransferDataItem[];
		modelValue: Array<string | number>;
	}>(),
	{
		data: () => []
	}
);

const emit = defineEmits([
	"update:modelValue",
	"update:data",
	"change",
	"left-check-change",
	"right-check-change"
]);

const data = computed({
	get() {
		return props.data;
	},
	set(newValue) {
		emit("update:data", newValue);
	}
});

const value = computed({
	get() {
		return props.modelValue;
	},
	set(newValue) {
		emit("update:modelValue", newValue);
	}
});

/**
 * 获取左侧列表中的key，用于拖拽排序
 * @param ui_index 显示索引，非data的索引
 */
function getDataIndex(ui_index: number) {
	const leftItems = data.value.filter((f) => !value.value.includes(f.key));
	if (!leftItems || leftItems.length === 0) {
		return -1;
	}
	return getDataIndexByKey(leftItems[ui_index]?.key);
}

/**
 * 根据key获取data中的索引
 * @param key Key值
 */
function getDataIndexByKey(key: TransferKey) {
	if (!key) return -1;
	return data.value.findIndex((f) => f.key === key);
}

const transfer = ref<HTMLDivElement | null>(null);
let dragOutside = false;

onMounted(() => {
	const leftPanel = transfer?.value
		?.getElementsByClassName("el-transfer-panel")[0]
		.getElementsByClassName("el-transfer-panel__body")[0] as any;
	const rightPanel = transfer?.value
		?.getElementsByClassName("el-transfer-panel")[1]
		.getElementsByClassName("el-transfer-panel__body")[0] as any;
	const leftEl = leftPanel?.getElementsByClassName("el-transfer-panel__list")[0];
	const rightEl = rightPanel?.getElementsByClassName("el-transfer-panel__list")[0];
	Sortable.create(leftEl, {
		group: "vt-transfer",
		onAdd(evt: any) {
			dragOutside = true;
			const { oldIndex, newIndex } = evt;
			// console.log("onAdd.left", oldIndex, newIndex);
			// const index = value.value.indexOf(draggingKey.value);
			const oldKey = value.value[oldIndex];
			if (oldKey) {
				value.value.splice(oldIndex, 1);
				// 对data.value进行操作，将元素放到指定位置
				const oldDataIndex = getDataIndexByKey(oldKey);
				const newDataIndex = getDataIndex(newIndex);

				if (oldDataIndex !== -1 && newDataIndex !== -1) {
					const oldItem = data.value[oldDataIndex];
					data.value.splice(oldDataIndex, 1);
					data.value.splice(newIndex, 0, oldItem);
					// console.log("left end", data.value);
				}
			}
		},
		onEnd: (evt: any) => {
			if (dragOutside === true) {
				dragOutside = false;
				return;
			}
			const { oldIndex, newIndex } = evt;
			// console.log("left end", evt);
			// console.log("left end", oldIndex, newIndex);
			// 界面显示的数据，与传过去的数据不一致，需要根据界面显示的索引，获取data中的索引
			const oldDataIndex = getDataIndex(oldIndex);
			const newDataIndex = getDataIndex(newIndex);
			if (oldDataIndex !== -1 && newDataIndex !== -1) {
				[data.value[newDataIndex], data.value[oldDataIndex]] = [
					data.value[oldDataIndex],
					data.value[newDataIndex]
				];
			}
			// console.log("left end", data.value);
		}
	});
	Sortable.create(rightEl, {
		group: "vt-transfer",
		onAdd(evt: any) {
			dragOutside = true;
			const { oldIndex, newIndex } = evt;
			// console.log("onAdd.right", oldIndex, newIndex);
			// event.preventDefault();
			const oldDataIndex = getDataIndex(oldIndex);
			if (oldDataIndex > -1) {
				// 从左边拖拽到右边，新增到指定位置
				const dataKey = data.value[oldDataIndex]?.key;
				value.value.splice(newIndex, 0, dataKey);
			}
			// console.log("right add", value.value);
		},
		onEnd: (evt: any) => {
			if (dragOutside === true) {
				dragOutside = false;
				return;
			}
			const { oldIndex, newIndex } = evt;
			// console.log("right end", oldIndex, newIndex);
			if (value.value[oldIndex]) {
				[value.value[newIndex], value.value[oldIndex]] = [
					value.value[oldIndex],
					value.value[newIndex]
				];
			}
			// console.log("right end", value.value);
		}
	});
});

function onChange(val: TransferKey[], direction: TransferDirection, movedKeys: TransferKey[]) {
	// console.log("onChange", val, direction, movedKeys);
	value.value = val;
	emit("change", val, direction, movedKeys);
}

function onLeftCheckChange(value: TransferKey[], movedKeys?: TransferKey[]) {
	emit("left-check-change", value, movedKeys);
}

function onRightCheckChange(value: TransferKey[], movedKeys?: TransferKey[]) {
	emit("right-check-change", value, movedKeys);
}
</script>

<template>
	<div class="vt-transfer" ref="transfer">
		<el-transfer
			v-bind="$attrs"
			:model-value="value"
			target-order="push"
			:data="data"
			@change="onChange"
			@left-check-change="onLeftCheckChange"
			@right-check-change="onRightCheckChange"
		>
			<template #default="{ option }">
				<div class="pannel-content">
					<span>
						<slot :option="option">{{ option.label }}</slot></span
					>
				</div>
			</template>
			<template #left-footer>
				<slot name="left-footer"></slot>
			</template>
			<template #right-footer>
				<slot name="right-footer"></slot>
			</template>
		</el-transfer>
	</div>
</template>

<style lang="scss">
.vt-transfer {
	.el-transfer__button {
		padding: 0 20px;
	}
}
</style>
