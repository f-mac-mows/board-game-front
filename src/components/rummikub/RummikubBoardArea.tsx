"use client";

import { useDroppable } from "@dnd-kit/core";

interface Props {
  children: React.ReactNode;
  isMyTurn: boolean;
}

export default function RummikubBoardArea({ children, isMyTurn }: Props) {
  const { setNodeRef } = useDroppable({ id: "game-board-area" });

  return (
    <div
      ref={setNodeRef}
      className={`relative w-300 h-200 mx-auto rounded-[3rem] border-4 border-slate-800/30 bg-slate-900/20 shadow-inner transition-all overflow-hidden
        ${!isMyTurn && 'grayscale-[0.4] brightness-75 opacity-70 cursor-not-allowed'}`}
    >
      {/* 테이블 영역 가이드 (상단 600px) */}
      <div className="absolute inset-x-0 top-0 h-150 border-b border-white/5 bg-white/5">
        <span className="absolute top-4 left-4 text-white/5 text-6xl font-black select-none">TABLE</span>
      </div>

      {/* 손패 영역 가이드 (하단 200px) */}
      <div className="absolute inset-x-0 top-150 h-50 bg-black/20">
        <span className="absolute bottom-4 left-4 text-white/5 text-6xl font-black select-none">MY RACK</span>
      </div>

      {children}
    </div>
  );
}