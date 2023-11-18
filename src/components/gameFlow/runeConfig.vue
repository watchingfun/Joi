<script setup lang="ts">
import RuneCard from "@/components/RuneCard.vue";
import useLCUStore from "@/store/lcu";
import { storeToRefs } from "pinia";

const lcuStore = useLCUStore();
const { applyRune } = lcuStore;
const { loadingRune, opggRunes, customRunes } = storeToRefs(lcuStore);
</script>

<template>
	<n-spin :show="loadingRune" class="flex flex-1">
		<n-tabs style="height: 100%" animated default-value="opgg" justify-content="space-evenly" type="line">
			<n-tab-pane name="opgg" tab="OPGG">
				<n-carousel draggable :slides-per-view="4" :loop="false" :dot-type="'line'">
					<n-carousel-item style="width: 25%; height: 280px; padding-top: 25px" v-for="(rune, i) in opggRunes" :key="i">
						<RuneCard class="rune-card" :rune="rune" @apply="applyRune"></RuneCard>
					</n-carousel-item>
				</n-carousel>
			</n-tab-pane>
			<n-tab-pane name="custom" tab="自定义">
				<n-carousel draggable :slides-per-view="3" :loop="false" :dot-type="'line'">
					<n-carousel-item
						style="width: 25%; height: 280px; padding-top: 25px"
						v-for="(rune, i) in customRunes"
						:key="i">
						<RuneCard class="rune-card" :rune="rune" @apply="applyRune"></RuneCard>
					</n-carousel-item>
				</n-carousel>
			</n-tab-pane>
		</n-tabs>
	</n-spin>
</template>

<style scoped>
.rune-card {
	width: 130px;
}

:deep(.n-spin-content) {
	flex: 1;
}
</style>
