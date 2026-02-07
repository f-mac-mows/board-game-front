// useMe.ts 수정
import { useQuery } from '@tanstack/react-query';
import { userApi } from '@/api/user';
import { useUserStore } from '@/store/useUserStore';
import { useEffect, useRef } from 'react';

export function useMe() {
    const { user, setUser } = useUserStore(); // 현재 스토어의 user 가져오기

    const hasToken = typeof document !== 'undefined' && document.cookie.includes('accessToken');

    const query = useQuery({
        queryKey: ['user-profile'],
        queryFn: async () => {
            const { data } = await userApi.getMyInfo();
            return data;
        },
        staleTime: 1000 * 60 * 5,
        enabled: !!hasToken,
        retry: false, 
    });

    useEffect(() => {
        if (query.data) {
            // ✨ 핵심 가드: 현재 스토어의 데이터와 서버 데이터가 다를 때만 업데이트
            // JSON.stringify로 간단하게 값 비교 (성능 최적화 필요 시 개별 필드 비교)
            if (JSON.stringify(user) !== JSON.stringify(query.data)) {
                setUser(query.data);
            }
        }
    }, [query.data, setUser, user]); // user를 의존성에 추가

    return query;
}