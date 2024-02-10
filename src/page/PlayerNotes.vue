<script setup lang="tsx">
import { DropdownOption, NButton, NTag } from "naive-ui";
import { PlayerNote } from "@@/types/type";
import PlayerTagSelect from "@/components/PlayerTagSelect.vue";

const columns = [
	{
		title: "昵称",
		key: "summonerName",
		width: 100,
		ellipsis: {
			tooltip: true
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
			tooltip: true
		},
		render(row: PlayerNote) {
			return row.tags.map((tagKey) => {
				return (
					<NTag type="warning" style={{ marginRight: "6px" }} bordered={false}>
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

const data: PlayerNote[] = [
	{
		summonerName: "test1",
		createTime: "2024-02-10 13:24:00",
		updateTime: undefined,
		id: "1",
		gameIds: [],
		tags: ["测试", "演员", "菜狗", "骂人", "故意送人头"],
		remark: "测试备注"
	},
	{
		summonerName: "test2",
		createTime: "2024-02-10 13:24:00",
		updateTime: undefined,
		id: "1",
		gameIds: [],
		tags: ["测试", "演员", "故意送人头"],
		remark: "测试备注"
	},
	{
		summonerName: "test3",
		createTime: "2024-02-10 13:24:00",
		updateTime: undefined,
		id: "1",
		gameIds: [],
		tags: ["测试", "演员"],
		remark: "测试备注11111111111111111111111111111111111111111111111111"
	}
];
const total = 3;
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
	console.log(key, currentContextRow);
	showDropdownRef.value = false;
}

function onClickoutside() {
	showDropdownRef.value = false;
}

let currentContextRow: PlayerNote | undefined;

const rowProps = (row: PlayerNote) => {
	return {
		onContextmenu: (e: MouseEvent) => {
			currentContextRow = row;
			e.preventDefault();
			showDropdownRef.value = false;
			nextTick().then(() => {
				showDropdownRef.value = true;
				xRef.value = e.clientX;
				yRef.value = e.clientY;
			});
		}
	};
};
</script>

<template>
	<div class="flex flex-col flex-1">
		<div class="m-1.5 flex flex-row justify-between">
			<n-button-group>
				<n-button>新增</n-button>
				<n-button>导入</n-button>
				<n-button>导出</n-button>
			</n-button-group>

			<n-space>
				<n-input placeholder="请输入玩家昵称"></n-input>
				<player-tag-select  clearable style="width: 300px" :max-tag-count="2"></player-tag-select>
        <n-button>搜索</n-button>
			</n-space>
		</div>
		<div class="flex-1">
			<n-data-table :bordered="false" :columns="columns" :data="data" :row-props="rowProps" />
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
		<div class="flex-shrink-0 flex flex-row justify-end p-2">
			<n-pagination
				v-model:page="paginationReactive.page"
				v-model:page-size="paginationReactive.pageSize"
				:page-count="total"
				show-size-picker
				:page-sizes="paginationReactive.pageSizes" />
		</div>
	</div>
</template>

<style scoped></style>
