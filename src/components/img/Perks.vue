<script setup lang="ts">
import { Stats } from "@@/types/lcuType";
import { toRefs } from "vue";
import RuneImg from "@/components/img/runeImg.vue";
import RuneCard from "@/components/img/runeCardImg.vue";

const props = defineProps<{ stats: Stats }>();
const { stats } = toRefs(props);
</script>

<template>
	<n-tooltip :style="{ maxWidth: '400px' }" :keep-alive-on-hover="false">
		<template #trigger>
			<div>
				<rune-img :rune-id="stats.perk0" style="width: 1.5em; height: 1.5em"></rune-img>
				<rune-img :rune-id="stats.perkSubStyle" style="padding: 2px; width: 1.5em; height: 1.5em"></rune-img>
			</div>
		</template>
		<template #default>
			<div>
				<RuneCard :stats="stats" />
			</div>
		</template>
	</n-tooltip>
</template>

<style scoped></style>
