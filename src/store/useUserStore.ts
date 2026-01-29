import { UserProfileResponse } from '@/types/auth';
import { create } from 'zustand';
import { persist } from 'zustand/middleware'

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
            clearUser: () => set({ user: null }),
        }),
        {
            name: 'mows-user-storage',
        }
    )
);