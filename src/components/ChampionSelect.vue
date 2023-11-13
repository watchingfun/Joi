<script setup lang="ts">
import { optionsChampion } from "@@/const/lolDataConfig";
import { computed, PropType } from "vue";

const props = defineProps({
	modelValue: {
		type: Object as PropType<Array<string | number> | string | number | null>,
		default: undefined
	},
	multiple: { type: Boolean, default: false }
});

const emit = defineEmits(["update:model-value"]);

const value = computed({
	get() {
		return props.modelValue;
	},
	set(value) {
		emit("update:model-value", value);
	}
});

function filterFunction(pattern: string, option: any): boolean {
	return (
		option?.label.includes(pattern) ||
		option?.alias.toLowerCase().includes(pattern.toLowerCase()) ||
		option?.title.includes(pattern)
	);
}
</script>

<template>
	<n-select
		v-bind="$attrs"
		filterable
		style="width: 300px"
		:filter="filterFunction"
		v-model:value="value"
		:multiple="multiple"
		:options="optionsChampion" />
</template>

<style scoped></style>
