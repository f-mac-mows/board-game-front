import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 변하지 않는 핵심 정보만 정의
interface EssentialUser {
    email: string;
    nickname: string;
    profileCompleted: boolean;
    createdAt: string;
    activeTitle: string | null;
    titleColor: string | null;
}

interface UserState {
    user: EssentialUser | null;
    currentRoomId: number | null;
    setUser: (user: EssentialUser) => void;
    setCurrentRoomId: (roomId: number | null) => void;
    clearUser: () => void;
}

export const useUserStore = create<UserState>()(
    persist(
        (set) => ({
            user: null,
            currentRoomId: null,

            setUser: (user) => set({ user }),
            setCurrentRoomId: (roomId) => set({ currentRoomId: roomId }),

            clearUser: () => {
                set({ user: null, currentRoomId: null });
                // 쿠키 및 로컬스토리지 정리 로직 (기존과 동일)
                const deleteCookie = (name: string) => {
                    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
                };
                deleteCookie('accessToken');
                deleteCookie('refreshToken');
                localStorage.removeItem('mows-user-storage');
            },
        }),
        {
            name: 'mows-user-storage',
            partialize: (state) => ({ user: state.user }),
        }
    )
);