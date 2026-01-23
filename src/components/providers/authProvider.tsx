"use client";

import { useEffect } from "react";
import { useUserStore } from "@/store/useUserStore";
import { userApi } from "@/api/user";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
    const { setUser, clearUser } = useUserStore();

    useEffect(() => {
        const initAuth = async () => {
            try {
                // 쿠키(accessToken)를 기반으로 내 정보 요청
                const response = await userApi.getMyInfo();
                setUser(response.data);
            } catch (err) {
                // 토큰이 만료되었거나 없을 경우
                clearUser();
            }
        };

        initAuth();
    }, []);

    return <>{children}</>;
}