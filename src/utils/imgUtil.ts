import { champDict } from "@@/const/lolDataConfig";

//英雄id转图片url
export function champImg(champId: number) {
	return `https://game.gtimg.cn/images/lol/act/img/champion/${champDict[String(champId)]?.alias}.png`;
}
