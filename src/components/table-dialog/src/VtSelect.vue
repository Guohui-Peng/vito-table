<script lang="ts" setup>
import { ElSelect } from "element-plus";
import { parseOptions } from "@/utils";
import type { VtTable } from "@/types";

const props = withDefaults(
	defineProps<{
		modelValue: string | number | boolean;
		column: VtTable.Column<"select">;
	}>(),
	{}
);

const emit = defineEmits<{
	"update:modelValue": [value: string | number | boolean];
}>();

const selectedValue = computed({
	get() {
		return props.modelValue;
	},
	set(val) {
		emit("update:modelValue", val);
	}
});

const options = computed(() => {
	// console.log("options", props.column);
	if (props.column.editoptions && props.column.editoptions.options) {
		return parseOptions(props.column.editoptions.options);
	}
	return [];
});
</script>

<template>
	<el-select v-model="selectedValue" filterable>
		<el-option
			v-for="item in options"
			:key="item.value"
			:label="item.label"
			:value="item.value"
		></el-option>
	</el-select>
</template>
