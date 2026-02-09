"use client";

import { useDraggable, useDndContext } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { RummikubBoardTile, TileColor } from "@/types/rummikub";
import { memo } from "react";

interface Props {
  tile: RummikubBoardTile;
  isError?: boolean;
}

const RummikubTile = ({ tile, isError }: Props) => {
  const { active } = useDndContext();

  // 1. 개별 드래그 (타일 본체)
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `tile-${tile.tileId}`,
    data: { 
        type: 'individual', 
        tileId: tile.tileId, 
        setId: tile.setId, 
        x: tile.x, 
        y: tile.y 
    }
  });

  // 2. 그룹 드래그 (상단 핸들)
  const groupDraggable = useDraggable({
    id: `group-${tile.setId}-${tile.tileId}`,
    data: { 
        type: 'group', 
        setId: tile.setId 
    }
  });

  // 드래그 상태 확인
  const isGroupDragging = active?.data.current?.type === 'group' && active.data.current.setId === tile.setId;
  const isActive = isDragging || isGroupDragging;

  /**
   * 🚀 한 블록처럼 움직이게 하는 핵심 로직
   * dnd-kit의 기본 transform은 각 컴포넌트마다 계산 시점이 미세하게 달라 딜레이가 발생할 수 있음.
   * active 객체에서 마우스의 전체 이동량(Delta)을 직접 뽑아서 모든 타일에 동일하게 주입.
   */
  const getCombinedTransform = () => {
    if (isDragging) return CSS.Translate.toString(transform);

    if (isGroupDragging && active?.rect.current.translated && active?.rect.current.initial) {
      const deltaX = active.rect.current.translated.left - active.rect.current.initial.left;
      const deltaY = active.rect.current.translated.top - active.rect.current.initial.top;
      return `translate3d(${deltaX}px, ${deltaY}px, 0)`;
    }

    return undefined;
  };

  const currentTransform = getCombinedTransform();

  const style: React.CSSProperties = {
    transform: currentTransform,
    left: `${tile.x}px`,
    top: `${tile.y}px`,
    zIndex: isActive ? 1000 : 10,
    // 드래그 중일 때는 transition을 0으로 만들어 마우스 좌표를 즉각 반영 (자석 효과)
    transition: isActive ? "none" : "transform 200ms cubic-bezier(0.18, 0.89, 0.32, 1.28), opacity 200ms ease",
    willChange: "transform",
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
      {/* 🟢 그룹 드래그 핸들 (타일 상단 바) */}
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

      {/* ⬜ 타일 본체 (개별 드래그) */}
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
};

// React.memo를 사용해 드래그 중이지 않은 타일들의 불필요한 리렌더링 방지
export default memo(RummikubTile);