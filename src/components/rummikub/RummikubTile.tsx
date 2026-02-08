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

  // 1. 개별 드래그 (타일 본체용)
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `tile-${tile.tileId}`,
    data: { type: 'individual', tileId: tile.tileId, setId: tile.setId }
  });

  // 2. 그룹 드래그 (핸들용)
  const groupDraggable = useDraggable({
    id: `group-${tile.setId}-${tile.tileId}`,
    data: { type: 'group', setId: tile.setId }
  });

  // 🚀 그룹 투명도 애니메이션 판별
  // 현재 핸들을 잡고 드래그 중인 setId가 이 타일의 setId와 같은지 확인
  const isGroupDragging = active?.data.current?.type === 'group' && active.data.current.setId === tile.setId;
  
  // 개별 드래그 중이거나 그룹원으로서 같이 움직이는 중이라면 활성화
  const isActive = isDragging || isGroupDragging;

  const style = {
    // 그룹 이동 시에는 groupDraggable의 transform을, 개별 이동 시에는 본체의 transform을 사용
    transform: CSS.Translate.toString(transform || groupDraggable.transform),
    left: `${tile.x}px`,
    top: `${tile.y}px`,
    zIndex: isActive ? 1000 : 10,
  };

  const colorMap: Record<TileColor, string> = {
    RED: "text-red-500", BLUE: "text-blue-500", YELLOW: "text-amber-400",
    BLACK: "text-slate-200", JOKER: "text-red-500"
  };

  const [color, number] = tile.tileValue.split("_");

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`absolute touch-none select-none group transition-all duration-200
        ${isActive ? "opacity-60 scale-105" : "opacity-100 scale-100"}`} // 👈 투명도 및 스케일 효과
    >
      {/* 🟢 그룹 드래그 핸들 */}
      <div 
        ref={groupDraggable.setNodeRef}
        {...groupDraggable.attributes}
        {...groupDraggable.listeners}
        className={`absolute -top-5 left-1/2 -translate-x-1/2 w-10 h-4 rounded-t-md flex items-center justify-center cursor-grab active:cursor-grabbing shadow-lg border transition-colors
          ${isActive ? "bg-blue-600 border-blue-400" : "bg-slate-800 border-slate-700 hover:bg-slate-700"}`}
      >
        <div className="flex gap-1">
          <div className={`w-1 h-1 rounded-full ${isActive ? "bg-white animate-pulse" : "bg-slate-500"}`} />
          <div className={`w-1 h-1 rounded-full ${isActive ? "bg-white animate-pulse" : "bg-slate-500"}`} />
          <div className={`w-1 h-1 rounded-full ${isActive ? "bg-white animate-pulse" : "bg-slate-500"}`} />
        </div>
      </div>

      {/* ⬜ 타일 본체 */}
      <div
        {...attributes}
        {...listeners}
        className={`
          w-12 h-16 sm:w-14 sm:h-20 bg-white rounded-lg flex flex-col items-center justify-center 
          shadow-[0_4px_0_#ccc,0_8px_15px_rgba(0,0,0,0.3)] border-2 transition-all
          ${isError ? "border-red-500" : isActive ? "border-blue-400" : "border-slate-100"}
          active:scale-95 cursor-grab
        `}
      >
        <span className={`text-xl sm:text-2xl font-black ${colorMap[color as TileColor]}`}>
          {color === "JOKER" ? "☺" : number}
        </span>
        <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full border-2 mt-1 ${colorMap[color as TileColor]} opacity-20`} />
      </div>
    </div>
  );
}