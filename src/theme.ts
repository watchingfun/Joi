import { GlobalThemeOverrides } from "naive-ui";

export const lightThemeOverrides: GlobalThemeOverrides = {
  common: {
    primaryColor: "#000000",
  },
  // ...
};

export const darkThemeOverrides: GlobalThemeOverrides = {
  common: {
    popoverColor: "rgba(18, 18, 18,  0.75)",
    fontFamily: "NotoSansSC-Regular",
    bodyColor: "transparent",
    textColorBase: "#fff",
    textColor1: "rgba(255, 255, 255, 0.9)",
    textColor2: "rgba(255, 255, 255, 0.82)",
    textColor3: "rgba(255, 255, 255, 0.52)",
    textColorDisabled: "rgba(255, 255, 255, 0.38)",
    primaryColor: "rgb(239,143,95)",
    primaryColorHover: "rgba(255,121,53,0.76)",
    primaryColorPressed: "rgb(239,143,95)",
    primaryColorSuppl: "rgb(239,143,95)",
  },
  Button: {
    textColorPrimary: "#fff",
    textColorHoverPrimary: "rgba(255,255,255,0.75)",
    textColorPressedPrimary: "#fff",
    textColorFocusPrimary: "#fff",
    textColorDisabledPrimary: "#fff",
    textColorTextError: "#fff",
    textColorError: "#fff",
  },
  Message: {
    colorInfo: "rgba(18, 18, 18,  0.75)",
  },
  // ...
};
