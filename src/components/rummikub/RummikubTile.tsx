"use client";

import { BoardTile } from "@/store/useRummikubStore";
import { useDraggable } from "@dnd-kit/core";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  tile: BoardTile;
  isError?: boolean;
}

export default function RummikubTile({ tile, isError }: Props) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: tile.id.toString(),
  });

  // 드래그 중일 때는 dnd-kit의 좌표를 따르고, 아닐 때는 motion의 layout 애니메이션을 따릅니다.
  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  const colorMap: Record<string, string> = {
    RED: "text-red-500",
    BLUE: "text-blue-500",
    YELLOW: "text-yellow-500",
    BLACK: "text-black",
    JOKER: "text-purple-600",
  };

  return (
    <motion.div
      ref={setNodeRef}
      layout // 🚀 핵심: 좌표(x, y)가 바뀌면 자동으로 슈슉 이동합니다.
      layoutId={tile.id.toString()} // 🚀 타일의 정체성을 유지해줍니다.
      style={style}
      {...listeners}
      {...attributes}
      // 드래그 중일 때는 애니메이션을 잠시 끄고 z-index를 높입니다.
      initial={false}
      animate={isError ? { x: [0, -2, 2, -2, 2, 0] } : {}} 
      transition={{ type: "spring", stiffness: 500, damping: 30, mass: 1 }}
      className={`
        w-12 h-16 bg-orange-50 rounded-lg flex flex-col items-center justify-center 
        shadow-md cursor-grab active:cursor-grabbing border-2 relative select-none
        ${isDragging ? "z-50 opacity-80" : "z-10"}
        ${isError ? "border-red-500 bg-red-50" : "border-amber-200"}
      `}
    >
      <span className={`text-2xl font-black ${colorMap[tile.color] || "text-slate-800"}`}>
        {tile.joker ? "☺" : tile.number}
      </span>
      {tile.joker && (
        <span className="absolute bottom-1 text-[8px] font-bold text-slate-400">
          JOKER
        </span>
      )}
    </motion.div>
  );
}