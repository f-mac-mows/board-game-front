export type AchievementCategory = 'COMBAT' | 'COLLECTION' | 'SOCIAL' | 'SPECIAL';
export type RewardType = 'EXP' | 'GOLD' | 'TITLE';

export interface RewardInfo {
    type: RewardType;
    value: string; // "5000", "DICE_MASTER" 등
    label: string; // "5,000 Gold", "칭호: 주사위의 신"
}

export interface AchievementResponse {
    id: string;               // 백엔드의 code 필드 (비즈니스 키)
    category: AchievementCategory;
    title: string;
    description: string;
    icon: string;             // 이모지 또는 아이콘 경로
    maxProgress: number;
    hidden: boolean;
    reward: RewardInfo;
    
    // 유저별 진행 데이터 (Join 결과)
    currentProgress: number;
    completed: boolean;
    completedAt: string | null; // ISO 8601 string
    rewarded: boolean;
}