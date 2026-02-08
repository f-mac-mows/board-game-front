"use client";

import { useDraggable, useDndContext } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { RummikubBoardTile, TileColor } from "@/types/rummikub";

interface Props {
  tile: RummikubBoardTile;
  isError?: boolean;
}

export default function RummikubTile({ tile, isError }: Props) {
  const { active } = useDndContext();

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `tile-${tile.tileId}`,
    data: { type: 'individual', tileId: tile.tileId, setId: tile.setId, x: tile.x, y: tile.y }
  });

  const groupDraggable = useDraggable({
    id: `group-${tile.setId}-${tile.tileId}`,
    data: { type: 'group', setId: tile.setId }
  });

  const isGroupDragging = active?.data.current?.type === 'group' && active.data.current.setId === tile.setId;
  const isActive = isDragging || isGroupDragging;

  const style = {
    transform: CSS.Translate.toString(transform || groupDraggable.transform),
    left: `${tile.x}px`,
    top: `${tile.y}px`,
    zIndex: isActive ? 1000 : 10,
  };

  // 🚩 도트틱한 색상 팔레트
  const colorMap: Record<TileColor, { text: string; bg: string; dot: string }> = {
    RED: { text: "text-[#FF4D4D]", bg: "bg-red-50", dot: "bg-red-500" },
    BLUE: { text: "text-[#4D79FF]", bg: "bg-blue-50", dot: "bg-blue-500" },
    YELLOW: { text: "text-[#FFB300]", bg: "bg-amber-50", dot: "bg-amber-500" },
    BLACK: { text: "text-[#2D2D2D]", bg: "bg-slate-100", dot: "bg-slate-900" },
    JOKER: { text: "text-red-500", bg: "bg-red-50", dot: "bg-red-500" }
  };

  const [colorName, number] = tile.tileValue.split("_");
  const currentTheme = colorMap[colorName as TileColor] || colorMap.BLACK;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`absolute touch-none select-none group transition-transform duration-200
        ${isActive ? "z-50 scale-110" : "scale-100"}`}
    >
      {/* 🟢 그룹 드래그 핸들 (더 도트스럽게 수정) */}
      <div 
        ref={groupDraggable.setNodeRef}
        {...groupDraggable.attributes}
        {...groupDraggable.listeners}
        className={`absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-3 flex items-center justify-center cursor-grab active:cursor-grabbing transition-all
          ${isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
      >
        <div className="w-full h-full bg-[#333] border-x-2 border-t-2 border-[#555] rounded-t-sm flex gap-1 justify-center items-center">
            <div className="w-1 h-1 bg-white/30" />
            <div className="w-1 h-1 bg-white/30" />
        </div>
      </div>

      {/* ⬜ 타일 본체 (도트틱 디자인) */}
      <div
        {...attributes}
        {...listeners}
        className={`
          relative w-12 h-16 sm:w-14 sm:h-20 rounded-md flex flex-col items-center justify-center 
          border-2 border-b-[6px] transition-all cursor-grab
          /* 픽셀 느낌을 위한 보더 스타일 */
          ${isError 
            ? "border-red-600 bg-red-100" 
            : isActive 
              ? "border-blue-500 bg-white" 
              : "border-[#D1D5DB] bg-[#F9FAFB] active:border-b-2 active:translate-y-1 shadow-lg"}
        `}
      >
        {/* 상단 픽셀 데코 */}
        <div className="absolute top-1 right-1 flex gap-0.5">
            <div className={`w-1 h-1 ${currentTheme.dot} opacity-20`} />
            <div className={`w-1 h-1 ${currentTheme.dot} opacity-20`} />
        </div>

        {/* 숫자 (더 굵고 가시성 좋게) */}
        <span className={`text-2xl sm:text-3xl font-black leading-none tracking-tighter ${currentTheme.text} drop-shadow-sm`}>
          {colorName === "JOKER" ? "☺" : number}
        </span>

        {/* 하단 점 (픽셀 느낌) */}
        <div className={`w-4 h-1 mt-2 ${currentTheme.dot} opacity-30 rounded-full`} />

        {/* 타일 측면 입체감 표현 (가짜 3D 효과) */}
        {!isActive && (
          <div className="absolute inset-0 border-r-2 border-white/50 pointer-events-none rounded-md" />
        )}
      </div>
    </div>
  );
}