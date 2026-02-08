"use client";

import { useDroppable } from "@dnd-kit/core";

interface Props {
  children: React.ReactNode;
  isMyTurn: boolean;
}

export default function RummikubBoardArea({ children, isMyTurn }: Props) {
  // 전체를 감싸는 드롭 영역 (좌표 계산 기준)
  const { setNodeRef } = useDroppable({ id: "game-board-area" });

  return (
    <div
      ref={setNodeRef}
      className={`relative w-300 h-200 mx-auto flex flex-col gap-6 p-4 transition-all duration-700
        ${!isMyTurn ? "grayscale-[0.3] opacity-80" : "opacity-100"}`}
    >
      {/* 🟦 공용 테이블 (Common Table Area) */}
      <div className="relative flex-3 rounded-4xl border-4 border-slate-800 bg-[#0f172a]/80 shadow-[0_0_50px_rgba(0,0,0,0.5)_inset] overflow-hidden group">
        {/* 격자 무늬 (픽셀/도트 감성) */}
        <div 
          className="absolute inset-0 opacity-[0.03] pointer-events-none" 
          style={{ 
            backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', 
            backgroundSize: '25px 25px' // 점 형태의 도트 격자
          }}
        />
        
        <div className="absolute top-8 left-10 flex flex-col gap-1">
          <span className="text-white/10 text-7xl font-black tracking-tighter select-none leading-none">BOARD</span>
          <div className="h-1 w-24 bg-blue-500/20 rounded-full" />
        </div>

        {/* 내 턴일 때 흐르는 네온 라인 효과 */}
        {isMyTurn && (
          <div className="absolute inset-0 border-2 border-blue-500/20 animate-pulse pointer-events-none rounded-[1.8rem]" />
        )}
      </div>

      {/* 🟧 플레이어 랙 (My Rack Area) */}
      <div className="relative flex-1 rounded-3xl border-4 border-slate-700 bg-linear-to-b from-[#1e293b] to-[#0f172a] shadow-[0_10px_30px_rgba(0,0,0,0.6)] group/rack">
        {/* 랙 상단 입체감 (나무/플라스틱 거치대 느낌) */}
        <div className="absolute -top-1 inset-x-0 h-4 bg-slate-800/50 rounded-t-full border-t border-white/10" />
        
        <div className="absolute bottom-6 right-10 text-right">
          <span className={`text-4xl font-black italic select-none transition-colors duration-500
            ${isMyTurn ? "text-blue-400/20" : "text-white/5"}`}>MY RACK</span>
        </div>

        {/* 랙 내부 슬롯 가이드라인 (도트 감성) */}
        <div className="absolute inset-4 border-2 border-dashed border-white/5 rounded-xl pointer-events-none" />
      </div>

      {/* 타일들이 렌더링되는 영역 (absolute 위치 잡힌 children) */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="relative w-full h-full pointer-events-auto">
          {children}
        </div>
      </div>
    </div>
  );
}