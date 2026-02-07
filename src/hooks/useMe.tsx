import { useQuery } from '@tanstack/react-query';
import { userApi } from '@/api/user';
import { UserProfileResponse } from '@/types/auth';

export function useMe() {
    const hasToken = typeof document !== 'undefined' && document.cookie.includes('accessToken');

    return useQuery<UserProfileResponse>({
        queryKey: ['user-profile'],
        queryFn: async () => {
            const { data } = await userApi.getMyInfo();
            return data;
        },
        // 데이터가 "신선"하다고 간주되는 시간 (30초)
        // 이 시간 동안은 페이지를 왔다갔다 해도 API를 재호출하지 않습니다.
        staleTime: 1000 * 30, 
        enabled: !!hasToken,
        retry: false,
    });
}