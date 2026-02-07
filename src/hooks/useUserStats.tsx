// hooks/useUserStats.tsx
import { useQuery } from '@tanstack/react-query';
import { userApi } from '@/api/user';

export function useUserStats() {
    return useQuery({
        queryKey: ['user-game-data'], // 키값도 데이터 성격에 맞게 변경
        queryFn: async () => {
            const { data } = await userApi.getMyData(); // 👈 새로 쪼갠 API 호출
            return data;
        },
        staleTime: 1000 * 30,
    });
}