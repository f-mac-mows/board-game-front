import api from '@/lib/axios';
import { GameHistory } from '@/types/history';

export const historyApi = {
    getRecentHistories: async () => {
        const res = await api.get<GameHistory[]>('/v1/histories/me');
        return res.data;
    },
    /**
     * 보상 2배 요청 (광고 시청 후 호출)
     */
    claimDoubleReward: async (historyId: string) => {
        return await api.post(`/v1/histories/${historyId}/reward`);
    },
};