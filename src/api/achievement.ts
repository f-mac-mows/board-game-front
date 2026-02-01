import api from '@/lib/axios'; // 기존 설정된 axios 인스턴스
import { AchievementResponse, RewardInfo } from '@/types/achievement';

export const achievementApi = {
  /**
   * 내 업적 목록 및 진행 현황 조회
   */
  getMyAchievements: async (): Promise<AchievementResponse[]> => {
    const { data } = await api.get<AchievementResponse[]>('/v1/achievements');
    return data;
  },

  /**
   * 특정 업적의 보상 수령 요청
   */
  claimReward: async (code: string): Promise<RewardInfo> => {
    const { data } = await api.post<RewardInfo>(`/v1/achievements/${code}/claim`);
    return data;
  }
};