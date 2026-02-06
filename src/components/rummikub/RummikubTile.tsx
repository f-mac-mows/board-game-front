"use client";

import { BoardTile } from "@/store/useRummikubStore";
import { useDraggable } from "@dnd-kit/core";
import { motion } from "framer-motion";

interface Props {
  tile: BoardTile;
  isError?: boolean;
}

export default function RummikubTile({ tile, isError }: Props) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: tile.id.toString(),
  });

  // dnd-kit 좌표 적용
  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  // globals.css 테마 색상 활용
  const colorMap: Record<string, string> = {
    RED: "text-red-600",
    BLUE: "text-blue-600",
    YELLOW: "text-amber-500",
    BLACK: "text-slate-900",
    JOKER: "text-purple-600",
  };

  return (
    <motion.div
      ref={setNodeRef}
      layout
      layoutId={tile.id.toString()}
      style={style}
      {...listeners}
      {...attributes}
      
      /* 🚀 애니메이션: 에러 시 흔들림, 드래그 시 반응 */
      initial={false}
      animate={isError ? { x: [-2, 2, -2, 2, 0] } : { scale: 1 }}
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}

      className={`
        relative w-11 h-15 sm:w-14 sm:h-20 rounded-lg flex flex-col items-center justify-center 
        select-none cursor-grab active:cursor-grabbing transition-shadow
        
        /* 🚀 타일의 물리적 두께감 구현 */
        ${isDragging 
          ? "z-50 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] rotate-2" 
          : "shadow-[0_5px_0_0_#d1d5db,0_10px_15px_-3px_rgba(0,0,0,0.3)] bg-[#fdfcf8]"}
        
        /* 🚀 에러 상태 스타일 */
        ${isError 
          ? "border-2 border-red-500 bg-red-50 shadow-[0_5px_0_0_#fca5a5]" 
          : "border border-slate-100"}
      `}
    >
      {/* 🚀 상단 광택 효과 (Glossy) */}
      <div className="absolute inset-x-0 top-0 h-1/2 bg-linear-to-b from-white/80 to-transparent rounded-t-lg pointer-events-none" />
      
      {/* 🚀 타일 내부 음각 테두리 */}
      <div className="absolute inset-1.5 border border-black/5 rounded-md pointer-events-none" />
      
      <span className={`text-3xl sm:text-4xl font-black tracking-tighter z-10 drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)] ${colorMap[tile.color]}`}>
        {tile.joker ? "☺" : tile.number}
      </span>
      
      {tile.joker && (
        <span className="absolute bottom-1.5 text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] z-10">
          Joker
        </span>
      )}

      {/* 🚀 하단 미세한 반사광 */}
      <div className="absolute inset-x-0 bottom-0 h-0.5 bg-black/5 rounded-b-lg pointer-events-none" />
    </motion.div>
  );
}