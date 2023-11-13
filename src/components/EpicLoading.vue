<script setup lang="ts">
import { LoopingRhombusesSpinner } from "epic-spinners";
import { TransitionFade } from "@morev/vue-transitions";

const props = defineProps<{ loading: boolean }>();
</script>

<template>
	<div class="relative">
		<transition-fade :offset="[0, 0]" mode="out-in">
			<div
				v-if="props.loading"
				style="
					width: 100%;
					height: 100%;
					position: absolute;
					background-color: rgba(0, 0, 0, 0.3);
					display: flex;
					flex-flow: row;
					align-items: center;
					justify-content: center;
					backdrop-filter: blur(4px);
					z-index: 100;
				">
				<slot name="loading">
					<looping-rhombuses-spinner></looping-rhombuses-spinner>
				</slot>
			</div>
		</transition-fade>
		<div style="width: 100%; height: 100%">
			<slot></slot>
		</div>
	</div>
</template>

<style scoped></style>
