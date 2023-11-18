<script setup lang="ts">
import PlayerGameInfo from "@/components/PlayerGameInfo.vue";
import { toRefs } from "vue";
import { GameDetail } from "@@/types/lcuType";

const props = defineProps<{ detail?: GameDetail; puuid?: string }>();
const { detail } = toRefs(props);
defineOptions({
	inheritAttrs: false
});
</script>

<template>
	<div>
		<div class="grid grid-cols-1 grid-rows-10">
			<template v-for="(data, i) in detail?.participants" :key="data.participantId">
				<PlayerGameInfo
					v-bind="$attrs"
					:info="data"
					:play-info="detail!.participantIdentities[i]"
					:class="[
						props.puuid === detail!.participantIdentities[i].player.puuid ? 'highlight-row' : ''
					]"></PlayerGameInfo>
				<n-divider v-if="i === 4"></n-divider>
			</template>
		</div>
	</div>
</template>

<style scoped>
:deep(.n-divider) {
	margin: 8px !important;
}

.highlight-row {
	background: rgba(236, 146, 107, 0.59);
}
</style>
