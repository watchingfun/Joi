export interface SummonerInfo {
  accountId: number;
  displayName: string;
  gameName: string;
  internalName: string;
  nameChangeFlag: boolean;
  percentCompleteForNextLevel: number;
  privacy: string;
  profileIconId: number;
  puuid: string;
  rerollPoints: RerollPoints;
  summonerId: number;
  summonerLevel: number;
  tagLine: string;
  unnamed: boolean;
  xpSinceLastLevel: number;
  xpUntilNextLevel: number;
}

export interface RerollPoints {
  currentPoints: number;
  maxRolls: number;
  numberOfRolls: number;
  pointsCostToRoll: number;
  pointsToReroll: number;
}

export interface MatchHistoryQueryResult {
  accountId: number;
  games: Games;
  platformId: string;
}

export interface Games {
  gameBeginDate: string;
  gameCount: number;
  gameEndDate: string;
  gameIndexBegin: number;
  gameIndexEnd: number;
  games: GameDetail[];
}

// export interface Game {
//   gameCreation: number;
//   gameCreationDate: string;
//   gameDuration: number;
//   gameId: number;
//   gameMode: string;
//   gameType: string;
//   gameVersion: string;
//   mapId: number;
//   participantIdentities: ParticipantIdentity[];
//   participants: Participant[];
//   platformId: string;
//   queueId: number;
//   seasonId: number;
//   teams: Team[];
// }

export interface ParticipantIdentity {
  participantId: number;
  player: Player;
}

export interface Player {
  accountId: number;
  currentAccountId: number;
  currentPlatformId: string;
  gameName: string;
  matchHistoryUri: string;
  platformId: string;
  profileIcon: number;
  puuid: string;
  summonerId: number;
  summonerName: string;
  tagLine: string;
}

export interface Participant {
  championId: number;
  highestAchievedSeasonTier: string;
  participantId: number;
  spell1Id: number;
  spell2Id: number;
  stats: Stats;
  teamId: number;
  timeline: Timeline;
}

export interface Stats {
  assists: number;
  causedEarlySurrender: boolean;
  champLevel: number;
  combatPlayerScore: number;
  damageDealtToObjectives?: number;
  damageDealtToTurrets: number;
  damageSelfMitigated: number;
  deaths: number;
  doubleKills: number;
  earlySurrenderAccomplice: boolean;
  firstBloodAssist: boolean;
  firstBloodKill: boolean;
  firstInhibitorAssist: boolean;
  firstInhibitorKill: boolean;
  firstTowerAssist: boolean;
  firstTowerKill: boolean;
  gameEndedInEarlySurrender: boolean;
  gameEndedInSurrender: boolean;
  goldEarned: number;
  goldSpent: number;
  inhibitorKills: number;
  item0: number;
  item1: number;
  item2: number;
  item3: number;
  item4: number;
  item5: number;
  item6: number;
  killingSprees: number;
  kills: number;
  largestCriticalStrike: number;
  largestKillingSpree: number;
  largestMultiKill: number;
  longestTimeSpentLiving: number;
  magicDamageDealt: number;
  magicDamageDealtToChampions: number;
  magicalDamageTaken: number;
  neutralMinionsKilled: number;
  neutralMinionsKilledEnemyJungle: number;
  neutralMinionsKilledTeamJungle: number;
  objectivePlayerScore: number;
  participantId: number;
  pentaKills: number;
  perk0: number;
  perk0Var1: number;
  perk0Var2: number;
  perk0Var3: number;
  perk1: number;
  perk1Var1: number;
  perk1Var2: number;
  perk1Var3: number;
  perk2: number;
  perk2Var1: number;
  perk2Var2: number;
  perk2Var3: number;
  perk3: number;
  perk3Var1: number;
  perk3Var2: number;
  perk3Var3: number;
  perk4: number;
  perk4Var1: number;
  perk4Var2: number;
  perk4Var3: number;
  perk5: number;
  perk5Var1: number;
  perk5Var2: number;
  perk5Var3: number;
  perkPrimaryStyle: number;
  perkSubStyle: number;
  physicalDamageDealt: number;
  physicalDamageDealtToChampions: number;
  physicalDamageTaken: number;
  playerAugment1: number;
  playerAugment2: number;
  playerAugment3: number;
  playerAugment4: number;
  playerScore0: number;
  playerScore1: number;
  playerScore2: number;
  playerScore3: number;
  playerScore4: number;
  playerScore5: number;
  playerScore6: number;
  playerScore7: number;
  playerScore8: number;
  playerScore9: number;
  playerSubteamId: number;
  quadraKills: number;
  sightWardsBoughtInGame: number;
  subteamPlacement: number;
  teamEarlySurrendered: boolean;
  timeCCingOthers: number;
  totalDamageDealt: number;
  totalDamageDealtToChampions: number;
  totalDamageTaken: number;
  totalHeal: number;
  totalMinionsKilled: number;
  totalPlayerScore: number;
  totalScoreRank: number;
  totalTimeCrowdControlDealt: number;
  totalUnitsHealed: number;
  tripleKills: number;
  trueDamageDealt: number;
  trueDamageDealtToChampions: number;
  trueDamageTaken: number;
  turretKills: number;
  unrealKills: number;
  visionScore: number;
  visionWardsBoughtInGame: number;
  wardsKilled: number;
  wardsPlaced: number;
  win: boolean;
}

export interface Timeline {
  creepsPerMinDeltas: CreepsPerMinDeltas;
  csDiffPerMinDeltas: CsDiffPerMinDeltas;
  damageTakenDiffPerMinDeltas: DamageTakenDiffPerMinDeltas;
  damageTakenPerMinDeltas: DamageTakenPerMinDeltas;
  goldPerMinDeltas: GoldPerMinDeltas;
  lane: string;
  participantId: number;
  role: string;
  xpDiffPerMinDeltas: XpDiffPerMinDeltas;
  xpPerMinDeltas: XpPerMinDeltas;
}

export interface CreepsPerMinDeltas {}

export interface CsDiffPerMinDeltas {}

export interface DamageTakenDiffPerMinDeltas {}

export interface DamageTakenPerMinDeltas {}

export interface GoldPerMinDeltas {}

export interface XpDiffPerMinDeltas {}

export interface XpPerMinDeltas {}

export interface TeamRecord {
  bans: Ban[];
  baronKills: number;
  dominionVictoryScore: number;
  dragonKills: number;
  firstBaron: boolean;
  firstBlood: boolean;
  firstDargon: boolean;
  firstInhibitor: boolean;
  firstTower: boolean;
  inhibitorKills: number;
  riftHeraldKills: number;
  teamId: number;
  towerKills: number;
  vilemawKills: number;
  win: string;
}

export interface Ban {
  championId: number;
  pickTurn: number;
}

export interface ChampSelectPhaseSession {
  actions: Action[][];
  allowBattleBoost: boolean;
  allowDuplicatePicks: boolean;
  allowLockedEvents: boolean;
  allowRerolling: boolean;
  allowSkinSelection: boolean;
  bans: Bans;
  benchChampions: any[];
  benchEnabled: boolean;
  boostableSkinCount: number;
  chatDetails: ChatDetails;
  counter: number;
  gameId: number;
  hasSimultaneousBans: boolean;
  hasSimultaneousPicks: boolean;
  isCustomGame: boolean;
  isSpectating: boolean;
  localPlayerCellId: number;
  lockedEventIndex: number;
  myTeam: MyTeam[];
  pickOrderSwaps: any[];
  recoveryCounter: number;
  rerollsRemaining: number;
  skipChampionSelect: boolean;
  theirTeam: TheirTeam[];
  timer: Timer;
  trades: Trade[];
}

export interface Action {
  actorCellId: number;
  championId: number;
  completed: boolean;
  id: number;
  isAllyAction: boolean;
  isInProgress: boolean;
  type: string;
}

export interface Bans {
  myTeamBans: any[];
  numBans: number;
  theirTeamBans: any[];
}

export interface ChatDetails {
  mucJwtDto: MucJwtDto;
  multiUserChatId: string;
  multiUserChatPassword: string;
}

export interface MucJwtDto {
  channelClaim: string;
  domain: string;
  jwt: string;
  targetRegion: string;
}

export interface MyTeam {
  assignedPosition: string;
  cellId: number;
  championId: number;
  championPickIntent: number;
  nameVisibilityType: string;
  obfuscatedPuuid: string;
  obfuscatedSummonerId: number;
  puuid: string;
  selectedSkinId: number;
  spell1Id: number;
  spell2Id: number;
  summonerId: number;
  team: number;
  wardSkinId: number;
}

export interface TheirTeam {
  assignedPosition: string;
  cellId: number;
  championId: number;
  championPickIntent: number;
  nameVisibilityType: string;
  obfuscatedPuuid: string;
  obfuscatedSummonerId: number;
  puuid: string;
  selectedSkinId: number;
  spell1Id: number;
  spell2Id: number;
  summonerId: number;
  team: number;
  wardSkinId: number;
}

export interface Timer {
  adjustedTimeLeftInPhase: number;
  internalNowInEpochMs: number;
  isInfinite: boolean;
  phase: string;
  totalTimeInPhase: number;
}

export interface Trade {
  cellId: number;
  id: number;
  state: string;
}

export interface GameSessionData {
  gameClient: GameClient;
  gameData: GameData;
  gameDodge: GameDodge;
  map: Map;
  phase: string;
}

export interface GameClient {
  observerServerIp: string;
  observerServerPort: number;
  running: boolean;
  serverIp: string;
  serverPort: number;
  visible: boolean;
}

export interface GameData {
  gameId: number;
  gameName: string;
  isCustomGame: boolean;
  password: string;
  playerChampionSelections: PlayerChampionSelection[];
  queue: Queue;
  spectatorsAllowed: boolean;
  teamOne: TeamMember[];
  teamTwo: TeamMember[];
}

export interface PlayerChampionSelection {
  championId: number;
  selectedSkinIndex: number;
  spell1Id: number;
  spell2Id: number;
  summonerInternalName: string;
}

export interface Queue {
  allowablePremadeSizes: number[];
  areFreeChampionsAllowed: boolean;
  assetMutator: string;
  category: string;
  championsRequiredToPlay: number;
  description: string;
  detailedDescription: string;
  gameMode: string;
  gameTypeConfig: GameTypeConfig;
  id: number;
  isRanked: boolean;
  isTeamBuilderManaged: boolean;
  lastToggledOffTime: number;
  lastToggledOnTime: number;
  mapId: number;
  maximumParticipantListSize: number;
  minLevel: number;
  minimumParticipantListSize: number;
  name: string;
  numPlayersPerTeam: number;
  queueAvailability: string;
  queueRewards: QueueRewards;
  removalFromGameAllowed: boolean;
  removalFromGameDelayMinutes: number;
  shortName: string;
  showPositionSelector: boolean;
  spectatorEnabled: boolean;
  type: string;
}

export interface GameTypeConfig {
  advancedLearningQuests: boolean;
  allowTrades: boolean;
  banMode: string;
  banTimerDuration: number;
  battleBoost: boolean;
  crossTeamChampionPool: boolean;
  deathMatch: boolean;
  doNotRemove: boolean;
  duplicatePick: boolean;
  exclusivePick: boolean;
  id: number;
  learningQuests: boolean;
  mainPickTimerDuration: number;
  maxAllowableBans: number;
  name: string;
  onboardCoopBeginner: boolean;
  pickMode: string;
  postPickTimerDuration: number;
  reroll: boolean;
  teamChampionPool: boolean;
}

export interface QueueRewards {
  isChampionPointsEnabled: boolean;
  isIpEnabled: boolean;
  isXpEnabled: boolean;
  partySizeIpRewards: any[];
}

export interface TeamMember {
  championId: number;
  lastSelectedSkinIndex: number;
  profileIconId: number;
  puuid: string;
  selectedPosition: string;
  selectedRole: string;
  summonerId: number;
  summonerInternalName: string;
  summonerName: string;
  teamOwner: boolean;
  teamParticipantId: number;
}

export interface GameDodge {
  dodgeIds: any[];
  phase: string;
  state: string;
}

export interface Map {
  assets: Assets;
  categorizedContentBundles: CategorizedContentBundles;
  description: string;
  gameMode: string;
  gameModeName: string;
  gameModeShortName: string;
  gameMutator: string;
  id: number;
  isRGM: boolean;
  mapStringId: string;
  name: string;
  perPositionDisallowedSummonerSpells: PerPositionDisallowedSummonerSpells;
  perPositionRequiredSummonerSpells: PerPositionRequiredSummonerSpells;
  platformId: string;
  platformName: string;
  properties: Properties;
}

export interface Assets {
  "champ-select-background-sound": string;
  "champ-select-flyout-background": string;
  "champ-select-planning-intro": string;
  "game-select-icon-active": string;
  "game-select-icon-active-video": string;
  "game-select-icon-default": string;
  "game-select-icon-disabled": string;
  "game-select-icon-hover": string;
  "game-select-icon-intro-video": string;
  "gameflow-background": string;
  "gameselect-button-hover-sound": string;
  "icon-defeat": string;
  "icon-defeat-video": string;
  "icon-empty": string;
  "icon-hover": string;
  "icon-leaver": string;
  "icon-victory": string;
  "icon-victory-video": string;
  "music-inqueue-loop-sound": string;
  "notification-background": string;
  "notification-icon": string;
  "parties-background": string;
  "postgame-ambience-loop-sound": string;
  "ready-check-background": string;
  "ready-check-background-sound": string;
  "sfx-ambience-pregame-loop-sound": string;
  "social-icon-leaver": string;
  "social-icon-victory": string;
}

export interface CategorizedContentBundles {}

export interface PerPositionDisallowedSummonerSpells {}

export interface PerPositionRequiredSummonerSpells {}

export interface Properties {
  suppressRunesMasteriesPerks: boolean;
}

export const PageRanges = <const>[1, 2, 3, 4, 5, 6, 7, 8];
export type PageRange = (typeof PageRanges)[number];


export interface GameDetail {
  gameCreation: number
  gameCreationDate: string
  gameDuration: number
  gameId: number
  gameMode: string
  gameType: string
  gameVersion: string
  mapId: number
  participantIdentities: ParticipantIdentity[]
  participants: Participant[]
  platformId: string
  queueId: number
  seasonId: number
  teams: Team[]
}

export interface CreepsPerMinDeltas {}

export interface CsDiffPerMinDeltas {}

export interface DamageTakenDiffPerMinDeltas {}

export interface DamageTakenPerMinDeltas {}

export interface GoldPerMinDeltas {}

export interface XpDiffPerMinDeltas {}

export interface XpPerMinDeltas {}

export interface Team {
  bans: Ban[]
  baronKills: number
  dominionVictoryScore: number
  dragonKills: number
  firstBaron: boolean
  firstBlood: boolean
  firstDargon: boolean
  firstInhibitor: boolean
  firstTower: boolean
  inhibitorKills: number
  riftHeraldKills: number
  teamId: number
  towerKills: number
  vilemawKills: number
  win: string
}

export interface Ban {
  championId: number
  pickTurn: number
}
