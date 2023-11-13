import { defineStore } from "pinia";
import { ref } from "vue";
import { flatRoutes } from "@/router";

const useNavStore = defineStore("nav", () => {
	const navMenus = ref(flatRoutes.filter((r) => r.meta).map((r) => ({ key: r.name, name: r.meta?.title })));

	const activeKey = ref<string>(<string>navMenus.value[0].key);

	function updateActiveKey(key: string) {
		activeKey.value = key;
	}

	return { navMenus, activeKey, updateActiveKey };
});

export default useNavStore;
