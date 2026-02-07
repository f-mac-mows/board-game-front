import { AccountStat } from '@/types/auth';
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
    astat: AccountStat;
    activeRoomId: number | null;
}

interface UserState {
    user: EssentialUser | null;
    setUser: (user: EssentialUser) => void;
    setCurrentRoomId: (roomId: number | null) => void;
    updateActiveTitle: (titleName: string | null, colorCode: string | null) => void;
    clearUser: () => void;
}

export const useUserStore = create<UserState>()(
    persist(
        (set) => ({
            user: null,

            setUser: (user) => set({ user }),
            setCurrentRoomId: (roomId) => set((state) => ({
                user: state.user ? { ...state.user, activeRoomId: roomId } : null
            })),
            
            updateActiveTitle: (titleName, colorCode) => set((state) => ({
                user: state.user ? {
                    ...state.user,
                    activeTitle: titleName,
                    titleColor: colorCode
                } : null
            })),
            
            clearUser: () => {
                set({ user: null });

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