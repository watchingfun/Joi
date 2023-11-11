import { LatestReleases } from "@/common/github";
import useAppStore from "@/store/app";

export const fetchLatestReleases = async () => {
  const response = await fetch(
    `https://api.github.com/repos/watchingfun/Joi/releases/latest?time=${new Date().getTime()}`,
  );
  if (response.ok) {
    return (await response.json()) as LatestReleases;
  } else {
    throw new Error("获取最新Releases失败：" + response.statusText);
  }
};

export const checkUpdate = async () => {
  try {
    const latest = await fetchLatestReleases();
    if (compareVersion(__APP_VERSION__, latest.tag_name) === -1) {
      window.ipcRenderer.send(
        "open-url",
        "https://github.com/watchingfun/Joi/releases/latest",
      );
      return false;
    } else {
      useAppStore().message.success("当前已最新版");
      return true;
    }
  } catch (e) {
    console.log(e);
    useAppStore().message.error("检查更新失败:" + e);
  }
};

function compareVersion(version1: string, version2: string) {
  const newVersion1 =
    `${version1}`.split(".").length < 3
      ? `${version1}`.concat(".0")
      : `${version1}`;
  const newVersion2 =
    `${version2}`.split(".").length < 3
      ? `${version2}`.concat(".0")
      : `${version2}`;

  //计算版本号大小,转化大小
  function toNum(a: string) {
    const c = a.toString().split(".");
    const num_place = ["", "0", "00", "000", "0000"],
      r = num_place.reverse();
    for (let i = 0; i < c.length; i++) {
      const len = c[i].length;
      c[i] = r[len] + c[i];
    }
    return c.join("");
  }

  //检测版本号是否需要更新
  function checkPlugin(a: string, b: string) {
    const numA = toNum(a);
    const numB = toNum(b);
    return numA > numB ? 1 : numA < numB ? -1 : 0;
  }

  return checkPlugin(newVersion1, newVersion2);
}
