import { useQuery } from '@tanstack/react-query';
import { rankingApi } from '@/api/ranking';
import { RankingCriteria } from '@/types/rank';

export const useRanking = (category: string, criteria: RankingCriteria, page: number) => {
    return useQuery({
        queryKey: ['rankings', category, criteria, page],
        queryFn: () => rankingApi.getRankings(category, criteria, page),
        placeholderData: (previousData) => previousData, // 페이지 전환 시 부드럽게 유지
    });
};