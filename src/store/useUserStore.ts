import { UserProfileResponse } from '@/types/auth';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserState {
    user: UserProfileResponse | null;
    currentRoomId: number | null;
    setUser: (user: UserProfileResponse) => void;
    setCurrentRoomId: (roomId: number | null) => void;
    updateActiveTitle: (titleName: string | null, colorCode: string | null) => void;
    clearUser: () => void;
}

// store/useUserStore.ts
export const useUserStore = create<UserState>()(
    persist(
        (set, get) => ({ // get 추가
            user: null,
            currentRoomId: null,

            setUser: (user) => set({ 
                user, 
                currentRoomId: user.activeRoomId 
            }),

            setCurrentRoomId: (roomId) => set({ currentRoomId: roomId }),

            updateActiveTitle: (titleName, colorCode) => set((state) => ({
                user: state.user ? {
                    ...state.user,
                    activeTitle: titleName,
                    titleColor: colorCode
                } : null
            })),
            
            clearUser: () => {
                // 1. 상태 즉시 초기화 (가장 먼저 수행하여 훅들의 enabled를 false로 만듦)
                set({ user: null, currentRoomId: null });

                // 2. 쿠키 삭제 함수
                const deleteCookie = (name: string) => {
                    const domains = ['.walrung.com', 'walrung.com', ''];
                    domains.forEach(domain => {
                        const domainPart = domain ? `domain=${domain};` : '';
                        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; ${domainPart}`;
                    });
                };

                deleteCookie('accessToken');
                deleteCookie('refreshToken');
                deleteCookie('JSESSIONID');
                
                // 3. 스토리지 정리
                localStorage.removeItem('mows-user-storage');
                
                // 4. (선택 사항) 세션 스토리지 등 기타 흔적 제거
                sessionStorage.clear();

                console.log("User store cleared.");
            },
        }),
        {
            name: 'mows-user-storage',
            partialize: (state) => ({ user: state.user }),
        }
    )
);