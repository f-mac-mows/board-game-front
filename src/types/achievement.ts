export type AchievementCategory = 'COMBAT' | 'COLLECTION' | 'SOCIAL' | 'SPECIAL';

export interface Achievement {
    id: string;               // 업적 고유 ID (예: 'win_10_games')
    category: AchievementCategory;
    title: string;            // 업적 이름 (예: "승리의 화신")
    description: string;      // 업적 설명 (예: "게임에서 10번 승리하세요")
    icon: string;             // 아이콘 이름 또는 경로
    maxProgress: number;      // 목표 수치 (예: 10)
    reward: {
        type: 'EXP' | 'GOLD' | 'TITLE';
        value: string | number;
        label: string;        // 보상 이름 (예: "100 Gold", "초보자 칭호")
    };
    isHidden?: boolean;       // 달성 전까지 내용을 비밀로 할지 여부
}

export interface UserAchievement {
    achievementId: string;
    currentProgress: number;  // 현재 진행 수치 (예: 4 / 10)
    isCompleted: boolean;     // 달성 여부
    completedAt?: string;     // 달성 일자
    isRewarded: boolean;      // 보상 수령 여부
}