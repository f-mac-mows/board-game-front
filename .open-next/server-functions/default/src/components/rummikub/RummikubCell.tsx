"use client";

import { useDroppable } from "@dnd-kit/core";

interface Props {
  id: string; // "board-0-0", "hand-1-5" 등
  children?: React.ReactNode;
}

export default function RummikubCell({ id, children }: Props) {
  const { isOver, setNodeRef } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`
        /* 🚀 사이즈 최적화 및 기본 스타일 */
        w-12 h-16 sm:w-14 sm:h-20 rounded-xl flex items-center justify-center transition-all duration-200
        
        /* 🚀 입체감: 안으로 파인 효과 (Inner Shadow) */
        ${isOver 
          ? "bg-blue-500/10 border-2 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.2)] scale-[1.02]" 
          : "bg-slate-950/40 border border-slate-800/50 shadow-[inset_0_2px_6px_rgba(0,0,0,0.5)]"}
      `}
    >
      {/* 🚀 드롭 가능 영역임을 암시하는 중앙 점 (자식 요소가 없을 때만 표시) */}
      {!children && (
        <div className={`w-1.5 h-1.5 rounded-full transition-colors 
          ${isOver ? "bg-blue-400" : "bg-slate-800"}`} 
        />
      )}
      {children}
    </div>
  );
}