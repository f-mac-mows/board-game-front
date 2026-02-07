// hooks/useUserStats.tsx
import { useMe } from './useMe';
import { UserProfileResponse } from '@/types/auth';

export function useUserStats() {
    return useMe({
        // data가 UserProfileResponse 타입임을 TypeScript에게 알려줍니다.
        select: (data: UserProfileResponse) => ({
            stats: data.stats,
            asset: data.asset,
        })
    });
}