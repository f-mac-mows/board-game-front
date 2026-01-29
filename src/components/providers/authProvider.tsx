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

        // 2. 이탈 방지 가드 (참여 중인 방이 있을 때만 발동)
        if (activeRoomId) {
          // 현재 URL에서 방 ID 추출
          const roomMatch = pathname.match(/\/(?:rooms|game\/yacht)\/(\d+)/);
          const targetId = roomMatch ? Number(roomMatch[1]) : null;

          // [핵심 조건]
          // 1. 참여 중인 방이 있는데, 아예 방과 관련 없는 로비(/rooms)로 나가려 할 때
          // 2. 혹은 다른 방 ID(targetId)로 접근하려 할 때
          const isLeaving = pathname === "/rooms";
          const isAccessingOtherRoom = targetId !== null && targetId !== activeRoomId;

          if (isLeaving || isAccessingOtherRoom) {
            alert("이미 참여 중인 게임이 있습니다. 해당 방으로 복귀합니다.");
            return router.replace(`/rooms/${activeRoomId}`);
          }
        }
        
        // 참여 중인 방(activeRoomId)이 없는 유저는 
        // 자유롭게 /rooms/[id]나 /game/yacht/[id]에 접근하여 관전할 수 있음

      } catch (err) {
        clearUser();
        if (pathname.startsWith("/rooms") || pathname.startsWith("/game") || pathname === "/set-nickname") {
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