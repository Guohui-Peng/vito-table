<script setup>
import { computed } from "vue";
// import { VtStringFilter, VtDatetimeFilter, VtTimeFilter, VtNumberFilter, VtSelectFilter } from "../filters";
import VtStringFilter from "./VtStringFilter.vue";
import VtNumberFilter from "./VtNumberFilter.vue";
import VtDatetimeFilter from "./VtDatetimeFilter.vue";
import VtSelectFilter from "./VtSelectFilter.vue";
import VtTimeFilter from "./VtTimeFilter.vue";

const props = defineProps({
	column: {
		type: Object,
		required: true
	}
});

const emit = defineEmits(["filtered"]);

const type = computed(() => props.column?.sType || props.column?.dataType || "text");

const isTime = computed(() => (type.value ? type.value.startsWith("time") : false));
const isDatetime = computed(() => (type.value ? type.value.startsWith("date") : false));
const dateType = computed(() =>
	isDatetime.value ? (type.value === "date" ? "date" : "datetime") : type.value
);

function onFiltered(field, val) {
	emit("filtered", field, val);
}
</script>

<template>
	<div class="vt-header-filter">
		<VtNumberFilter
			:column="column"
			@filtered="onFiltered"
			v-if="type === 'int' || type === 'number'"
		/>
		<VtTimeFilter :column="column" @filtered="onFiltered" v-else-if="isTime" />
		<VtDatetimeFilter
			:column="column"
			:dateType="dateType"
			@filtered="onFiltered"
			v-else-if="isDatetime"
		/>
		<VtSelectFilter :column="column" @filtered="onFiltered" v-else-if="type === 'select'" />
		<VtStringFilter :column="column" @filtered="onFiltered" v-else />
	</div>
</template>

<style scoped>
.vt-header-filter{
	display: inline-block;
}
</style>