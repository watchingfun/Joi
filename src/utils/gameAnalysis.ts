import { GameDetail, TeamMemberInfo } from "@@/types/lcuType";

export function gameAnalysis(teams: TeamMemberInfo[]) {
  teams.forEach((t) => {
    t.score = computeScore(t.gameDetail);
  });
  return teams;
}

export function computeScore(gameDetail?: GameDetail[]) {
  if (!gameDetail || gameDetail.length === 0) {
    return 0;
  }
  return 0;
}
