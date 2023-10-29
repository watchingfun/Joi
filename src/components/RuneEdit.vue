<script setup lang="ts">
import { computed, PropType, reactive } from "vue";
import runesConfigJson from "@/assets/runesReforged.json";
import { CustomRune } from "@@/config/type";
import { runesStatMods } from "@/assets/runesStatMods";
import RoleSelect from "@/components/RoleSelect.vue";
import PositionSelect from "@/components/PositionSelect.vue";
import GameModeSelect from "@/components/GameModeSelect.vue";
import { ReactiveVariable } from "vue/macros";

type editType = "add" | "edit";

const props = defineProps({
  show: { default: false },
  editMode: { type: String as PropType<editType>, default: "add" },
});
const emit = defineEmits(["update:show", "save"]);

const showModel = computed({
  get() {
    return props.show;
  },
  set(value) {
    emit("update:show", value);
  },
});
const close = () => {
  emit("update:show", false);
};

const runeConfig = reactive({
  id: 0,
  primary_page_id: 8100,
  primary_rune_ids: [0, 0, 0, 0],
  secondary_page_id: 8200,
  secondary_rune_ids: [],
  stat_mod_ids: [0, 0, 0],
  enabled: true,
  position: [],
  mode: [],
  role: [],
}) as ReactiveVariable<CustomRune>;

const mainRuneConfig = computed(() => {
  let id = runeConfig.primary_page_id;
  if (id) {
    return runesConfigJson.find((rune) => rune.id === id)?.slots;
  }
  return [];
});

const secondaryRunePageConfig = computed(() => {
  let id = runeConfig.primary_page_id;
  if (id) {
    return runesConfigJson.filter((rune) => rune.id !== id) || [];
  }
  return [];
});

const secondaryRuneConfig = computed(() => {
  let id = runeConfig.secondary_page_id;
  if (id) {
    return runesConfigJson.find((rune) => rune.id === id)?.slots.slice(1) || [];
  }
  return [];
});

const selectPage = (id: number, mainPage: boolean) => {
  if (mainPage) {
    if (runeConfig.primary_page_id !== id) {
      runeConfig.primary_rune_ids = [0, 0, 0, 0];
    }
    //清空副系
    if (runeConfig.secondary_page_id === id) {
      runeConfig.secondary_page_id = 0;
      runeConfig.secondary_rune_ids = [0, 0];
      secondaryRuneIndex = 0;
      secondaryRowSelect = {};
    }
    runeConfig.primary_page_id = id;
  } else {
    if (runeConfig.secondary_page_id !== id) {
      runeConfig.secondary_rune_ids = [0, 0];
    }
    runeConfig.secondary_page_id = id;
  }
};

const selectMainRune = (id: number, index: number) => {
  runeConfig.primary_rune_ids = runeConfig.primary_rune_ids.toSpliced(
    index,
    1,
    id,
  );
  if (index === 0) {
    runeConfig.id = id;
  }
};

let secondaryRuneIndex = 0;
let secondaryRowSelect: Record<number, number> = {};
const selectSecondaryRune = (id: number, index: number) => {
  let selectIds = runeConfig.secondary_rune_ids;
  if (secondaryRowSelect[index]) {
    let i = selectIds.indexOf(secondaryRowSelect[index]);
    runeConfig.secondary_rune_ids = selectIds.toSpliced(i, 1, id);
  } else {
    if (secondaryRuneIndex > 1) {
      secondaryRuneIndex = 0;
    }
    runeConfig.secondary_rune_ids = selectIds.toSpliced(
      secondaryRuneIndex,
      1,
      id,
    );
    secondaryRuneIndex++;
  }
  secondaryRowSelect[index] = id;
};

const selectStatMod = (id: number, index: number) => {
  runeConfig.stat_mod_ids = runeConfig.stat_mod_ids.toSpliced(index, 1, id);
};

const check = () => {
  return !(
    runeConfig.primary_rune_ids.indexOf(0) < 0 ||
    runeConfig.stat_mod_ids.indexOf(0) < 0 ||
    runeConfig.secondary_rune_ids.length !== 2
  );
};

const message = useMessage();
const save = () => {
  if (check()) {
    message.error("符文未配置完整");
    return;
  } else {
    emit("save", toRaw(runeConfig));
  }
};
</script>

<template>
  <n-modal v-model:show="showModel">
    <div
      style="width: 100%; margin: unset; align-self: stretch"
      class="flex flex-col model"
    >
      <div class="flex flex-row flex-nowrap mr-5 ml-5 mt-5 gap-[10px]">
        <n-grid :x-gap="12" :y-gap="8" :cols="2">
          <n-gi span="2">
            <role-select
              multiple
              clearable
              v-model="runeConfig.role"
              placeholder="适用角色"
            ></role-select>
          </n-gi>
          <n-gi>
            <position-select
              multiple
              clearable
              v-model="runeConfig.position"
              placeholder="适用位置"
            ></position-select>
          </n-gi>
          <n-gi>
            <game-mode-select
              multiple
              clearable
              v-model="runeConfig.mode"
              placeholder="适用模式"
            ></game-mode-select>
          </n-gi>
          <n-gi>
            <n-input placeholder="符文名称"></n-input>
          </n-gi>
        </n-grid>
        <n-space>
          <n-button type="primary" @click="save">保存</n-button>
          <n-button v-if="props.editMode === 'edit'" type="error"
            >删除
          </n-button>
          <n-button @click="close">取消</n-button>
        </n-space>
      </div>
      <div class="content flex flex-row">
        <div class="flex flex-col primary_type_page">
          <div class="flex flex-row primary_type_row w-full">
            <n-image
              preview-disabled
              v-for="mainRune of runesConfigJson"
              :key="mainRune.key"
              :src="mainRune.icon.toLowerCase()"
              :class="[
                runeConfig.primary_page_id === mainRune.id ? 'active' : '',
              ]"
              @click="() => selectPage(mainRune.id, true)"
            ></n-image>
          </div>

          <div
            class="flex flex-row primary_rune w-full"
            v-for="({ runes }, i) of mainRuneConfig"
            :key="i"
          >
            <n-image
              preview-disabled
              v-for="rune of runes"
              :key="rune.key"
              :src="rune.icon.toLowerCase()"
              :class="[
                runeConfig.primary_rune_ids.includes(rune.id) ? 'active' : '',
              ]"
              @click="() => selectMainRune(rune.id, i)"
            ></n-image>
          </div>
        </div>

        <div class="flex flex-col second_type_page">
          <div class="flex flex-row second_type_row">
            <n-image
              preview-disabled
              v-for="secondaryRune of secondaryRunePageConfig"
              :key="secondaryRune.key"
              :src="secondaryRune.icon.toLowerCase()"
              :class="[
                runeConfig.secondary_page_id === secondaryRune.id
                  ? 'active'
                  : '',
              ]"
              @click="() => selectPage(secondaryRune.id, false)"
            ></n-image>
          </div>
          <div
            class="flex flex-row second_rune"
            v-for="({ runes }, i) of secondaryRuneConfig"
            :key="i"
          >
            <n-image
              preview-disabled
              v-for="rune of runes"
              :key="rune.key"
              :src="rune.icon.toLowerCase()"
              :class="[
                runeConfig.secondary_rune_ids.includes(rune.id) ? 'active' : '',
              ]"
              @click="() => selectSecondaryRune(rune.id, i)"
            ></n-image>
          </div>

          <div>
            <div
              class="flex flex-row statmods"
              v-for="(statMods, i) of runesStatMods"
              :key="i"
            >
              <n-image
                preview-disabled
                v-for="statMod of statMods"
                :key="statMod.id"
                :src="statMod.icon.toLowerCase()"
                :class="[
                  runeConfig.stat_mod_ids[i] === statMod.id ? 'active' : '',
                ]"
                @click="() => selectStatMod(statMod.id, i)"
              ></n-image>
            </div>
          </div>
        </div>
      </div>
    </div>
  </n-modal>
</template>

<style scoped>
.model {
  backdrop-filter: grayscale(100%) blur(3px);
}

.content {
  height: 361px;
  transition: all 0.5s ease-in-out;
  justify-content: center;
  gap: 10px;
  margin-top: 10px;
}

:deep(.n-image) {
  cursor: pointer;
}

.content :deep(.n-image) {
  filter: grayscale(100%);
}

:deep(.n-image.active) {
  box-shadow: rgb(39 105 175) 0px 0px 30px 0px;
  border-radius: 50%;
  filter: unset;
}

.primary_type_page,
.second_type_page {
  gap: 30px;
  width: 300px;
}

.primary_type_page {
  justify-content: space-between;
}

.primary_type_row,
.primary_rune {
  justify-content: space-evenly;
}

.second_type_row,
.second_rune,
.statmods {
  justify-content: space-evenly;
}

.primary_type_row :deep(img),
.second_type_row :deep(img) {
  width: 40px;
}

.primary_rune:nth-child(2):deep(img) {
  width: 60px;
}

.primary_rune :deep(img),
.second_rune :deep(img) {
  width: 35px;
}
</style>
