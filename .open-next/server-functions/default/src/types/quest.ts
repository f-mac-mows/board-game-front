import { GameTypeCode } from "./rooms";

export type RewardType = 'EXP' | 'GOLD' | 'POINT';

export interface RewardInfo {
    type: RewardType;
    value: number;
    label: string; // "5,000 Gold"
}

export interface DailyQuest {
    id: string;
    title: string;
    description: string;
    targetValue: number;      // 목표 수치
    reward: RewardInfo;
    taskType: 'PLAY_COUNT' | 'WIN_COUNT' | 'SPECIFIC_GAME'; // 퀘스트 종류
    gameType?: GameTypeCode;        // 특정 게임 전용 퀘스트일 경우
}

export interface UserDailyQuest {
    questId: string;
    currentValue: number;
    completed: boolean;
    claimed: boolean;       // 보상 획득 여부
    lastUpdated: string;      // 초기화 로직을 위한 날짜 확인
}