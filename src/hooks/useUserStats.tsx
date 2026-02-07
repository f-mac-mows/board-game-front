// hooks/useUserStats.tsx
import { useMe } from './useMe';
import { UserProfileResponse, StatInfo } from '@/types/auth';

export function useUserStats() {
    return useMe({
        select: (data: UserProfileResponse) => {
            // 원본 데이터 구조가 { stats: [], asset: {} } 인지 확인
            console.log("Select 내부:", data);
            
            const stats = data?.stats || [];
            const asset = data?.asset || { gold: 0, point: 0 };
            
            return { stats, asset };
        }
    });
}