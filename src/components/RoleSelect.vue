<script setup lang="ts">
import { roleMap } from "@@/lcu/opgg_rank_type";
import { computed, PropType } from "vue";

const props = defineProps({
  modelValue: {
    type: Object as PropType<Array<string | number> | string | number | null>,
    default: undefined,
  },
  multiple: { type: Boolean, default: false },
});
const options = Object.keys(roleMap).map((key) => ({
  label: roleMap[key],
  value: key,
}));

const emit = defineEmits(["update:model-value"]);

const value = computed({
  get() {
    return props.modelValue;
  },
  set(value) {
    emit("update:model-value", value);
  },
});
</script>

<template>
  <n-select
    v-bind="$attrs"
    filterable
    v-model:value="value"
    :multiple="multiple"
    :options="options"
  />
</template>

<style scoped></style>
