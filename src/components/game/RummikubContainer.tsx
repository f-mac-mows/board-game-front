"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useWebSocket } from "@/contexts/WebSocketContext";
import RummikubGame from "@/components/rummikub/RummikubGame";
import { Loader2 } from "lucide-react";

interface RummikubPageProps {
    gameId: string;
}

export default function RummikubPage({ gameId }: RummikubPageProps) {
    const params = useParams();
    const { isConnected } = useWebSocket();
    // 로딩 상태 관리 (소켓 연결 및 초기 데이터 대기)
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (isConnected && gameId) {
            setIsLoading(false);
        }
    }, [isConnected, gameId]);

    // 소켓 미연결 시 로딩 화면
    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
                <p className="text-slate-400 font-bold animate-pulse">
                    Connecting to game server...
                </p>
            </div>
        );
    }

    return (
        <main className="relative min-h-screen bg-[#020617] text-white overflow-hidden font-sans">
            {/* 배경 데코레이션: 게임 분위기를 살리는 은은한 그라데이션 */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-900/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-900/10 blur-[120px] rounded-full" />
            </div>

            {/* 실제 게임 컴포넌트: 내부에서 Topic/Queue 이원 구독을 수행함 */}
            <div className="relative z-10">
                <RummikubGame roomId={gameId} />
            </div>
        </main>
    );
}