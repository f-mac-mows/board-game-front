import api from '@/lib/axios';
import { DailyQuest, UserDailyQuest, RewardInfo } from '@/types/quest';

export const questApi = {
    // 오늘의 퀘스트 목록 (진행 상태 포함) 조회
    getDailyQuests: async () => {
        const res = await api.get('/v1/quests');
        return res.data;
    },

    // 보상 수령
    claimReward: async (questId: string): Promise<RewardInfo> => {
        const res = await api.post(`/v1/quests/${questId}/claim`);
        return res.data;
    }
};