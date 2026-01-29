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
          const isGamePage = pathname.startsWith("/game/yacht");
          const isRoomPage = pathname.startsWith("/rooms/");

          if (!isGamePage) {
            const roomMatch = pathname.match(/\/rooms\/(\d+)/);
            const targetRoomId = roomMatch ? Number(roomMatch[1]) : null;

            // 로비(/rooms)로 나가려 하거나, 남의 방에 들어가려 할 때만 복귀
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