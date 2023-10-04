import {defineStore} from "pinia";
import {ref} from "vue";
import dayjs from "dayjs";

const useAppStore = defineStore("app", () => {
    const bootTime = ref(dayjs());

    return {bootTime};
});
export default useAppStore;
