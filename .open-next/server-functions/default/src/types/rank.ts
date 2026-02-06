// types/rank.ts

export type RankingCriteria = 'mmr' | 'level' | 'played';

export interface RankingResponse {
    rank: number;
    nickname: string;
    title: string;
    score: number; // mmr, level, 또는 판수가 들어옴
}

export interface RankingRequest {
    page: number;
    size: number;
}