// types/log.ts

import { ScoreCategory } from "./game";
import { GameTypeCode } from "./rooms";

// 모든 게임 로그가 공통으로 가지는 필드
export interface BaseGameLog {
    id: string;
    gameId: number;
    gameType: GameTypeCode;
    nickname: string;
    action: string; // ROLL, RECORD, MOVE 등
    timestamp: string;
}

// 요트다이스 전용 로그 데이터
export interface YachtLog extends BaseGameLog {
    gameType: 'YACHT';
    category?: ScoreCategory;
    diceValues?: number[];
}

export type AnyGameLog = YachtLog;