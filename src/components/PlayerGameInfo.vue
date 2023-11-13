<script setup lang="ts">
import { Participant, ParticipantIdentity, Player } from "@@/types/lcuType";
import { computed, toRefs } from "vue";
import ChampionImg from "@/components/img/championImg.vue";
import SpellImg from "@/components/img/spellImg.vue";
import ItemImg from "@/components/img/itemImg.vue";
import { DocumentCopy16Regular } from "@vicons/fluent";
import useLCUStore from "@/store/lcu";
import Perks from "@/components/img/Perks.vue";

const props = defineProps<{
	info: Participant;
	playInfo: ParticipantIdentity;
}>();
const { info } = toRefs(props);
const lcuStore = useLCUStore();

const currentSummonerId = computed(() => lcuStore.summonerInfo?.summonerId);
const message = useMessage();

function copyName(name: string) {
	navigator.clipboard.writeText(name).then(() => message.success(`昵称[${name}]已复制`));
}

const emit = defineEmits<{ jumpSummoner: [player: Player] }>();
</script>

<template>
	<div class="relative">
		<div
			:class="[
				'row-item',
				info?.stats.win ? 'win' : 'fail',
				playInfo?.player?.summonerId === currentSummonerId ? 'me' : ''
			]">
			<div class="ml-[10px] avatar cursor-pointer" title="点击头像查看最近战绩">
				<champion-img
					@click="() => emit('jumpSummoner', playInfo?.player)"
					style="width: 40px; height: 40px"
					:level="info?.stats.champLevel"
					:champion-id="info?.championId"></champion-img>
			</div>
			<div
				class="relative inline-flex cursor-pointer"
				style="width: 145px"
				@click="() => copyName(playInfo.player.summonerName)">
				<div
					style="width: 100px; font-size: 12px"
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
				<div class="mr-2 copy" style="position: absolute; top: 0; right: 0; font-size: 18px">
					<DocumentCopy16Regular />
				</div>
			</div>

			<div class="item-group">
				<div class="spell">
					<spell-img :width="10" :spell-id="info?.spell1Id"></spell-img>
					<spell-img :width="10" :spell-id="info?.spell2Id"></spell-img>
				</div>
				<div class="rune">
					<perks :stats="info?.stats"></perks>
				</div>
				<div class="item-group">
					<template v-for="index in [0, 1, 2, 3, 4, 5, 6]" :key="index">
						<item-img
							class="item ml-1"
							:width="20"
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
		all 0.3s ease-in-out,
		background-position 0.2s ease-in-out,
		background-color 0.2s ease-in-out;
	user-select: none;
}

.row-item:hover {
	background-color: #ffffff52;
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
	width: 20px;
}

.rune img {
	width: 20px;
}

.kda-group {
	margin-left: 20px;
	display: grid;
	grid-template-columns: 2fr 2fr 2fr 2fr;
}

.kda-group .kda,
.gold,
.minions,
.damage {
	font-size: 12px;
}

.kda-group .title {
	font-size: 12px;
	color: #fbc8b3;
}

.kda {
	width: 65px;
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
	font-size: 16px;
}

.copy svg {
	width: 1em;
	height: 1em;
}

.me {
	background: #ffffff5c;
	cursor: unset;
}

.summonerName {
	cursor: pointer;
}

.me .summonerName {
	cursor: unset;
}
</style>
