"use client";

import { RankingResponse } from "@/types/rank";
import { cn } from "@/lib/utils";

interface Props {
  topThree: RankingResponse[];
  myNickname?: string;
}

export default function RankingPodium({ topThree, myNickname }: Props) {
  // 포디움 배치를 위해 [2위, 1위, 3위] 순서로 정렬
  const displayItems = [
    topThree[1] || null,
    topThree[0] || null,
    topThree[2] || null
  ];

  return (
    <div className="flex justify-center items-end gap-2 md:gap-6 my-16 px-4">
      {displayItems.map((item, index) => {
        if (!item) return <div key={index} className="flex-1" />;
        
        const isFirst = item.rank === 1;
        const isMe = item.nickname === myNickname;

        return (
          <div key={item.nickname} className={cn(
            "flex flex-col items-center flex-1 transition-transform hover:scale-105",
            isFirst ? "z-10" : "z-0"
          )}>
            {/* 칭호 & 닉네임 */}
            <div className="mb-3 text-center">
              <div className="text-[10px] md:text-xs text-gray-500 font-bold uppercase">{item.title}</div>
              <div className={cn("text-sm md:text-base font-bold truncate max-w-30", isMe ? "text-blue-400" : "text-white")}>
                {item.nickname}
              </div>
            </div>

            {/* 기둥 (Podium Base) */}
            <div className={cn(
              "w-full rounded-t-2xl flex flex-col items-center justify-start pt-6 shadow-2xl relative",
              isFirst 
                ? "bg-linear-to-b from-yellow-500/20 to-yellow-600/10 border-t-4 border-yellow-500 h-44 md:h-56" 
                : "bg-gray-800/40 border-t-4 border-gray-600 h-32 md:h-40",
              item.rank === 2 && "border-slate-400 from-slate-400/20 to-slate-400/5",
              item.rank === 3 && "border-amber-700 from-amber-700/20 to-amber-700/5",
              isMe && "ring-2 ring-blue-500 ring-offset-2 ring-offset-[#0f172a]"
            )}>
              {/* 순위 아이콘 */}
              <div className={cn(
                "text-2xl md:text-4xl font-black mb-2",
                item.rank === 1 && "text-yellow-500",
                item.rank === 2 && "text-slate-300",
                item.rank === 3 && "text-amber-600",
              )}>
                {item.rank === 1 ? "🥇" : item.rank === 2 ? "🥈" : "🥉"}
              </div>
              
              <div className="text-lg md:text-2xl font-mono font-black text-white/90">
                {item.score.toLocaleString()}
              </div>
              
              {isFirst && <div className="absolute -top-10 animate-bounce text-3xl">👑</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}