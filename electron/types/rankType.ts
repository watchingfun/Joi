export interface RankSummary {
	earnedRegaliaRewardIds: any[];
	highestCurrentSeasonReachedTierSR: string;
	highestPreviousSeasonAchievedDivision: string;
	highestPreviousSeasonAchievedTier: string;
	highestPreviousSeasonEndDivision: string;
	highestPreviousSeasonEndTier: string;
	highestRankedEntry: HighestRankedEntry;
	highestRankedEntrySR: HighestRankedEntrySr;
	queueMap: QueueMap;
	queues: Queue[];
	rankedRegaliaLevel: number;
	seasons: Seasons;
	splitsProgress: SplitsProgress;
}

export interface HighestRankedEntry {
	division: string;
	highestDivision: string;
	highestTier: string;
	isProvisional: boolean;
	leaguePoints: number;
	losses: number;
	miniSeriesProgress: string;
	previousSeasonAchievedDivision: string;
	previousSeasonAchievedTier: string;
	previousSeasonEndDivision: string;
	previousSeasonEndTier: string;
	provisionalGameThreshold: number;
	provisionalGamesRemaining: number;
	queueType: string;
	ratedRating: number;
	ratedTier: string;
	tier: string;
	warnings: any;
	wins: number;
}

export interface HighestRankedEntrySr {
	division: string;
	highestDivision: string;
	highestTier: string;
	isProvisional: boolean;
	leaguePoints: number;
	losses: number;
	miniSeriesProgress: string;
	previousSeasonAchievedDivision: string;
	previousSeasonAchievedTier: string;
	previousSeasonEndDivision: string;
	previousSeasonEndTier: string;
	provisionalGameThreshold: number;
	provisionalGamesRemaining: number;
	queueType: string;
	ratedRating: number;
	ratedTier: string;
	tier: string;
	warnings: any;
	wins: number;
}

export interface QueueMap {
	CHERRY: Cherry;
	RANKED_FLEX_SR: RankedFlexSr;
	RANKED_SOLO_5x5: RankedSolo5x5;
	RANKED_TFT: RankedTft;
	RANKED_TFT_DOUBLE_UP: RankedTftDoubleUp;
	RANKED_TFT_TURBO: RankedTftTurbo;
}

export interface Cherry {
	division: string;
	highestDivision: string;
	highestTier: string;
	isProvisional: boolean;
	leaguePoints: number;
	losses: number;
	miniSeriesProgress: string;
	previousSeasonAchievedDivision: string;
	previousSeasonAchievedTier: string;
	previousSeasonEndDivision: string;
	previousSeasonEndTier: string;
	provisionalGameThreshold: number;
	provisionalGamesRemaining: number;
	queueType: string;
	ratedRating: number;
	ratedTier: string;
	tier: string;
	warnings: any;
	wins: number;
}

export interface RankedFlexSr {
	division: string;
	highestDivision: string;
	highestTier: string;
	isProvisional: boolean;
	leaguePoints: number;
	losses: number;
	miniSeriesProgress: string;
	previousSeasonAchievedDivision: string;
	previousSeasonAchievedTier: string;
	previousSeasonEndDivision: string;
	previousSeasonEndTier: string;
	provisionalGameThreshold: number;
	provisionalGamesRemaining: number;
	queueType: string;
	ratedRating: number;
	ratedTier: string;
	tier: string;
	warnings: any;
	wins: number;
}

export interface RankedSolo5x5 {
	division: string;
	highestDivision: string;
	highestTier: string;
	isProvisional: boolean;
	leaguePoints: number;
	losses: number;
	miniSeriesProgress: string;
	previousSeasonAchievedDivision: string;
	previousSeasonAchievedTier: string;
	previousSeasonEndDivision: string;
	previousSeasonEndTier: string;
	provisionalGameThreshold: number;
	provisionalGamesRemaining: number;
	queueType: string;
	ratedRating: number;
	ratedTier: string;
	tier: string;
	warnings: any;
	wins: number;
}

export interface RankedTft {
	division: string;
	highestDivision: string;
	highestTier: string;
	isProvisional: boolean;
	leaguePoints: number;
	losses: number;
	miniSeriesProgress: string;
	previousSeasonAchievedDivision: string;
	previousSeasonAchievedTier: string;
	previousSeasonEndDivision: string;
	previousSeasonEndTier: string;
	provisionalGameThreshold: number;
	provisionalGamesRemaining: number;
	queueType: string;
	ratedRating: number;
	ratedTier: string;
	tier: string;
	warnings: any;
	wins: number;
}

export interface RankedTftDoubleUp {
	division: string;
	highestDivision: string;
	highestTier: string;
	isProvisional: boolean;
	leaguePoints: number;
	losses: number;
	miniSeriesProgress: string;
	previousSeasonAchievedDivision: string;
	previousSeasonAchievedTier: string;
	previousSeasonEndDivision: string;
	previousSeasonEndTier: string;
	provisionalGameThreshold: number;
	provisionalGamesRemaining: number;
	queueType: string;
	ratedRating: number;
	ratedTier: string;
	tier: string;
	warnings: any;
	wins: number;
}

export interface RankedTftTurbo {
	division: string;
	highestDivision: string;
	highestTier: string;
	isProvisional: boolean;
	leaguePoints: number;
	losses: number;
	miniSeriesProgress: string;
	previousSeasonAchievedDivision: string;
	previousSeasonAchievedTier: string;
	previousSeasonEndDivision: string;
	previousSeasonEndTier: string;
	provisionalGameThreshold: number;
	provisionalGamesRemaining: number;
	queueType: string;
	ratedRating: number;
	ratedTier: string;
	tier: string;
	warnings: any;
	wins: number;
}

export interface Queue {
	division: string;
	highestDivision: string;
	highestTier: string;
	isProvisional: boolean;
	leaguePoints: number;
	losses: number;
	miniSeriesProgress: string;
	previousSeasonAchievedDivision: string;
	previousSeasonAchievedTier: string;
	previousSeasonEndDivision: string;
	previousSeasonEndTier: string;
	provisionalGameThreshold: number;
	provisionalGamesRemaining: number;
	queueType: string;
	ratedRating: number;
	ratedTier: string;
	tier: string;
	warnings: any;
	wins: number;
}

export interface Seasons {
	CHERRY: Cherry2;
	RANKED_FLEX_SR: RankedFlexSr2;
	RANKED_SOLO_5x5: RankedSolo5x52;
	RANKED_TFT: RankedTft2;
	RANKED_TFT_DOUBLE_UP: RankedTftDoubleUp2;
	RANKED_TFT_TURBO: RankedTftTurbo2;
}

export interface Cherry2 {
	currentSeasonEnd: number;
	currentSeasonId: number;
	nextSeasonStart: number;
}

export interface RankedFlexSr2 {
	currentSeasonEnd: number;
	currentSeasonId: number;
	nextSeasonStart: number;
}

export interface RankedSolo5x52 {
	currentSeasonEnd: number;
	currentSeasonId: number;
	nextSeasonStart: number;
}

export interface RankedTft2 {
	currentSeasonEnd: number;
	currentSeasonId: number;
	nextSeasonStart: number;
}

export interface RankedTftDoubleUp2 {
	currentSeasonEnd: number;
	currentSeasonId: number;
	nextSeasonStart: number;
}

export interface RankedTftTurbo2 {
	currentSeasonEnd: number;
	currentSeasonId: number;
	nextSeasonStart: number;
}

export interface SplitsProgress {
	"2": number;
}
