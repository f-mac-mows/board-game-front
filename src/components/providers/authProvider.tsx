// components/providers/AuthProvider.tsx
"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useUserStore } from "@/store/useUserStore";
import { userApi } from "@/api/user";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, setUser, clearUser } = useUserStore();
  const router = useRouter();
  const pathname = usePathname();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data } = await userApi.getMyInfo();
        setUser(data);
        
        // 닉네임 미설정자 강제 이동
        if (!data.profileCompleted && pathname !== "/set-nickname") {
          router.replace("/set-nickname");
        } 
        // 설정 완료자가 다시 접근 시 차단
        else if (data.profileCompleted && pathname === "/set-nickname") {
          router.replace("/");
        }
      } catch (err) {
        clearUser();
        // 비로그인 유저가 보호된 경로 접근 시
        if (pathname.startsWith("/rooms") || pathname === "/set-nickname") {
          router.replace("/auth/login");
        }
      } finally {
        setIsInitialized(true);
      }
    };

    initAuth();
  }, [pathname, setUser, clearUser, router]); // pathname이 바뀔 때마다 체크

  if (!isInitialized) return null; // 초기 인증 체크 전까지는 아무것도 안 보여줌 (깜빡임 방지)

  return <>{children}</>;
}