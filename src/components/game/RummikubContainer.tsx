// @/app/game/rummikub/[id]/page.tsx
"use client";

import { useEffect } from "react";
import { useWebSocket } from "@/contexts/WebSocketContext";
import { useRummikubStore } from "@/store/useRummikubStore";
import RummikubGame from "@/components/rummikub/RummikubGame";

export default function RummikubPage({ gameId }: { gameId: string }) {
    const { subscribe, isConnected } = useWebSocket();
    const { moveTileRemote, setCurrentTurn, myNickname, initializeGame } = useRummikubStore();

    useEffect(() => {
        if (!isConnected) return;

        const unsubscribe = subscribe(`/topic/game/${gameId}`, (event: any) => {
            // 1. 실시간 타일 이동 반영
            if (event.action === 'TILE_MOVE' && event.nickname !== myNickname) {
                moveTileRemote(event.tileId, event.toX, event.toY);
            }
            // 2. 턴 전환 알림
            if (event.type === 'TURN_CHANGED' || event.type === 'TURN_SUBMITTED') {
                setCurrentTurn(event.nextTurn);
                if (event.table) { // 턴 종료 시 서버가 준 최종 판으로 갱신
                    initializeGame({ table: event.table, myHand: event.myHand || [] });
                }
            }
        });

        return () => unsubscribe();
    }, [isConnected, gameId, myNickname]);

    return (
        <main className="min-h-screen bg-slate-950 text-white">
            <RummikubGame roomId={gameId} />
        </main>
    );
}