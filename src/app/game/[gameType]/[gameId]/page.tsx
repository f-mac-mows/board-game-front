"use client";

import { useParams } from "next/navigation";
import RummikubContainer from "@/components/game/RummikubContainer";
import YachtContainer from "@/components/game/YachtContainer";

export default function GamePage() {
    const params = useParams();
    const gameType = params.gameType as string;
    const gameId = params.gameId as number;

    // gameType에 따라 렌더링할 컴포넌트 결정
    switch (gameType.toLowerCase()) {
        case "rummikub":
            return <RummikubContainer gameId={gameId} />;
        case "yacht":
            return <YachtContainer gameId={gameId} />;
        default:
            return (
                <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
                    <p>알 수 없는 게임 타입입니다: {gameType}</p>
                </div>
            );
    }
}