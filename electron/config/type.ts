export interface SettingModel {
    exitAsk: boolean;
    exitDirectly: boolean;
    autoAccept: boolean;
    autoAcceptDelay: number;
}

export const settingModelDefault = {exitAsk: true, autoAccept: true, autoAcceptDelay: 0, exitDirectly: false }
