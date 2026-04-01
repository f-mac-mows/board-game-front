"use client";

import { useDraggable, useDndContext } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { RummikubBoardTile } from "@/types/rummikub";
import { memo } from "react";
import { useRummikubStore } from "@/store/useRummikubStore";
import { motion } from "framer-motion";

interface Props {
  tile: RummikubBoardTile;
  disabled?: boolean;
}

const RummikubTile = ({ tile, disabled = false }: Props) => {
  const { active } = useDndContext();
  const { currentTurnNickname, myNickname, originalBoardIds } = useRummikubStore();
  const isMyTurn = currentTurnNickname === myNickname;
  
  const isInteractionDisabled = disabled || !isMyTurn;

  // 1. 상태 판별 로직
  const isHandTile = tile.setId === "0" || tile.y >= 560; 
  
  // 🚩 [수정] 원래 보드에 존재했던 타일인가? (푸른 네온 대상)
  const isOriginalBoardTile = originalBoardIds.has(tile.tileId) && !isHandTile;

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `tile-${tile.tileId}`,
    disabled: isInteractionDisabled,
    data: { 
        type: 'individual', 
        tileId: tile.tileId, 
        tileValue: tile.tileValue,
        setId: tile.setId, 
        x: tile.x, 
        y: tile.y 
    }
  });

  const groupDraggable = useDraggable({
    id: `group-${tile.setId}-${tile.tileId}`,
    disabled: isInteractionDisabled,
    data: { type: 'group', setId: tile.setId }
  });

  const isGroupDragging = 
    active?.data.current?.type === 'group' && 
    String(active.data.current.setId) === String(tile.setId);

  const isActive = isDragging || isGroupDragging;

  const getCombinedTransform = () => {
    if (isDragging) return CSS.Translate.toString(transform);
    if (isGroupDragging && active?.rect.current.translated && active?.rect.current.initial) {
      const deltaX = active.rect.current.translated.left - active.rect.current.initial.left;
      const deltaY = active.rect.current.translated.top - active.rect.current.initial.top;
      return `translate3d(${deltaX}px, ${deltaY}px, 0)`;
    }
    return undefined;
  };

  const currentTheme = (colorName: string) => {
    const colorMap: Record<string, { text: string; dot: string }> = {
      RED: { text: "text-[#FF4D4D]", dot: "bg-red-500" },
      BLUE: { text: "text-[#4D79FF]", dot: "bg-blue-500" },
      YELLOW: { text: "text-[#FFB300]", dot: "bg-amber-500" },
      BLACK: { text: "text-[#2D2D2D]", dot: "bg-slate-900" },
      JOKER: { text: "text-red-500", dot: "bg-red-500" }
    };
    return colorMap[colorName] || colorMap.BLACK;
  };

  const [colorName, number] = tile.tileValue.split("_");
  const theme = currentTheme(colorName);

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: getCombinedTransform(),
        left: `${tile.x}px`,
        top: `${tile.y}px`,
        zIndex: isActive ? 1000 : isHandTile ? 20 : 10,
        transition: isActive ? "none" : "all 200ms cubic-bezier(0.18, 0.89, 0.32, 1.28)",
      }}
      className={`absolute touch-none select-none group 
        ${isActive ? "z-100 scale-110" : "scale-100"} 
        ${isInteractionDisabled ? "opacity-70 grayscale-[0.4] cursor-not-allowed" : "cursor-grab"}`}
    >
      {/* 그룹 드래그 핸들 */}
      {!isHandTile && !isInteractionDisabled && (
        <div 
          ref={groupDraggable.setNodeRef}
          {...groupDraggable.attributes}
          {...groupDraggable.listeners}
          className={`absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-3 flex items-center justify-center cursor-grab active:cursor-grabbing transition-opacity
            ${isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
        >
          <div className="w-full h-full bg-[#333] border-x-2 border-t-2 border-[#555] rounded-t-sm flex gap-1 justify-center items-center">
            <div className="w-1 h-1 bg-white/30" />
            <div className="w-1 h-1 bg-white/30" />
          </div>
        </div>
      )}

      {/* 타일 본체 */}
      <motion.div
        {...(isInteractionDisabled ? {} : attributes)}
        {...(isInteractionDisabled ? {} : listeners)}
        className={`
          relative w-12 h-16 sm:w-14 sm:h-20 rounded-md flex flex-col items-center justify-center 
          border-2 transition-all duration-300
          ${isHandTile ? "bg-[#FFF9E6]" : "bg-[#F9FAFB]"} 
          
          /* 🚩 푸른 네온 효과 적용: 원래 보드 타일일 때 */
          ${isOriginalBoardTile 
            ? "border-blue-400 shadow-[0_0_15px_rgba(56,189,248,0.6)] ring-1 ring-blue-300/30" 
            : "border-[#D1D5DB] shadow-md"}
          
          /* 드래그 중인 타일의 테두리 우선 순위 */
          ${isActive ? "border-blue-500 shadow-2xl scale-105" : ""}
          ${!isActive && "border-b-[5px] border-gray-300 active:border-b-2 active:translate-y-0.5"}
        `}
      >

        <div className="absolute top-1 right-1 flex gap-0.5">
            <div className={`w-1 h-1 ${theme.dot} opacity-20`} />
            <div className={`w-1 h-1 ${theme.dot} opacity-20`} />
        </div>

        <span className={`text-2xl sm:text-3xl font-black leading-none tracking-tighter ${theme.text} drop-shadow-sm`}>
          {colorName === "JOKER" ? "☺" : number}
        </span>

        <div className={`w-4 h-1 mt-2 ${theme.dot} opacity-30 rounded-full`} />
      </motion.div>
    </div>
  );
};

export default memo(RummikubTile);