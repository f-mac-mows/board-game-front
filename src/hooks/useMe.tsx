import { useQuery } from '@tanstack/react-query';
import { userApi } from '@/api/user';
import { useUserStore } from '@/store/useUserStore';
import { useEffect } from 'react';

export function useMe() {
    const { setUser } = useUserStore();

    // 브라우저 쿠키에서 accessToken 존재 여부를 간단히 체크하는 함수 (선택 사항)
    const hasToken = typeof document !== 'undefined' && document.cookie.includes('accessToken');

    const query = useQuery({
        queryKey: ['user-profile'],
        queryFn: async () => {
            const { data } = await userApi.getMyInfo();
            return data;
        },
        staleTime: 1000 * 60 * 5,
        // ✨ 핵심: 토큰이 있거나, 이미 스토어에 유저 정보 시도가 필요한 상황에서만 활성화
        // 하지만 로그아웃 시에는 이 값이 false가 되어야 합니다.
        enabled: !!hasToken, 
        // 에러 발생 시(401 등) 재시도하지 않음 (로그아웃된 상태에서 계속 시도 방지)
        retry: false, 
    });

    useEffect(() => {
        if (query.data) {
            setUser(query.data);
        }
    }, [query.data, setUser]);

    return query;
}