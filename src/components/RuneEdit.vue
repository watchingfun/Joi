<script setup lang="ts">
import { computed, PropType, Ref } from "vue";
import runesReforged from "@/assets/runesReforged.json";
import { CustomRune, RunesDBObj } from "@@/types/type";
import { runesStatMods } from "@/assets/runesStatMods";
import RoleSelect from "@/components/RoleSelect.vue";
import PositionSelect from "@/components/PositionSelect.vue";
import GameModeSelect from "@/components/GameModeSelect.vue";
import { TransitionSlide } from "@morev/vue-transitions";
import { InputInst } from "naive-ui";

type editType = "add" | "edit";

//按客户端的顺序排序
const runesSort = [8000, 8100, 8200, 8400, 8300];

const runesConfigJson = runesReforged.toSorted((a, b) => {
	return runesSort.findIndex((id) => id === a.id) - runesSort.findIndex((id) => id === b.id);
});

const props = defineProps({
	show: { default: false },
	editMode: { type: String as PropType<editType>, default: "add" },
	rune: { type: Object as PropType<RunesDBObj>, required: false }
});
const emit = defineEmits(["update:show", "save"]);

const showModel = computed({
	get() {
		return props.show;
	},
	set(value) {
		emit("update:show", value);
	}
});
const close = () => {
	emit("update:show", false);
};

const defaultRuneConfig = {
	id: 0,
	name: "",
	primary_page_id: 8200,
	primary_rune_ids: [0, 0, 0, 0],
	secondary_page_id: 0,
	secondary_rune_ids: [],
	stat_mod_ids: [0, 0, 0],
	enabled: true,
	position: [],
	mode: [],
	role: []
};

const runeConfig = ref(props.rune?.value || defaultRuneConfig) as Ref<CustomRune>;

watch(
	() => props.rune,
	() => {
		runeConfig.value = props.rune?.value || defaultRuneConfig;
	}
);

const mainRuneConfig = computed(() => {
	let id = runeConfig.value.primary_page_id;
	if (id) {
		return runesConfigJson.find((rune) => rune.id === id)?.slots;
	}
	return [];
});

const secondaryRunePageConfig = computed(() => {
	let id = runeConfig.value.primary_page_id;
	if (id) {
		return runesConfigJson.filter((rune) => rune.id !== id) || [];
	}
	return [];
});

const secondaryRuneConfig = computed(() => {
	let id = runeConfig.value.secondary_page_id;
	if (id) {
		return runesConfigJson.find((rune) => rune.id === id)?.slots.slice(1) || [];
	}
	return [];
});

const selectPage = (id: number, mainPage: boolean) => {
	if (mainPage) {
		if (runeConfig.value.primary_page_id !== id) {
			runeConfig.value.primary_rune_ids = [0, 0, 0, 0];
		}
		if (runeConfig.value.secondary_page_id === id) {
			runeConfig.value.secondary_page_id = 0;
			runeConfig.value.secondary_rune_ids = [];
			queue = [];
		}
		runeConfig.value.primary_page_id = id;
	} else {
		if (runeConfig.value.secondary_page_id !== id) {
			runeConfig.value.secondary_rune_ids = [];
			queue = [];
		}
		runeConfig.value.secondary_page_id = id;
	}
};

const selectMainRune = (id: number, index: number) => {
	runeConfig.value.primary_rune_ids = runeConfig.value.primary_rune_ids.toSpliced(index, 1, id);
	if (index === 0) {
		runeConfig.value.id = id;
	}
};

let queue: Record<number, number>[] = [];
const selectSecondaryRune = (id: number, index: number) => {
	let sameRowIndex = queue.findIndex((i) => Object.keys(i).includes(String(index)));
	if (sameRowIndex !== -1) {
		queue = queue.toSpliced(sameRowIndex, 1);
	}
	if (queue.length === 2) {
		queue.shift();
	}
	queue.push({ [index]: id });
	runeConfig.value.secondary_rune_ids = queue.flatMap((i) => Object.values(i));
};

const selectStatMod = (id: number, index: number) => {
	runeConfig.value.stat_mod_ids = runeConfig.value.stat_mod_ids.toSpliced(index, 1, id);
};

const checkIncomplete = () => {
	return (
		runeConfig.value.primary_rune_ids.indexOf(0) != -1 ||
		runeConfig.value.stat_mod_ids.indexOf(0) != -1 ||
		runeConfig.value.secondary_rune_ids.length !== 2
	);
};

const message = useMessage();

const runeNameInput = ref<InputInst | null>(null);

const save = () => {
	if (!runeConfig.value.name) {
		runeNameInput.value?.focus();
		message.error("符文名不能为空！");
		return;
	}
	if (checkIncomplete()) {
		message.error("符文未配置完整");
		return;
	} else {
		emit("save", toRaw(unref(runeConfig.value)), props.rune?.id);
	}
};
</script>

<template>
	<n-modal v-model:show="showModel" :auto-focus="false">
		<div style="width: 100%; margin: unset; align-self: stretch" class="flex flex-col model">
			<div class="flex flex-row flex-nowrap mr-5 ml-5 mt-5 gap-[10px] items-center">
				<n-grid :x-gap="12" :y-gap="8" :cols="2">
					<n-gi span="2">
						<role-select multiple clearable v-model="runeConfig.role" placeholder="适用角色"></role-select>
					</n-gi>
					<n-gi>
						<position-select multiple clearable v-model="runeConfig.position" placeholder="适用位置"></position-select>
					</n-gi>
					<n-gi>
						<game-mode-select multiple clearable v-model="runeConfig.mode" placeholder="适用模式"></game-mode-select>
					</n-gi>
					<n-gi>
						<n-input placeholder="符文名称" v-model:value="runeConfig.name" ref="runeNameInput"></n-input>
					</n-gi>
				</n-grid>
				<n-space>
					<n-button type="primary" @click="save">保存</n-button>
					<n-button v-if="props.editMode === 'edit'" type="error">删除</n-button>
					<n-button @click="close">取消</n-button>
				</n-space>
			</div>
			<div class="content flex flex-row">
				<div class="flex flex-col primary_type_page">
					<div class="flex flex-row primary_type_row w-full">
						<n-tooltip trigger="hover" v-for="mainRune of runesConfigJson" :key="mainRune.key">
							<template #trigger>
								<n-image
									lazy
									preview-disabled
									:src="mainRune.icon.toLowerCase()"
									:class="[runeConfig.primary_page_id === mainRune.id ? 'active' : '']"
									@click="() => selectPage(mainRune.id, true)"></n-image>
							</template>
							{{ mainRune.name }}
						</n-tooltip>
					</div>

					<transition-slide mode="out-in" class="flex-1 flex flex-col justify-between" :offset="[-16, 0]">
						<div :key="runeConfig.primary_page_id" class="flex-1 flex flex-col justify-between">
							<div
								class="flex flex-row primary_rune w-full"
								v-for="({ runes }, i) of mainRuneConfig"
								:key="i + runeConfig.primary_page_id"
								:class="i === 0 ? 'base-rune' : ''">
								<n-tooltip
									:style="{ maxWidth: '400px' }"
									trigger="hover"
									:keep-alive-on-hover="false"
									v-for="rune of runes"
									:key="rune.key">
									<template #trigger>
										<n-image
											lazy
											preview-disabled
											:src="rune.icon.toLowerCase()"
											:class="[runeConfig.primary_rune_ids.includes(rune.id) ? 'active' : '']"
											@click="() => selectMainRune(rune.id, i)"></n-image>
									</template>
									<div>
										<b>{{ rune.name }}</b>
										<br />
										<div v-html="rune.longDesc"></div>
									</div>
								</n-tooltip>
							</div>
						</div>
					</transition-slide>
				</div>

				<div class="flex flex-col second_type_page">
					<div class="flex flex-row second_type_row">
						<n-tooltip
							placement="bottom"
							trigger="hover"
							v-for="secondaryRune of secondaryRunePageConfig"
							:key="secondaryRune.key">
							<template #trigger>
								<n-image
									lazy
									preview-disabled
									:src="secondaryRune.icon.toLowerCase()"
									:class="[runeConfig.secondary_page_id === secondaryRune.id ? 'active' : '']"
									@click="() => selectPage(secondaryRune.id, false)"></n-image>
							</template>
							{{ secondaryRune.name }}
						</n-tooltip>
					</div>

					<transition-slide mode="out-in" class="flex-1 flex flex-col" :offset="[-16, 0]">
						<template v-if="secondaryRuneConfig.length">
							<div :key="runeConfig.secondary_page_id" class="flex-1 flex flex-col justify-between">
								<div
									class="flex flex-row second_rune"
									v-for="({ runes }, i) of secondaryRuneConfig"
									:key="i + runeConfig.secondary_page_id">
									<n-tooltip
										:keep-alive-on-hover="false"
										:style="{ maxWidth: '400px' }"
										placement="bottom"
										trigger="hover"
										v-for="rune of runes"
										:key="rune.key">
										<template #trigger>
											<n-image
												lazy
												preview-disabled
												:src="rune.icon.toLowerCase()"
												:class="[runeConfig.secondary_rune_ids.includes(rune.id) ? 'active' : '']"
												@click="() => selectSecondaryRune(rune.id, i)"></n-image>
										</template>
										<div>
											<b>{{ rune.name }}</b>
											<br />
											<div v-html="rune.longDesc"></div>
										</div>
									</n-tooltip>
								</div>
							</div>
						</template>
						<div v-else class="flex-1 flex">
							<span class="m-auto">请在上方选择副系符文</span>
						</div>
					</transition-slide>

					<div class="flex flex-col gap-[10px]">
						<div class="flex flex-row statmods" v-for="(statMods, i) of runesStatMods" :key="i">
							<n-tooltip
								:keep-alive-on-hover="false"
								:style="{ maxWidth: '400px' }"
								placement="bottom"
								trigger="hover"
								v-for="statMod of statMods"
								:key="statMod.id">
								<template #trigger>
									<n-image
										lazy
										preview-disabled
										:src="statMod.icon.toLowerCase()"
										:class="[runeConfig.stat_mod_ids[i] === statMod.id ? 'active' : '']"
										@click="() => selectStatMod(statMod.id, i)"></n-image>
								</template>
								<div>
									<b>{{ statMod.name }}</b>
									<br />
									{{ statMod.desc }}
								</div>
							</n-tooltip>
						</div>
					</div>
				</div>
			</div>
		</div>
	</n-modal>
</template>

<style scoped>
.model {
	backdrop-filter: grayscale(100%) blur(3px);
}

.content {
	height: 361px;
	transition: filter 0.5s ease-in-out;
	justify-content: center;
	gap: 10px;
	margin-top: 10px;
}

:deep(.n-image) {
	cursor: pointer;
}

.content :deep(.n-image) {
	filter: grayscale(100%);
}

:deep(.n-image.active) {
	border-radius: 50%;
	filter: unset;
}

.primary_type_page,
.second_type_page {
	gap: 30px;
	width: 300px;
}

.primary_type_page {
	justify-content: space-between;
}

.primary_type_row,
.primary_rune {
	justify-content: space-evenly;
}

.second_type_row,
.second_rune,
.statmods {
	justify-content: space-evenly;
}

.primary_type_row :deep(img),
.second_type_row :deep(img) {
	width: 40px;
}

.primary_rune.base-rune :deep(img) {
	width: 60px;
}

.primary_rune :deep(img),
.second_rune :deep(img) {
	width: 35px;
}

:deep(img) {
	-webkit-user-drag: none;
	-khtml-user-drag: none;
	-moz-user-drag: none;
	-o-user-drag: none;
	user-drag: none;
}

:deep(.n-image) {
	position: relative;
	border-radius: 50%;
}

:deep(.n-image::before) {
	content: "";
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	border-radius: 50%;
	transition: 0.5s;
	transform: scale(0.9);
	border: 2px solid rgb(51 150 255);
	z-index: -1;
}

:deep(.n-image.active::before) {
	transform: scale(1.4);
	box-shadow: 0 0 20px 4px rgb(39 105 175);
}

.base-rune:deep(.n-image::before) {
	border: 3px solid rgb(51 150 255);
	transform: scale(0.8);
}

.base-rune:deep(.n-image:hover::before) {
	transform: scale(1);
}

.statmods:deep(.n-image::before) {
	transform: scale(0.9);
}

.statmods:deep(.n-image:hover::before) {
	transform: scale(1);
}

:deep(.n-image:hover::before) {
	transform: scale(1.4);
	box-shadow: 0 0 15px rgb(39 105 175);
}

:deep(.n-image:hover) {
	text-shadow: 0 0 5px rgb(39 105 175);
	filter: unset;
}
</style>
