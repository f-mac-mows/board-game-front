"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useUserStore } from "@/store/useUserStore";
import { userApi } from "@/api/user";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, clearUser, setCurrentRoomId } = useUserStore();
  const router = useRouter();
  const pathname = usePathname();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data } = await userApi.getMyInfo(); 
        setUser(data);
        setCurrentRoomId(data.activeRoomId);

        const activeRoomId = data.activeRoomId;

        // 1. 프로필 미설정자 가드
        if (!data.profileCompleted && pathname !== "/set-nickname") {
          return router.replace("/set-nickname");
        }
        if (data.profileCompleted && pathname === "/set-nickname") {
          return router.replace("/");
        }

        // 2. 이탈 방지 가드 강화
        if (activeRoomId) {
          // 게임 페이지(/game/yacht/...)에 있을 때는 가드를 완전히 풉니다.
          // 방 ID와 게임 ID가 다르기 때문에, 여기서 검사하면 100% 튕깁니다.
          const isGamePage = pathname.startsWith("/game/yacht");
          
          if (!isGamePage) {
            const roomMatch = pathname.match(/\/rooms\/(\d+)/);
            const targetRoomId = roomMatch ? Number(roomMatch[1]) : null;

            // 로비 목록(/rooms)으로 가려고 하거나, 내가 참여한 방이 아닌 다른 방으로 갈 때만 복귀
            if (pathname === "/rooms" || (targetRoomId && targetRoomId !== activeRoomId)) {
              alert("참여 중인 방으로 복귀합니다.");
              return router.replace(`/rooms/${activeRoomId}`);
            }
          }
        }
        
      } catch (err) {
        clearUser();
        const protectedPaths = ["/rooms", "/game", "/set-nickname"];
        if (protectedPaths.some(path => pathname.startsWith(path))) {
          router.replace("/auth/login");
        }
      } finally {
        setIsInitialized(true);
      }
    };

    initAuth();
  }, [pathname, setUser, clearUser, setCurrentRoomId, router]);

  if (!isInitialized) return null;

  return <>{children}</>;
}