<script setup lang="ts">
import { Participant, ParticipantIdentity, Player } from "@@/types/lcuType";
import { toRefs } from "vue";
import ChampionImg from "@/components/img/championImg.vue";
import SpellImg from "@/components/img/spellImg.vue";
import ItemImg from "@/components/img/itemImg.vue";
import { DocumentCopy16Regular } from "@vicons/fluent";
import Perks from "@/components/img/Perks.vue";

const props = defineProps<{
	info: Participant;
	playInfo: ParticipantIdentity;
}>();
const { info } = toRefs(props);

const message = useMessage();

function copyName(name: string) {
	navigator.clipboard.writeText(name).then(() => message.success(`昵称[${name}]已复制`));
}

const emit = defineEmits<{ jumpSummoner: [player: Player] }>();
</script>

<template>
	<div class="relative">
		<div :class="['row-item', info?.stats.win ? 'win' : 'fail']">
			<div class="ml-[10px] avatar cursor-pointer" title="点击头像查看最近战绩">
				<champion-img
					@click="() => emit('jumpSummoner', playInfo?.player)"
					style="width: 3em; height: 3em"
					:level="info?.stats.champLevel"
					:champion-id="info?.championId"></champion-img>
			</div>
			<div
				class="relative inline-flex cursor-pointer"
				style="width: 8em"
				@click="() => copyName(playInfo.player.summonerName)">
				<div
					style="width: 8em; font-size: 0.8em"
					:title="playInfo.player.summonerName"
					:class="[
						'inline-block',
						'truncate',
						'result',
						'summonerName',
						info?.stats.win ? 'win-result' : 'fail-result'
					]">
					{{ playInfo.player.summonerName }}
				</div>
				<div class="mr-2 copy" style="position: absolute; top: 0; right: 0; font-size: 1em">
					<DocumentCopy16Regular />
				</div>
			</div>

			<div class="item-group">
				<template v-if="info?.stats.perk0">
					<div class="spell">
						<spell-img :spell-id="info?.spell1Id"></spell-img>
						<spell-img :spell-id="info?.spell2Id"></spell-img>
					</div>
					<div class="rune">
						<perks :stats="info?.stats"></perks>
					</div>
				</template>
				<div class="item-group">
					<template v-for="index in [0, 1, 2, 3, 4, 5, 6]" :key="index">
						<item-img
							class="item ml-1"
							style="width: 2em"
							:style="{
								borderRadius: index === 6 ? '50%' : '5px'
							}"
							:itemId="info?.stats['item' + index] as number" />
					</template>
				</div>
			</div>
			<div class="kda-group">
				<div class="title">KDA</div>
				<div class="title">金钱</div>
				<div class="title">补兵</div>
				<div class="title">伤害</div>
				<div class="kda">
					{{ info?.stats.kills }} /
					<span class="text-red-600">{{ info?.stats.deaths }}</span>
					/
					{{ info?.stats.assists }}
				</div>
				<div class="gold">
					{{ info?.stats.goldEarned }}
				</div>
				<div class="minions">
					{{ info?.stats.totalMinionsKilled + info?.stats.neutralMinionsKilled }}
				</div>
				<div class="damage">
					{{ info?.stats.totalDamageDealtToChampions }}
				</div>
			</div>
		</div>
	</div>
</template>

<style scoped>
.row-item {
	height: 55px;
	display: flex;
	flex-flow: row nowrap;
	align-items: center;
	background-color: #ffffff0f;
	transition:
		all 0.2s ease-in-out,
		background-position 0.2s ease-in-out,
		background-color 0.2s ease-in-out;
	user-select: none;
}

.row-item:hover {
	background-color: rgb(255 255 255 / 8%);
	transform: scale(1.02);
}

.date-info {
	position: absolute;
	top: 0;
	right: 0;
	color: #e5e5e5d1;
	margin: 10px 12px 0 0;
}

.min-text {
	font-size: 12px;
}

.row-item:active {
	background-color: rgba(255, 255, 255, 0.53);
	background-position: 0 0 !important;
}

.win {
	background-image: linear-gradient(45deg, #3aff95a1 0%, rgb(255 255 255 / 0%) 35%, rgb(255 255 255 / 0%) 100%);
	background-position: -300px 0;
	background-repeat: no-repeat;
	box-shadow: inset #3aff95a1 8px 0 2px -2px;
	background-color: #4fa18a82;
}

.fail {
	background-image: linear-gradient(
		45deg,
		rgb(255 75 75 / 90%) 0%,
		rgb(255 255 255 / 0%) 35%,
		rgb(255 255 255 / 0%) 100%
	);
	background-position: -300px 0;
	background-repeat: no-repeat;
	box-shadow: inset rgb(255 75 75 / 90%) 8px 0 2px -2px;
	background-color: rgb(161 79 79 / 61%);
}

.win:hover {
	background-position: -100px 0;
}

.fail:hover {
	background-position: -100px 0;
}

.info {
	font-size: 12px;
	width: 120px;
	margin-left: 10px;
}

.info .game-mode {
	font-size: 14px;
	display: inline-block;
	padding: 1px;
	border-radius: 2px;
	box-shadow:
		rgba(50, 50, 93, 0.25) 0px 2px 5px -1px,
		rgba(0, 0, 0, 0.3) 0px 1px 3px -1px;
}

.result {
	margin-left: 10px;
	margin-right: 20px;
}

.win-result {
	text-shadow: 3px 1px 4px rgba(159, 255, 136, 0.45);
}

.fail-result {
	text-shadow: 3px 1px 4px rgba(255, 44, 44, 0.45);
}

.spell img {
	width: 1.2em;
}

.rune :deep(img) {
	width: 1.2em !important;
	height: 1.2em !important;
}

.kda-group {
	flex: 1;
	margin: 0 5px 0 15px;
	display: grid;
	grid-template-columns: 2.5fr 2fr 2fr 2fr;
	grid-gap: 5px;
}

.kda-group .kda,
.gold,
.minions,
.damage {
	font-size: 0.75em;
}

.kda-group .title {
	font-size: 0.85em;
	color: #fbc8b3;
}

.item-group {
	display: flex;
	flex-flow: row nowrap;
	align-self: center;
}

.row-item:hover .copy {
	display: inline-block;
	cursor: pointer;
}

.copy {
	display: none;
	font-size: 1.2em;
}

.copy svg {
	width: 1.2em;
	height: 1.2em;
}

.summonerName {
	cursor: pointer;
}

.me .summonerName {
	cursor: unset;
}
</style>
