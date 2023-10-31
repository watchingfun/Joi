import { flatMap } from "lodash";

export type RuneStatMod = {
  id: number;
  name: string;
  icon: string;
};

export const runesStatMods: RuneStatMod[][] = [
  [
    {
      id: 5008,
      name: "Adaptive",
      icon: "perk-images/StatMods/StatModsAdaptiveForceIcon.png",
    },
    {
      id: 5005,
      name: "AttackSpeed",
      icon: "perk-images/StatMods/StatModsAttackSpeedIcon.png",
    },
    {
      id: 5007,
      name: "CDRScaling",
      icon: "perk-images/StatMods/StatModsCDRScalingIcon.png",
    },
  ],
  [
    {
      id: 5008,
      name: "Adaptive",
      icon: "perk-images/StatMods/StatModsAdaptiveForceIcon.png",
    },
    {
      id: 5002,
      name: "Armor",
      icon: "perk-images/StatMods/StatModsArmorIcon.png",
    },
    {
      id: 5003,
      name: "MagicRes",
      icon: "perk-images/StatMods/StatModsMagicResIcon.png",
    },
  ],
  [
    {
      id: 5001,
      name: "HealthScaling",
      icon: "perk-images/StatMods/StatModsHealthScalingIcon.png",
    },
    {
      id: 5002,
      name: "Armor",
      icon: "perk-images/StatMods/StatModsArmorIcon.png",
    },
    {
      id: 5003,
      name: "MagicRes",
      icon: "perk-images/StatMods/StatModsMagicResIcon.png",
    },
  ],
];

export const runesStatModMap = flatMap(runesStatMods).reduce(
  (map: Map<number, RuneStatMod>, obj: RuneStatMod) => {
    map.set(obj.id, obj);
    return map;
  },
  new Map<number, RuneStatMod>(),
);
