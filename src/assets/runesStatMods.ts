import { flatMap } from "lodash";

export type RuneStatMod = {
	id: number;
	name: string;
	desc: string;
	icon: string;
};

export const runesStatMods: RuneStatMod[][] = [
	[
		{
			id: 5008,
			name: "适应之力",
			desc: "+9 <lol-uikit-tooltipped-keyword key='LinkTooltip_Description_Adaptive'><font color='#48C4B7'>适应之力</font></lol-uikit-tooltipped-keyword>",
			icon: "perk-images/StatMods/StatModsAdaptiveForceIcon.png"
		},
		{
			id: 5005,
			name: "攻击速度",
			desc: "+10%攻击速度",
			icon: "perk-images/StatMods/StatModsAttackSpeedIcon.png"
		},
		{
			id: 5007,
			name: "技能急速",
			desc: "+8<lol-uikit-tooltipped-keyword key='LinkTooltip_Description_CDR'>技能急速</lol-uikit-tooltipped-keyword> ",
			icon: "perk-images/StatMods/StatModsCDRScalingIcon.png"
		}
	],
	[
		{
			id: 5008,
			name: "适应之力",
			desc: "+9 <lol-uikit-tooltipped-keyword key='LinkTooltip_Description_Adaptive'><font color='#48C4B7'>适应之力</font></lol-uikit-tooltipped-keyword>",
			icon: "perk-images/StatMods/StatModsAdaptiveForceIcon.png"
		},
		{
			id: 5010,
			name: "移动速度",
			desc: "+2% <lol-uikit-tooltipped-keyword key='LinkTooltip_Description_MS'>移动速度</lol-uikit-tooltipped-keyword>",
			icon: "perk-images/StatMods/StatModsMovementSpeedIcon.png"
		},
		{
			id: 5001,
			name: "成长生命值",
			desc: "+10-180生命值(基于等级)",
			icon: "perk-images/StatMods/StatModsHealthPlusIcon.png"
		}
	],
	[
		{
			id: 5011,
			name: "生命值",
			desc: "+65生命值",
			icon: "perk-images/StatMods/StatModsHealthScalingIcon.png"
		},
		{
			id: 5013,
			name: "韧性和减速抗性",
			desc: "+10%韧性和减速抗性",
			icon: "perk-images/StatMods/StatModsTenacityIcon.png"
		},
		{
			id: 5001,
			name: "成长生命值",
			desc: "+10-180生命值(基于等级)",
			icon: "perk-images/StatMods/StatModsHealthPlusIcon.png"
		}
	]
];

export const runesStatModMap = flatMap(runesStatMods).reduce((map: Map<number, RuneStatMod>, obj: RuneStatMod) => {
	map.set(obj.id, obj);
	return map;
}, new Map<number, RuneStatMod>());
