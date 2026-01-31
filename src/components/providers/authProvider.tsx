"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useUserStore } from "@/store/useUserStore";
import { userApi } from "@/api/user";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, setUser, clearUser, setCurrentRoomId } = useUserStore();
  const router = useRouter();
  const pathname = usePathname();
  const [isInitialized, setIsInitialized] = useState(false);

useEffect(() => {
  const initAuth = async () => {
    try {
      // 1. 페이지 로드 시 무조건 서버에 현재 쿠키가 유효한지 묻습니다.
      const { data } = await userApi.getMyInfo(); 
      setUser(data);
    } catch (err) {
      // 2. 만약 401 등이 발생하면 로컬 스토리지와 쿠키를 싹 비웁니다.
      clearUser();
    } finally {
      // 3. 서버 확인이 끝난 후에야 가드 로직을 가동합니다.
      setIsInitialized(true);
    }
  };
  initAuth();
}, []);

  // 2. 페이지 접근 권한 가드 (pathname 변경 시마다)
  useEffect(() => {
    if (!isInitialized) return;

    // 인증이 필요 없는 '공개' 경로들
    const isPublicPath = pathname === "/" || pathname.startsWith("/auth/");
    // 로그인이 반드시 필요한 경로들
    const isProtectedPath = ["/rooms", "/game", "/set-nickname"].some(path => pathname.startsWith(path));

    // Case 1: 로그인이 안 된 유저가 보호된 경로에 들어왔을 때
    if (!user && isProtectedPath) {
      // 여기서 한 번만 로그인 페이지로 보냅니다.
      router.replace("/auth/login");
      return;
    }

    // Case 2: 로그인 된 유저의 추가 가드
    if (user) {
      // 프로필 설정 가드
      if (!user.profileCompleted && pathname !== "/set-nickname") {
        router.replace("/set-nickname");
        return;
      }

      // 이미 로그인했는데 로그인 페이지로 가려는 경우
      if (pathname.startsWith("/auth/")) {
        router.replace("/");
        return;
      }

      // 참여 중인 방 이탈 방지 가드
      if (user.activeRoomId) {
        const isGamePage = pathname.startsWith("/game/yacht");
        const roomMatch = pathname.match(/\/rooms\/(\d+)/);
        const targetRoomId = roomMatch ? Number(roomMatch[1]) : null;

        if (pathname === "/rooms" || (targetRoomId && targetRoomId !== user.activeRoomId)) {
          if (!isGamePage) {
            router.replace(`/rooms/${user.activeRoomId}`);
          }
        }
      }
    }
  }, [pathname, isInitialized, user, router]);

  if (!isInitialized) return null;

  return <>{children}</>;
}