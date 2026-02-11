"use client";

import { useRummikubStore } from "@/store/useRummikubStore";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

interface HeaderProps {
  timer: number;
  onDraw: () => Promise<void> | void; // 비동기 함수 지원
  onSubmit: () => void;
  isProcessing: boolean; // Game 컴포넌트에서 넘어오는 통신/처리 중 상태
  isBoardValid: boolean;
}

export default function RummikubHeader({ 
  timer, 
  onDraw, 
  onSubmit, 
  isProcessing,
  isBoardValid
}: HeaderProps) {
  const { 
    myNickname, 
    currentTurnNickname, 
    tilePoolCount,
    sortHand 
  } = useRummikubStore();

  // 로컬 애니메이션 상태 (드로우 타일이 날아가는 효과용)
  const [isDrawAnimating, setIsDrawAnimating] = useState(false);

  const isMyTurn = myNickname === currentTurnNickname;
  
  // 버튼 상호작용 가능 여부: 내 턴 + 처리 중 아님 + 애니메이션 중 아님
  const canInteract = isMyTurn && !isProcessing && !isDrawAnimating;

  const handleDrawClick = async () => {
    if (!canInteract || tilePoolCount <= 0) return;
    
    setIsDrawAnimating(true);
    
    // API 호출 (Game.tsx의 handleDraw 실행)
    // 에러가 나더라도 애니메이션은 끝까지 보여주기 위해 try-finally가 아닌 개별 처리
    try {
      await onDraw(); 
    } catch (e) {
      console.error(e);
    } finally {
      // 타일이 랙으로 날아가는 시간(약 0.6s)만큼 대기 후 상태 해제
      setTimeout(() => setIsDrawAnimating(false), 600);
    }
  };

  return (
    <header className="relative flex justify-between items-center bg-slate-900/80 p-4 rounded-3xl border border-white/10 backdrop-blur-md shadow-xl z-50 h-25">
      
      {/* --- 좌측: 턴 정보 & 드로우 --- */}
      <div className="flex gap-6 items-center">
        
        {/* 1. 턴 표시기 */}
        <div className="flex flex-col items-center justify-center w-24">
            <motion.div 
              animate={isMyTurn ? { 
                boxShadow: ["0px 0px 0px 0px rgba(59, 130, 246, 0)", "0px 0px 20px 5px rgba(59, 130, 246, 0.5)", "0px 0px 0px 0px rgba(59, 130, 246, 0)"] 
              } : {}}
              transition={{ repeat: Infinity, duration: 2 }}
              className={`px-3 py-1 rounded-full border ${
                isMyTurn 
                  ? 'bg-blue-500/20 border-blue-400 text-blue-300' 
                  : 'bg-slate-800 border-slate-700 text-slate-500'
              }`}
            >
              <span className="text-[10px] font-black tracking-widest uppercase">
                {isMyTurn ? "MY TURN" : "WAITING"}
              </span>
            </motion.div>
            {!isMyTurn && (
              <span className="text-[10px] text-slate-500 mt-1 truncate max-w-20">
                {currentTurnNickname}
              </span>
            )}
        </div>

        {/* 2. 드로우 버튼 (타일 풀) */}
        <div className="relative">
          <motion.button 
            whileTap={canInteract ? { scale: 0.95 } : {}}
            onClick={handleDrawClick} 
            disabled={!canInteract || tilePoolCount === 0}
            className={`
              relative w-16 h-20 rounded-xl flex flex-col items-center justify-center border-b-4 transition-all
              ${canInteract 
                ? 'bg-amber-500 border-amber-700 hover:bg-amber-400 text-amber-950 shadow-lg shadow-amber-500/20 cursor-pointer' 
                : 'bg-slate-700 border-slate-800 text-slate-500 cursor-not-allowed opacity-60'
              }
            `}
          >
            <span className="text-[9px] font-bold opacity-80 mb-0.5">POOL</span>
            <span className="text-xl font-black">{tilePoolCount}</span>
          </motion.button>

          {/* 🎴 드로우 애니메이션: 타일이 아래(내 랙)로 날아가는 효과 */}
          <AnimatePresence>
            {isDrawAnimating && (
              <motion.div
                initial={{ x: 0, y: 0, scale: 0.5, opacity: 0 }}
                animate={{ 
                  x: 60,   // 오른쪽으로 살짝
                  y: 400,  // 아래쪽 랙 방향으로 이동
                  scale: 1.2, 
                  opacity: [0, 1, 1, 0], // 나타났다가 사라짐
                  rotateZ: 180 
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
                className="absolute top-0 left-0 w-10 h-14 bg-white rounded shadow-2xl z-100 border border-slate-300 flex items-center justify-center pointer-events-none"
              >
                <div className="w-6 h-8 border border-slate-100 rounded-sm bg-blue-50 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-blue-500/50" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 3. 타이머 */}
        <div className="flex flex-col items-center w-16">
          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-tight">Time</span>
          <span className={`text-3xl font-black tabular-nums leading-none ${
            timer <= 10 ? 'text-red-500 animate-pulse drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'text-white'
          }`}>
            {timer}
          </span>
        </div>
      </div>

      {/* --- 우측: 액션 버튼 --- */}
      <div className="flex gap-3 items-center">
        {/* 정렬 버튼 그룹 */}
        <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700/50">
          <button 
            onClick={() => sortHand('color')} 
            className="px-3 py-1.5 hover:bg-slate-600 text-slate-400 hover:text-white rounded-lg text-[10px] font-bold transition-colors"
          >
            COLOR
          </button>
          <div className="w-px bg-slate-700 my-1 mx-0.5"></div>
          <button 
            onClick={() => sortHand('number')} 
            className="px-3 py-1.5 hover:bg-slate-600 text-slate-400 hover:text-white rounded-lg text-[10px] font-bold transition-colors"
          >
            NUMBER
          </button>
        </div>
        
        {/* 제출 버튼 */}
        <motion.button 
          whileTap={canInteract && isBoardValid ? { scale: 0.98 } : {}}
          onClick={onSubmit} 
          disabled={!canInteract || !isBoardValid}
          className={`
            px-6 h-12 rounded-xl font-black text-sm tracking-wide transition-all border-b-4
            ${canInteract && isBoardValid 
              ? 'bg-blue-600 border-blue-800 hover:bg-blue-500 hover:border-blue-700 text-white shadow-lg shadow-blue-900/50' 
              : 'bg-slate-700 border-slate-800 text-slate-500 cursor-not-allowed opacity-50'
            }
          `}
        >
          {isProcessing ? (
             <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
             "SUBMIT"
          )}
        </motion.button>
      </div>
    </header>
  );
}