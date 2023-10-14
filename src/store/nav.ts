import { defineStore } from "pinia";
import { ref } from "vue";
import router from "@/router";

const useNavStore = defineStore("nav", () => {
  const navMenus = ref([
    {
      key: "/index",
      name: "主页",
    },
    {
      key: "/inGame",
      name: "对局",
    },
    {
      key: "/historyMatch",
      name: "历史战绩",
    },
  ]);

  const activeKey = ref<string>(navMenus.value[0].key);

  function updateActiveKey(key: string) {
    activeKey.value = key;
  }

  return { navMenus, activeKey, updateActiveKey };
});

export default useNavStore;
