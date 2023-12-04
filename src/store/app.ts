import { defineStore } from "pinia";
import { ref } from "vue";
import dayjs from "dayjs";
import { ConfigProviderProps, createDiscreteApi, darkTheme, lightTheme } from "naive-ui";

const useAppStore = defineStore("app", () => {
	const bootTime = ref(dayjs());
	const themeRef = ref<"light" | "dark">("dark");
	const configProviderPropsRef = computed<ConfigProviderProps>(() => ({
		theme: themeRef.value === "light" ? lightTheme : darkTheme
	}));
	const { message, notification, dialog, loadingBar } = createDiscreteApi(
		["message", "dialog", "notification", "loadingBar"],
		{
			configProviderProps: configProviderPropsRef
		}
	);
	const appVersion = __APP_VERSION__;
	return { bootTime, message, notification, dialog, loadingBar, appVersion };
});
export default useAppStore;
