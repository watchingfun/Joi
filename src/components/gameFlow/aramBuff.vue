<script setup lang="ts">
import { AramChampData } from "@@/types/type";
import useLCUStore from "@/store/lcu";
import { AccessibilityCheckmark20Regular } from "@vicons/fluent";
import { ComputedRef } from "vue";

const props = defineProps<{ champId: number }>();
const lcuStore = useLCUStore();

const champBuffData = computed(() => lcuStore.aramChampBuffMap?.[props.champId]) as ComputedRef<
	AramChampData & {
		[key: string]: string;
	}
>;
</script>

<template>
	<div class="flex flex-1 justify-center items-center">
		<n-descriptions label-placement="top" bordered :column="8" v-if="champBuffData" class="w-full h-full">
			<template v-for="key in Object.keys(champBuffData)" :key="key">
				<n-descriptions-item :label="key" :span="key === '其他' ? 8 : 1" v-if="key !== 'id'">
					{{ champBuffData[key] || "-" }}
				</n-descriptions-item>
			</template>
		</n-descriptions>
		<div v-else class="flex flex-col items-center justify-center h-full">
			<n-icon class="text-xl" :component="AccessibilityCheckmark20Regular" />
			<p class="text-center text-gray-500">没有buff，设计师他觉得已经够平衡了。</p>
		</div>
	</div>
</template>

<style scoped></style>
