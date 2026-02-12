"use client";

import { useEffect, useState, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useUserStore } from "@/store/useUserStore";
import { userApi } from "@/api/user";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, setUser, clearUser } = useUserStore();
  const router = useRouter();
  const pathname = usePathname();
  const [isInitialized, setIsInitialized] = useState(false);

  // 1. 현재 경로가 보호된 경로인지 계산 (Memo로 성능 최적화)
  const isProtectedPath = useMemo(() => {
    const protectedPrefixes = ["/rooms", "/game", "/set-nickname", "/user", "/ranking"];
    return protectedPrefixes.some(path => 
      pathname === path || pathname.startsWith(`${path}/`)
    );
  }, [pathname]);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data } = await userApi.getMyInfo(); 
        setUser(data);
      } catch (err) {
        clearUser();
      } finally {
        setIsInitialized(true);
      }
    };
    initAuth();
  }, [setUser, clearUser]);

  // 2. 리다이렉트 로직
  useEffect(() => {
    if (!isInitialized) return;

    if (!user && isProtectedPath) {
      router.replace("/auth/login");
      return;
    }

    if (user) {
      if (!user.profileCompleted && pathname !== "/set-nickname") {
        router.replace("/set-nickname");
        return;
      }
      if (pathname.startsWith("/auth/")) {
        router.replace("/");
        return;
      }

      // [참여 중인 방/게임 이탈 방지 가드]
      if (user.activeRoomId) {
        // 🚩 수정 포인트 1: Yacht뿐만 아니라 모든 게임 페이지를 인식하도록 변경
        const isGamePage = pathname.startsWith("/game/"); 
        
        const roomMatch = pathname.match(/\/rooms\/(\d+)/);
        const targetRoomId = roomMatch ? Number(roomMatch[1]) : null;

        // /rooms 목록으로 가려고 하거나, 현재 참여 중인 방과 다른 상세 페이지로 가려 할 때 리다이렉트
        if (pathname === "/rooms" || (targetRoomId && targetRoomId !== user.activeRoomId)) {
          // 🚩 수정 포인트 2: 현재 게임 중이 아닐 때만 대기실로 리다이렉트
          // (게임 중일 때는 이미 게임 페이지에 있으므로 가두지 않아도 됨)
          if (!isGamePage) {
            router.replace(`/rooms/${user.activeRoomId}`);
          }
        }
      }
    }
  }, [pathname, isInitialized, user, router, isProtectedPath]);

  // 3. [핵심] 렌더링 차단 로직
  // 초기화 중이거나, 로그인이 필요한데 유저가 없는 상태라면 아예 children을 안 보여줌
  if (!isInitialized || (!user && isProtectedPath)) {
    return null; 
  }

  return <>{children}</>;
}