//https://ddragon.leagueoflegends.com/cdn/13.21.1/data/zh_CN/item.json
//https://ddragon.leagueoflegends.com/api/versions.json
//https://raw.communitydragon.org/latest/game/assets/items/icons2d/
import itemJson from "@/assets/item.json";

export interface ItemData {
    name: string
    description: string
    colloq: string
    plaintext: string
    into: string[]
    image: Image
    gold: Gold
    tags: string[]
    maps: Record<string, boolean>
    stats: Record<string, any>
}

export interface Image {
    full: string
    sprite: string
    group: string
    x: number
    y: number
    w: number
    h: number
}

export interface Gold {
    base: number
    purchasable: boolean
    total: number
    sell: number
}

export const itemsMap = new Map(Object.entries(itemJson.data)) as Map<string, ItemData>
