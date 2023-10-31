import { defineStore } from "pinia";
import { ref } from "vue";
import dayjs from "dayjs";
import {
  ConfigProviderProps,
  createDiscreteApi,
  darkTheme,
  lightTheme,
} from "naive-ui";

const useAppStore = defineStore("app", () => {
  const bootTime = ref(dayjs());
  const themeRef = ref<"light" | "dark">("light");
  const configProviderPropsRef = computed<ConfigProviderProps>(() => ({
    theme: themeRef.value === "light" ? lightTheme : darkTheme,
  }));
  const { message, notification, dialog, loadingBar } = createDiscreteApi(
    ["message", "dialog", "notification", "loadingBar"],
    {
      configProviderProps: configProviderPropsRef,
    },
  );
  return { bootTime, message, notification, dialog, loadingBar };
});
export default useAppStore;
