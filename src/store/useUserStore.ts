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

            // 로그인 시 유저 정보와 현재 참여 중인 방 ID를 동시에 업데이트
            setUser: (user) => set({ 
                user, 
                currentRoomId: user.activeRoomId // DTO의 값을 스토어에 반영
            }),

            setCurrentRoomId: (roomId) => set({ currentRoomId: roomId }),

            clearUser: () => {
                // Zustand 상태 초기화
                set({ user: null, currentRoomId: null });

                // 쿠키 삭제
                const deleteCookie = (name: string) => {
                    const domains = ['.walrung.ddns.net', 'walrung.ddns.net', ''];
                    domains.forEach(domain => {
                        const domainPart = domain ? `domain=${domain};` : '';
                        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; ${domainPart}`;
                    });
                };

                deleteCookie('accessToken');
                deleteCookie('refreshToken');
                deleteCookie('JSESSIONID');
                
                // 로컬 스토리지 강제 초기화
                localStorage.removeItem('mows-user-storage');
            },
        }),
        {
            name: 'mows-user-storage',
            partialize: (state) => ({ user: state.user }),
        }
    )
);