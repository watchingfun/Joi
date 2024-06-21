<script setup lang="tsx">
import { DropdownOption, NButton, NTag } from "naive-ui";
import { PlayerNote } from "@@/types/type";
import PlayerTagSelect from "@/components/PlayerTagSelect.vue";
import playerNotesApi from "@/api/playerNotesApi";
import { useElementSize } from "@vueuse/core";
import lcuApi from "@/api/lcuApi";

import PlayerNoteEdit from "@/components/PlayerNoteEdit.vue";
import { useRouter } from "vue-router";

const props = defineProps<{ puuid?: string }>();

const checkedRowKeysRef = ref<Array<string>>([]);
const dialog = useDialog();
const columns = [
	{
		type: "selection",
		options: [
			{
				label: "删除选中",
				onSelect: (data: any) => {
					let size = checkedRowKeysRef.value.length;
					if (size) {
						dialog.warning({
							title: "警告",
							content: `你确定删除选择的${size}条数据？`,
							positiveText: "确定",
							negativeText: "取消",
							onPositiveClick: () => {
								playerNotesApi.deletePlayerNote(toRaw(checkedRowKeysRef.value)).then((res) => {
									query();
								});
							}
						});
					}
				}
			}
		]
	},
	{
		title: "昵称",
		key: "summonerName",
		width: 100,
		ellipsis: {
			tooltip: true
		},
		render: (row: PlayerNote) => {
			if (row.summonerName) {
				return row.summonerName;
			} else {
				return (
					<n-button
						onclick={(e: Event) => {
							e.stopPropagation();
							updateSummonerName(row);
						}}>
						获取昵称
					</n-button>
				);
			}
		}
	},
	{
		title: "添加时间",
		key: "createTime",
		width: 80,
		ellipsis: {
			tooltip: true
		}
	},
	// {
	//   title: "更新时间",
	//   key: "updateTime",
	//   width: 100,
	//   ellipsis: {
	//     tooltip: true
	//   }
	// },
	{
		title: "标签",
		key: "tags",
		width: 100,
		ellipsis: {
			tooltip: {
				width: 500
			}
		},
		render(row: PlayerNote) {
			return row.tags?.map((tagKey) => {
				return (
					<NTag type="warning" style={{ margin: "3px 6px 3px 0" }} bordered={false}>
						{tagKey}
					</NTag>
				);
			});
		}
	},
	{
		title: "备注",
		key: "remark",
		width: 100,
		ellipsis: {
			tooltip: true
		}
	}
];

const updateSummonerName = async (playerNote: PlayerNote) => {
	playerNote.summonerName = (await lcuApi.getSummonerByPuuid(playerNote.id)).gameName;
	await playerNotesApi.updatePlayerNote(toRaw(playerNote));
};

const loading = ref(false);
const data = ref<PlayerNote[]>([]);
const dataTotal = ref(0);

const paginationReactive = reactive({
	page: 1,
	pageSize: 50,
	showSizePicker: true,
	pageSizes: [50, 100, 300, 500],
	onChange: (page: number) => {
		paginationReactive.page = page;
	},
	onUpdatePageSize: (pageSize: number) => {
		paginationReactive.pageSize = pageSize;
		paginationReactive.page = 1;
	}
});
const dropdownOptions: DropdownOption[] = [
	{
		label: "编辑",
		key: "edit"
	},
	{
		label: () => h("span", { style: { color: "pink" } }, "删除"),
		key: "delete"
	}
];
const xRef = ref(0);
const yRef = ref(0);
const showDropdownRef = ref(false);

function handleSelect(key: string) {
	showDropdownRef.value = false;
	switch (key) {
		case "edit":
			editNote.value = currentContextRow;
			addMode.value = false;
			editShow.value = true;
			break;
		case "delete":
			dialog.warning({
				title: "警告",
				content: `你确定删除选择的数据？`,
				positiveText: "确定",
				negativeText: "取消",
				onPositiveClick: () => {
					playerNotesApi.deletePlayerNote([currentContextRow!.id]).then((res) => query());
				}
			});
			break;
	}
}

function onClickoutside() {
	showDropdownRef.value = false;
}

let currentContextRow: PlayerNote | undefined;
const router = useRouter();
const rowProps = (row: PlayerNote) => {
	return {
		style: "cursor: pointer;",
		onContextmenu: (e: MouseEvent) => {
			currentContextRow = row;
			e.preventDefault();
			showDropdownRef.value = false;
			nextTick().then(() => {
				showDropdownRef.value = true;
				xRef.value = e.clientX;
				yRef.value = e.clientY;
			});
		},
		onClick: (e: PointerEvent) => {
			if ((e.target as HTMLElement)?.classList?.value.includes("n-checkbox-box")) {
				return;
			}
			updateSummonerName(row);
			router.push({ name: "historyMatch", params: { puuid: row.id } });
		}
	};
};
const queryObj = reactive({ summonerName: "", tag: [] } as { summonerName: string; tag: string[] });

function query() {
	loading.value = true;
	const pageObj = toRaw(unref(paginationReactive));
	playerNotesApi
		.queryPlayerNotes({ ...toRaw(unref(queryObj)), start: pageObj.page, size: pageObj.pageSize })
		.then((res) => {
			dataTotal.value = res.total;
			data.value = res.data;
		})
		.finally(() => (loading.value = false));
}

onMounted(() => {
	query();
});

const tableContainer = ref(null);
const { width, height } = useElementSize(tableContainer);
const importLoading = ref(false);
const message = useMessage();
const importNotes = async () => {
	importLoading.value = true;
	try {
		const importNum = await playerNotesApi.importNotes();
		message.info("导入条数:" + importNum);
		query();
	} finally {
		importLoading.value = false;
	}
};
const exportNotes = async () => {
	importLoading.value = true;
	try {
		await playerNotesApi.exportNotes();
	} finally {
		importLoading.value = false;
	}
};

const editShow = ref(false);
const editNote = ref<PlayerNote>();

const addMode = ref(false);

const editNoteLoad = async (puuid: string) => {
	const dbValue = await playerNotesApi.queryPlayerNote(puuid);
	const summonerInfo = await lcuApi.getSummonerByPuuid(puuid);
	if (summonerInfo) {
		if (dbValue) {
			addMode.value = false;
			editNote.value = { ...dbValue, summonerName: summonerInfo.gameName };
		} else {
			addMode.value = true;
			editNote.value = {
				summonerName: summonerInfo.gameName,
				id: puuid,
				createTime: "",
				updateTime: "",
				tags: [],
				gameIds: []
			};
		}
		editShow.value = true;
	}
};

onActivated(() => {
	if (props.puuid) {
		editNoteLoad(props.puuid);
	}
});
</script>

<template>
	<div class="flex flex-col flex-1">
		<div class="m-1.5 flex flex-row justify-between">
			<n-button-group>
				<n-button @click="importNotes" :loading="importLoading">导入</n-button>
				<n-button @click="exportNotes" :loading="importLoading">导出</n-button>
			</n-button-group>

			<n-space>
				<n-input placeholder="请输入玩家昵称" v-model:value="queryObj.summonerName" clearable></n-input>
				<player-tag-select v-model="queryObj.tag" clearable style="width: 300px" :max-tag-count="2"></player-tag-select>
				<n-button @click="query">搜索</n-button>
			</n-space>
		</div>
		<div class="flex-1 shrink" ref="tableContainer">
			<div class="h-0">
				<n-data-table
					size="small"
					:row-key="(row: PlayerNote)=>row.id"
					v-model:checked-row-keys="checkedRowKeysRef"
					:loading="loading"
					:bordered="false"
					:columns="columns"
					:data="data"
					:row-props="rowProps"
					flex-height
					:style="{ height: `${height}px` }" />
				<n-dropdown
					placement="bottom-start"
					trigger="manual"
					:x="xRef"
					:y="yRef"
					:options="dropdownOptions"
					:show="showDropdownRef"
					:on-clickoutside="onClickoutside"
					@select="handleSelect" />
			</div>
		</div>
		<div class="flex-shrink-0 flex flex-row justify-end p-2">
			<n-pagination
				@update-page="query"
				@update:page-size="query"
				v-model:page="paginationReactive.page"
				v-model:page-size="paginationReactive.pageSize"
				:item-count="dataTotal"
				show-size-picker
				:page-sizes="paginationReactive.pageSizes">
				<template #prefix="{ itemCount }"> 共 {{ itemCount }} 条</template>
			</n-pagination>
		</div>
		<player-note-edit v-model:show="editShow" :note="editNote" @submited="query" :addMode="addMode" />
	</div>
</template>

<style scoped></style>
