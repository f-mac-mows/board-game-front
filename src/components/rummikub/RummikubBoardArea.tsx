"use client";

import { useDroppable } from "@dnd-kit/core";
import { useRummikubStore } from "@/store/useRummikubStore";
import { memo } from "react";

interface Props {
  children: React.ReactNode;
}

const RummikubBoardArea = ({ children }: Props) => {
  // 스토어에서 내 턴인지 확인
  const { currentTurnNickname, myNickname } = useRummikubStore();
  const isMyTurn = currentTurnNickname === myNickname;

  // 전체 영역을 하나의 Droppable로 유지 (좌표 계산의 일관성을 위해)
  const { setNodeRef } = useDroppable({ id: "game-board-area" });

  return (
    <div
      ref={setNodeRef}
      className={`relative w-300 h-187.5 mx-auto flex flex-col gap-6 p-4 transition-all duration-700
        ${!isMyTurn ? "grayscale-[0.2] opacity-90" : "opacity-100"}`}
    >
      {/* 🟦 공용 테이블 (Common Table Area) - setId > 0 인 타일들이 주로 머무는 곳 */}
      <div className="relative flex-3 rounded-[40px] border-4 border-slate-800 bg-[#0f172a]/80 shadow-[0_0_50px_rgba(0,0,0,0.5)_inset] overflow-hidden">
        <div 
          className="absolute inset-0 opacity-[0.03] pointer-events-none" 
          style={{ 
            backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', 
            backgroundSize: '30px 30px' 
          }}
        />
        
        <div className="absolute top-8 left-10 flex flex-col gap-1">
          <span className="text-white/10 text-7xl font-black tracking-tighter select-none leading-none italic">BOARD</span>
          <div className={`h-1.5 w-24 rounded-full transition-all duration-500 ${isMyTurn ? "bg-blue-500/40 shadow-[0_0_15px_rgba(59,130,246,0.5)]" : "bg-slate-700"}`} />
        </div>

        {/* 내 턴일 때 흐르는 네온 라인 효과 */}
        {isMyTurn && (
          <div className="absolute inset-0 border-2 border-blue-500/20 animate-pulse pointer-events-none rounded-[36px]" />
        )}
      </div>

      {/* 🟧 플레이어 랙 (My Rack Area) - setId === 0 인 타일들이 머무는 곳 */}
      <div className="relative flex-[1.2] rounded-4xl border-4 border-slate-700 bg-linear-to-b from-[#1e293b] to-[#0f172a] shadow-[0_10px_40px_rgba(0,0,0,0.7)]">
        {/* 거치대 느낌의 상단 하이라이트 */}
        <div className="absolute -top-1 inset-x-8 h-2 bg-white/5 rounded-full blur-sm" />
        
        <div className="absolute bottom-6 right-10 text-right">
          <span className={`text-4xl font-black italic select-none transition-all duration-500
            ${isMyTurn ? "text-blue-400/20" : "text-white/5"}`}>MY RACK</span>
        </div>

        {/* 랙 내부 영역 가이드 */}
        <div className="absolute inset-4 border-2 border-dashed border-white/5 rounded-2xl pointer-events-none" />
      </div>

      {/* 🚀 타일 렌더링 레이어 (Children) */}
      {/* 중요: 타일들이 이 div 안에서 absolute로 배치되므로, 
          위의 Board와 Rack 배경 위를 자유롭게 이동할 수 있습니다.
      */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        <div className="relative w-full h-full pointer-events-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default memo(RummikubBoardArea);