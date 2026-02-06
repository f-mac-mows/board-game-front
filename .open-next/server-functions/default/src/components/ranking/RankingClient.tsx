"use client";

import { useState, useEffect } from "react";
import { useRanking } from "@/hooks/useRanking";
import { useMe } from "@/hooks/useMe";
import { RankingCriteria } from "@/types/rank";
import RankingPodium from "./RankingPodium";
import RankingRow from "./RankingRow";
import RankingPagination from "./RankingPagination";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface Props {
    category: string;
    criteria: RankingCriteria;
}

/**
 * 숫자가 드르륵 올라가는 효과를 주는 내부 컴포넌트
 */
function ScoreCountUp({ end, duration = 1000 }: { end: number; duration?: number }) {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let startTime: number | null = null;
        const step = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            setCount(Math.floor(progress * end));
            if (progress < 1) window.requestAnimationFrame(step);
        };
        window.requestAnimationFrame(step);
    }, [end, duration]);
    return <>{count.toLocaleString()}</>;
}

export default function RankingClient({ category, criteria }: Props) {
    const [page, setPage] = useState(0);
    const router = useRouter();
    
    // 카테고리나 기준이 변경되면 페이지를 0으로 초기화
    useEffect(() => {
        setPage(0);
    }, [category, criteria]);

    const { data: userProfile } = useMe();
    const { data: rankings, isLoading, isPlaceholderData } = useRanking(category, criteria, page);

    if (isLoading || !rankings) {
        return (
            <div className="flex justify-center items-center min-h-150">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    const myNickname = userProfile?.nickname;
    
    // 0페이지에서만 상위 3명 포디움 노출
    const topThree = page === 0 ? rankings.slice(0, 3) : [];
    const tableRankings = page === 0 ? rankings.slice(3) : rankings;
    
    // 현재 리스트(20개) 안에 내가 있는지 확인
    const myRankInCurrentList = rankings.find(r => r.nickname === myNickname);
    
    // TODO: 만약 백엔드에서 '내 랭킹 정보'를 별도 필드로 내려준다면 그것을 사용하고, 
    // 지금은 현재 페이지에 내가 없으면 Sticky Bar를 보여주지 않거나 별도 조회가 필요합니다.
    // 여기서는 현재 로드된 데이터 기반으로 내 순위가 있으면 보여주는 로직입니다.
    const isMeInCurrentPage = !!myRankInCurrentList;

    return (
        <div className={cn(
            "relative max-w-5xl mx-auto pb-40 transition-opacity duration-300",
            isPlaceholderData ? "opacity-50" : "opacity-100"
        )}>
            {/* 1. 상위 3인 포디움 (0페이지 전용) */}
            {page === 0 && topThree.length > 0 && (
                <RankingPodium topThree={topThree} myNickname={myNickname} />
            )}

            {/* 2. 랭킹 테이블 */}
            <div className="bg-[#1a1b26] rounded-2xl border border-gray-800 shadow-2xl overflow-hidden mt-8">
                <table className="w-full border-collapse">
                    <thead className="bg-gray-800/50 text-gray-400 text-xs uppercase tracking-widest font-bold">
                        <tr>
                            <th className="py-5 px-6 text-center w-24">순위</th>
                            <th className="py-5 px-6 text-left">플레이어</th>
                            <th className="py-5 px-6 text-right">점수</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800/30">
                        {tableRankings.map((item) => (
                            <RankingRow 
                                key={item.nickname} 
                                item={item} 
                                isMe={item.nickname === myNickname} 
                            />
                        ))}
                    </tbody>
                </table>
                {rankings.length === 0 && (
                    <div className="py-32 flex flex-col items-center justify-center text-gray-500">
                        <span className="text-6xl mb-4">🏆</span>
                        <p className="text-xl font-bold text-gray-300">아직 집계된 랭킹이 없습니다.</p>
                        <p className="text-sm">게임을 플레이하고 첫 번째 랭커가 되어보세요!</p>
                        <button 
                            onClick={() => router.push('/rooms')} // 방 목록으로 이동
                            className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-full font-bold hover:bg-blue-500"
                        >
                            게임하러 가기
                        </button>
                    </div>
                )}
            </div>

            {/* 3. 페이지네이션 */}
            <RankingPagination 
                currentPage={page} 
                onPageChange={(newPage) => {
                    setPage(newPage);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                // 데이터가 20개 꽉 차있으면 다음 페이지가 있다고 가정 (간이 처리)
                hasMore={rankings.length === 20} 
            />

            {/* 4. 내 순위 하단 고정바 (내가 현재 페이지 리스트에 없을 때만 등장) */}
            {/* 실제 서비스에서는 '내 전체 순위' API를 별도로 호출하여 보여주는 것이 좋습니다. */}
            {!isMeInCurrentPage && myNickname && (
                <div className="fixed bottom-0 left-0 right-0 z-50 animate-in slide-in-from-bottom duration-500">
                    <div className="bg-linear-to-r from-blue-700/90 via-indigo-800/90 to-blue-900/90 backdrop-blur-lg border-t border-blue-400/30 py-5 px-8 shadow-[0_-10px_40px_rgba(0,0,0,0.6)]">
                        <div className="max-w-5xl mx-auto flex justify-between items-center text-white">
                            <div className="flex items-center gap-8">
                                <div className="flex flex-col items-center">
                                    <span className="text-xs text-blue-300 font-bold uppercase tracking-tighter">My Rank</span>
                                    <span className="text-3xl font-black italic">--</span> 
                                    {/* 내 순위를 서버에서 따로 안 가져오면 -- 처리, 혹은 별도 fetch 필요 */}
                                </div>
                                <div className="h-10 w-px bg-white/20" />
                                <div>
                                    <div className="text-[10px] text-blue-300 font-bold uppercase mb-0.5">Player</div>
                                    <div className="font-bold text-xl tracking-tight">{myNickname}</div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-[10px] text-blue-300 font-bold uppercase mb-0.5">Current Score</div>
                                <div className="text-3xl font-mono font-black text-white">
                                    {/* userProfile.astat 혹은 stats에서 현재 기준에 맞는 점수 매핑 필요 */}
                                    <ScoreCountUp end={userProfile?.astat?.level || 0} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}