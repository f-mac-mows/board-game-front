// store/useUserStore.ts
import { UserProfileResponse } from '@/types/auth';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserState {
    user: UserProfileResponse | null;
    currentRoomId: number | null;
    setUser: (user: UserProfileResponse) => void;
    setCurrentRoomId: (roomId: number | null) => void;
    clearUser: () => void;
}

export const useUserStore = create<UserState>()(
    persist(
        (set) => ({
            user: null,
            currentRoomId: null,
            setUser: (user) => set({ user }),
            setCurrentRoomId: (roomId) => set({ currentRoomId: roomId}),
            clearUser: () => {
                // 1. Zustand 상태 초기화
                set({ user: null, currentRoomId: null });

                // 2. 쿠키 삭제 (Domain 설정 확인 필수)
                // 브라우저 쿠키 목록에서 확인하신 .walrung.ddns.net 도메인을 명시해야 삭제됩니다.
                const deleteCookie = (name: string) => {
                    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.walrung.ddns.net;`;
                    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
                };

                deleteCookie('accessToken');
                deleteCookie('JSESSIONID');
            },
        }),
        {
            name: 'mows-user-storage',
        }
    )
);