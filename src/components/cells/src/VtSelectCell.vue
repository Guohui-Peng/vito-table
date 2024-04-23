<script lang="ts" setup>
import { computed } from "vue";
import { parseOptions } from "@/utils";

const props = withDefaults(
	defineProps<{
		cellValue: string | number | boolean;
		options?: string | string[];
	}>(),
	{
		options: ""
	}
);

const options = computed(() => parseOptions(props.options));

const label = computed(() => {
	const value = props.cellValue;
	const option = options.value.find((i) => i.value === value);
	return option ? option.label : value;
});
</script>

<template>
	{{ label }}
</template>
