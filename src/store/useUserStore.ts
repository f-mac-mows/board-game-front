import { UserProfileResponse } from '@/types/auth';
import { create } from 'zustand';
import { persist } from 'zustand/middleware'

interface UserState {
    user: UserProfileResponse | null;
    setUser: (user: UserProfileResponse) => void;
    clearUser: () => void;
}

export const useUserStore = create<UserState>()(
    persist(
        (set) => ({
            user: null,
            setUser: (user) => set({ user }),
            clearUser: () => set({ user: null }),
        }),
        {
            name: 'mows-user-storage',
        }
    )
);