"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation"; // Next.js App Router 방식
import { useWebSocket } from "@/contexts/WebSocketContext";
import { useRummikubStore } from "@/store/useRummikubStore";
import RummikubGame from "@/components/rummikub/RummikubGame";
import { toast } from "react-hot-toast";

export default function RummikubPage({ gameId }: { gameId: string}) {
    const params = useParams();
    
    const { subscribe, isConnected } = useWebSocket();
    const { 
        remoteMoveTile, 
        setCurrentTurn, 
        myNickname, 
        setBoardTiles,
        setBoardValid 
    } = useRummikubStore();

    useEffect(() => {
        if (!isConnected || !gameId) return;

        // 페이지 레벨에서 공통 게임 이벤트 구독
        const unsubscribe = subscribe(`/topic/game/RUMMIKUB/${gameId}`, (event: any) => {
            
            // 1. 타 플레이어 실시간 드래그 반영 (TILE_DRAG 또는 TILE_MOVE)
            if ((event.type === 'TILE_DRAG' || event.action === 'TILE_MOVE') && event.nickname !== myNickname) {
                remoteMoveTile(event.tileId, event.x || event.toX, event.y || event.toY);
            }

            // 2. 턴 전환 및 보드 상태 확정 동기화
            if (event.type === 'TURN_CHANGED') {
                setCurrentTurn(event.nextTurn);
                
                // 턴이 바뀌면 서버가 내려준 최종 보드 타일들로 강제 동기화 (자석/위치 오류 보정)
                if (event.data?.boardTiles) {
                    setBoardTiles(event.data.boardTiles);
                }

                if (event.nextTurn === myNickname) {
                    toast.success("당신의 턴입니다!", { icon: '🎲' });
                }
            }

            // 3. 게임 종료
            if (event.type === 'GAME_OVER') {
                toast("게임이 종료되었습니다.", { icon: '🏁' });
            }
        });

        return () => unsubscribe();
    }, [isConnected, gameId, myNickname, remoteMoveTile, setCurrentTurn, setBoardTiles]);

    return (
        <main className="min-h-screen bg-slate-950 text-white overflow-hidden">
            <RummikubGame roomId={gameId} />
        </main>
    );
}