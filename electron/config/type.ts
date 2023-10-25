export interface SettingModel {
  exitAsk: boolean;
  exitDirectly: boolean;
  autoAccept: boolean;
  autoAcceptDelay: number;

  [prop: string]: any;
}

export const settingModelDefault: SettingModel = {
  exitAsk: true,
  autoAccept: true,
  autoAcceptDelay: 0,
  exitDirectly: false,
};
