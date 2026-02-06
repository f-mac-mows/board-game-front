import api from '@/lib/axios';
import { RankingResponse, RankingCriteria } from '@/types/rank';

export const rankingApi = {
    /**
     * 통합 및 게임별 랭킹 조회
     * @param category 'user' 또는 'YACHT' 등
     * @param criteria 'level', 'mmr', 'played'
     * @param page 페이지 번호
     */
    getRankings: async (category: string, criteria: RankingCriteria, page: number = 0) => {
        const response = await api.get<RankingResponse[]>(`/ranking/${category}/${criteria}`, {
            params: { page }
        });
        return response.data;
    }
};