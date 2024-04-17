<script setup lang="ts">
import { ref } from "vue";
const color = ref<"red" | "blue">();

color.value = "red";
</script>

<template>
	<div>
        <h1>组件测试！</h1>
        <div>{{ color }}</div>
    </div>
</template>
