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

  // 🚀 최적화 스타일 객체
  const style = {
    transform: CSS.Translate.toString(transform || groupDraggable.transform),
    left: `${tile.x}px`,
    top: `${tile.y}px`,
    zIndex: isActive ? 1000 : 10,
    // 드래그 중에는 transition을 완전히 꺼야 마우스에 붙어다닙니다.
    transition: isActive ? "none" : "transform 200ms cubic-bezier(0.18, 0.89, 0.32, 1.28), opacity 200ms ease",
    willChange: isActive ? "transform" : "auto",
  };

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
      className={`absolute touch-none select-none group ${isActive ? "z-50 scale-105" : "scale-100"}`}
    >
      {/* 🟢 그룹 드래그 핸들 */}
      <div 
        ref={groupDraggable.setNodeRef}
        {...groupDraggable.attributes}
        {...groupDraggable.listeners}
        className={`absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-3 flex items-center justify-center cursor-grab active:cursor-grabbing transition-opacity duration-200
          ${isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
      >
        <div className="w-full h-full bg-[#333] border-x-2 border-t-2 border-[#555] rounded-t-sm flex gap-1 justify-center items-center">
            <div className="w-1 h-1 bg-white/30" />
            <div className="w-1 h-1 bg-white/30" />
        </div>
      </div>

      {/* ⬜ 타일 본체 */}
      <div
        {...attributes}
        {...listeners}
        className={`
          relative w-12 h-16 sm:w-14 sm:h-20 rounded-md flex flex-col items-center justify-center 
          border-2 border-b-[6px] cursor-grab
          ${isError 
            ? "border-red-600 bg-red-100" 
            : isActive 
              ? "border-blue-500 bg-white shadow-2xl" 
              : "border-[#D1D5DB] bg-[#F9FAFB] active:border-b-2 active:translate-y-1 shadow-lg"}
          /* 본체 내부 상태 변화 애니메이션은 isActive가 아닐 때만 적용 */
          ${!isActive && "transition-all duration-200"}
        `}
      >
        <div className="absolute top-1 right-1 flex gap-0.5">
            <div className={`w-1 h-1 ${currentTheme.dot} opacity-20`} />
            <div className={`w-1 h-1 ${currentTheme.dot} opacity-20`} />
        </div>

        <span className={`text-2xl sm:text-3xl font-black leading-none tracking-tighter ${currentTheme.text} drop-shadow-sm`}>
          {colorName === "JOKER" ? "☺" : number}
        </span>

        <div className={`w-4 h-1 mt-2 ${currentTheme.dot} opacity-30 rounded-full`} />

        {!isActive && (
          <div className="absolute inset-0 border-r-2 border-white/50 pointer-events-none rounded-md" />
        )}
      </div>
    </div>
  );
}