import { useQuery } from '@tanstack/react-query';
import { userApi } from '@/api/user';
import { useUserStore } from '@/store/useUserStore';
import { useEffect } from 'react';

export function useMe() {
    const { setUser } = useUserStore();

    const query = useQuery({
        queryKey: ['user-profile'],
        queryFn: async () => {
            const { data } = await userApi.getMyInfo();
            return data;
        },
        // 데이터가 "신선함"을 유지하는 시간 (필요에 따라 조절)
        staleTime: 1000 * 60 * 5, 
    });

    // 서버 데이터를 스토어에 동기화
    useEffect(() => {
        if (query.data) {
            setUser(query.data);
        }
    }, [query.data, setUser]);

    return query;
}