<script setup lang="ts">
import { PlayerNote } from "@@/types/type";
import { PropType } from "vue";
import PlayerTagSelect from "@/components/PlayerTagSelect.vue";
import playerNotesApi from "@/api/playerNotesApi";

type CreateOptions<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
const emit = defineEmits(["update:show", "submited"]);
const props = defineProps({
	note: {
		type: Object as PropType<CreateOptions<PlayerNote, "createTime" | "updateTime" | "remark" | "tags" | "gameIds">>,
		default: () => ({})
	},
	show: {
		type: Boolean,
		default: false
	},
  addMode: {
		type: Boolean,
		default: false
	}
});

const formValue = ref({}) as Ref<Partial<PlayerNote>>;
const showModelValue = computed({
	get() {
		return props.show;
	},
	set(val: boolean) {
		emit("update:show", val);
	}
});

watch(
	() => props.note,
	(val) => {
		formValue.value = val;
	}
);

const message = useMessage();
const submit = () => {
	if (!formValue.value.id) {
		message.warning("玩家id为空");
		return;
	}
	let note = toRaw(formValue.value);
	note.tags = note.tags || [];
	note.gameIds = note.gameIds || [];
	if (props.addMode) {
		playerNotesApi.addPlayerNote(note as unknown as PlayerNote).then(() => {
			emit("submited");
			showModelValue.value = false;
		});
	} else {
		playerNotesApi.updatePlayerNote(note as unknown as PlayerNote).then(() => {
			emit("submited");
			showModelValue.value = false;
		});
	}
};
</script>

<template>
	<n-modal v-model:show="showModelValue" style="width: 80%" preset="card" title="玩家笔记">
		<div>
			<n-form ref="formRef" :label-width="80" :model="formValue" size="small">
				<n-form-item label="昵称">
					<n-input :value="formValue.summonerName" readonly></n-input>
				</n-form-item>
				<n-form-item label="标签" path="tags">
					<player-tag-select v-model:value="formValue.tags" />
				</n-form-item>
				<n-form-item label="备注" path="remark">
					<n-input type="textarea" v-model:value="formValue.remark" placeholder="备注" />
				</n-form-item>
			</n-form>
		</div>
		<template #footer>
			<div>
				<n-space justify="end">
					<n-button @click="() => (showModelValue = false)">取消</n-button>
					<n-button type="primary" @click="submit"> 确认</n-button>
				</n-space>
			</div>
		</template>
	</n-modal>
</template>

<style scoped></style>
