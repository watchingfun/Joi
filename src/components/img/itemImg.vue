<template>
	<n-tooltip :style="{ maxWidth: '400px' }" trigger="hover" :keep-alive-on-hover="false" :disabled="!props.itemId">
		<template #trigger>
			<img v-bind="$attrs" :src="url" :class="[props.itemId === 0 ? 'none' : '']" alt="itemImage" />
		</template>
		<div>
			<b>{{ itemsMap.get(String(props.itemId))?.name }}</b>
			<br />
			<span v-html="itemsMap.get(String(props.itemId))?.description"></span>
		</div>
	</n-tooltip>
</template>
<script setup lang="ts">
import { computed } from "vue";
import { itemsMap } from "@/common/lolItem";

defineOptions({
	inheritAttrs: false
});
// computed
const url = computed(() => {
	if (props.itemId === 0) {
		return "./img/blank.png";
	} else return "https://game.gtimg.cn/images/lol/act/img/item/" + props.itemId + ".png";
});
// props
const props = defineProps({
	itemId: { type: Number, required: true }
});
</script>
<style scoped>
.none {
	opacity: 0.3;
}
</style>
