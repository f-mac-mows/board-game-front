import { create } from 'zustand';
import { Achievement, UserAchievement } from '@/types/achievement';

interface AchievementState {
  allAchievements: Achievement[];
  userAchievements: UserAchievement[];
  
  // 데이터 초기화
  setInitialData: (all: Achievement[], user: UserAchievement[]) => void;
  
  // 진행도 실시간 업데이트 (클라이언트 UI 반영용)
  updateUserProgress: (achievementId: string, progress: number) => void;
}

export const useAchievementStore = create<AchievementState>((set) => ({
  allAchievements: [],
  userAchievements: [],

  setInitialData: (all, user) => set({ allAchievements: all, userAchievements: user }),

  updateUserProgress: (achievementId, progress) => set((state) => ({
    userAchievements: state.userAchievements.map(ua => 
      ua.achievementId === achievementId 
        ? { ...ua, currentProgress: progress, isCompleted: progress >= (state.allAchievements.find(a => a.id === achievementId)?.maxProgress || 0) }
        : ua
    )
  }))
}));