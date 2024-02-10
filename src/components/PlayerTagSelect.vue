<script setup lang="ts">
import { computed, PropType } from "vue";
import playerNotesApi from "@/api/playerNotesApi";

const props = defineProps({
	modelValue: {
		type: Object as PropType<Array<string> | null>,
		default: undefined
	},
	multiple: { type: Boolean, default: false }
});
const options = ref<{ label: string; value: string }[]>([]);

const emit = defineEmits(["update:model-value"]);

const value = computed({
	get() {
		return props.modelValue;
	},
	set(value) {
		emit("update:model-value", value);
	}
});
const loading = ref(false);
onMounted(() => {
	loading.value = true;
	playerNotesApi
		.getAllTag()
		.then((res) => {
      console.log(res)
      options.value = res.map((s) => ({ label: s, value: s }))
    })
		.finally(() => {
			loading.value = false;
		});
});
</script>

<template>
	<n-select v-bind="$attrs" v-model:value="value" filterable multiple tag :options="options" :loading="loading" placeholder="请选择玩家标签"/>
</template>

<style scoped></style>
