import { userApi } from "@/api/user";
import { UserProfileResponse } from "@/types/auth";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";

// hooks/useMe.ts
export function useMe<TData = UserProfileResponse>(
    options?: Omit<UseQueryOptions<UserProfileResponse, Error, TData>, 'queryKey' | 'queryFn'>
) {
    // 1. 브라우저 환경인지 확인
    const isClient = typeof window !== 'undefined';
    const hasToken = isClient && document.cookie.includes('accessToken');

    return useQuery<UserProfileResponse, Error, TData>({
        queryKey: ['user-profile'],
        queryFn: async () => {
            const { data } = await userApi.getMyInfo();
            return data;
        },
        staleTime: 1000 * 60,
        // ✨ 클라이언트이고 토큰이 있을 때만 실행하도록 강제
        enabled: isClient && !!hasToken, 
        retry: false,
        ...options,
    });
}