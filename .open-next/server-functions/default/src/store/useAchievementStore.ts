import { create } from 'zustand';
import { AchievementResponse } from '@/types/achievement';

interface AchievementState {
    achievements: AchievementResponse[];
    
    // API로부터 받은 전체 리스트 세팅
    setAchievements: (data: AchievementResponse[]) => void;
    
    // 특정 업적의 진행도 실시간 업데이트 (UI 즉시 반영용)
    updateProgress: (code: string, progress: number) => void;
    
    // 보상 수령 상태 변경
    markAsRewarded: (code: string) => void;
}

export const useAchievementStore = create<AchievementState>((set) => ({
    achievements: [],

    setAchievements: (data) => set({ achievements: data }),

    updateProgress: (code, progress) => set((state) => ({
        achievements: state.achievements.map((a) => {
            if (a.id === code) {
                const isCompleted = progress >= a.maxProgress;
                return {
                    ...a,
                    currentProgress: Math.min(progress, a.maxProgress),
                    isCompleted,
                    completedAt: isCompleted && !a.completed ? new Date().toISOString() : a.completedAt
                };
            }
            return a;
        })
    })),

    markAsRewarded: (code) => set((state) => ({
        achievements: state.achievements.map((a) => 
            a.id === code ? { ...a, rewarded: true } : a
        )
    }))
}));