<script setup lang="ts">
import { GameDetail, Player } from "@@/types/lcuType";
import { toRefs } from "vue";
import GameInfo from "@/components/GameInfo.vue";

const props = defineProps({
	matchHistoryList: { type: Array<GameDetail>, default: [] }
});
const { matchHistoryList } = toRefs(props);
const emit = defineEmits<{
	jumpDetail: [gameId: number, player: Player];
}>();
</script>

<template>
	<div>
		<template v-for="(record, index) in matchHistoryList" :key="record.gameId">
      <div class="h-[6em]">
        <GameInfo
          :record="record"
          @click="() => emit('jumpDetail', record.gameId, record.participantIdentities[0].player)"></GameInfo>
      </div>
			<div class="divider" v-if="index + 1 !== matchHistoryList?.length" />
		</template>
	</div>
</template>

<style scoped>
.divider {
	height: 1px;
	width: 100%;
	margin: 0;
	box-shadow: 0 -1px 0 #ffe3d23d;
}
</style>
