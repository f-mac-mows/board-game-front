"use client";

import { useEffect, useState, useMemo } from "react";
import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { useRummikubStore } from "@/store/useRummikubStore";
import { RummikubValidator } from "@/utils/rummikubValidator";
import { toast } from "react-hot-toast";
import RummikubCell from "./RummikubCell";
import RummikubTile from "./RummikubTile";
import { useRouter } from "next/navigation";
import { rummikubApi } from "@/api/rummikub";
import { useRummikubActions } from "@/hooks/useRummikub";

export default function RummikubGame({ roomId }: { roomId: string }) {
  const { 
    boardTiles, handTiles, moveTile, sortHand, initializeGame,
    myNickname, currentTurnNickname, isBoardValid, setBoardValid,
    setMyNickname, setCurrentTurn 
  } = useRummikubStore();

  const [isGameOver, setIsGameOver] = useState(false);
  const [winnerData, setWinnerData] = useState<any>(null);
  const [invalidIds, setInvalidIds] = useState<string[]>([]);
  const isMyTurn = useMemo(() => currentTurnNickname === myNickname, [currentTurnNickname, myNickname]);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  const router = useRouter();

  const { submitTurn } = useRummikubActions(Number(roomId));
  
  // 1. 초기 동기화
  useEffect(() => {
    rummikubApi.sync(Number(roomId))
      .then(res => {
        const data = res.data;
        setMyNickname(data.myNickname);
        setCurrentTurn(data.currentTurn);
        initializeGame({ table: data.table, myHand: data.myHand });
      })
      .catch(() => toast.error("게임 데이터를 가져오지 못했습니다."));
  }, [roomId]);

  // 2. 실시간 유효성 검사
  useEffect(() => {
    const { isValid, invalidTileIds } = RummikubValidator.validateBoard(boardTiles);
    setInvalidIds(invalidTileIds);
    setBoardValid(isValid);
  }, [boardTiles, setBoardValid]);

  // 3. 드래그 종료 핸들러
  const handleDragEnd = async (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over) return;

    const [area, x, y] = (over.id as string).split("-");
    const toX = Number(x), toY = Number(y);
    const tileId = Number(active.id);

    // Optimistic Update
    moveTile(active.id.toString(), area as any, toX, toY);

    if (area === "board") {
      try {
          await rummikubApi.move(Number(roomId), { tileId, toX, toY });
      } catch (error) {
          console.error("Move sync failed:", error);
          toast.error("이동 동기화에 실패했습니다.");
      }
    }
  };

  const handleSubmit = () => {
    if (!isBoardValid) return toast.error("조합이 올바르지 않습니다.");
    
    submitTurn({
      nickname: myNickname,
      newTable: RummikubValidator.getRowsWithChunks(boardTiles),
      newHand: handTiles
    });
  };

  const renderGrid = (area: "board" | "hand", rows: number, cols: number) => {
    return Array.from({ length: rows * cols }).map((_, i) => {
      const r = Math.floor(i / cols), c = i % cols;
      const cellId = `${area}-${r}-${c}`;
      const tile = (area === "board" ? boardTiles : handTiles).find(t => t.x === r && t.y === c);
      return (
        <RummikubCell key={cellId} id={cellId}>
          {tile && <RummikubTile tile={tile} isError={invalidIds.includes(tile.id.toString())} />}
        </RummikubCell>
      );
    });
  };
  
  const handleReturnToLobby = () => {
    router.push(roomId ? `/rooms/${roomId}` : '/rooms');
  };

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      {/* 배경 비네팅 효과 */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(2,6,23,0.6)_100%)] z-0" />

      <div className="relative z-10 min-h-screen flex flex-col gap-6 p-4 md:p-8 max-w-400 mx-auto overflow-hidden">
        
        {/* 상단 정보 및 액션 바 */}
        <header className="flex flex-wrap items-center justify-between bg-slate-900/40 backdrop-blur-xl p-4 px-6 rounded-4xl border border-slate-800 shadow-2xl">
          <div className="flex items-center gap-6">
            <div className={`flex items-center gap-3 px-5 py-2 rounded-full transition-all duration-500 shadow-inner
              ${isMyTurn ? 'bg-blue-600/20 border border-blue-500/50' : 'bg-slate-800/50 border border-slate-700'}`}>
              <div className={`w-2.5 h-2.5 rounded-full ${isMyTurn ? 'bg-blue-400 animate-pulse' : 'bg-slate-600'}`} />
              <span className={`text-sm font-black uppercase tracking-[0.15em] ${isMyTurn ? 'text-blue-400' : 'text-slate-500'}`}>
                {isMyTurn ? "Your Strategy" : `${currentTurnNickname}'s Strategy`}
              </span>
            </div>
            <div className="hidden md:block h-8 w-px bg-slate-800" />
            <div className="text-xs font-bold text-slate-500 tracking-wider">
               NICKNAME: <span className="text-slate-200">{myNickname}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex bg-slate-950/50 p-1.5 rounded-2xl border border-slate-800 shadow-inner">
              <button onClick={() => sortHand('color')} className="px-5 py-2 text-[10px] font-black hover:text-blue-400 transition-colors uppercase tracking-widest">Color</button>
              <div className="w-px h-4 bg-slate-800 self-center" />
              <button onClick={() => sortHand('number')} className="px-5 py-2 text-[10px] font-black hover:text-blue-400 transition-colors uppercase tracking-widest">Number</button>
            </div>
            <button 
              onClick={handleSubmit} 
              disabled={!isMyTurn || !isBoardValid}
              className={`px-8 py-3 rounded-2xl font-black text-sm transition-all shadow-xl active:scale-95 uppercase tracking-tighter
                ${isMyTurn && isBoardValid 
                  ? 'bg-blue-600 text-white hover:bg-blue-500 shadow-blue-600/20' 
                  : 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700'}`}
            >
              {!isMyTurn ? "Wait Turn" : !isBoardValid ? "Check Combo" : "Submit Turn"}
            </button>
          </div>
        </header>

        {/* 중앙 게임 보드 영역 */}
        <main className={`flex-1 min-h-0 relative p-6 rounded-[3rem] border-4 border-slate-800/30 bg-slate-900/20 shadow-[inner_0_4px_20px_rgba(0,0,0,0.4)]
          overflow-x-auto custom-scrollbar transition-all duration-700
          ${!isMyTurn && 'grayscale-[0.4] brightness-75 opacity-70 cursor-not-allowed'}`}>
          
          {/* 보드 그리드 배경 패턴 */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] rounded-[2.5rem]" />
          
          <div className="grid grid-cols-20 gap-2.5 min-w-300 relative z-10">
            {renderGrid("board", 8, 20)}
          </div>
        </main>

        {/* 하단 내 손패 (Rack) */}
        <footer className="relative group">
          <div className="absolute -top-4 left-8 bg-[#020617] px-4 py-1 rounded-full border border-slate-800 text-[9px] font-black text-slate-500 tracking-[0.3em] uppercase z-20">
            Player Rack
          </div>
          <div className="p-8 pb-10 rounded-[3rem] bg-linear-to-b from-slate-800/50 to-slate-950 border-t-8 border-slate-900 shadow-[0_-20px_50px_-12px_rgba(0,0,0,0.5)] overflow-x-auto custom-scrollbar">
            <div className="grid grid-cols-20 gap-3 min-w-300">
              {renderGrid("hand", 2, 20)}
            </div>
          </div>
        </footer>

        {/* 게임 종료 모달 */}
        {isGameOver && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-100 p-4 animate-in fade-in duration-700">
            <div className="bg-slate-900 border border-slate-800 p-12 rounded-[50px] text-center max-w-md w-full shadow-[0_0_120px_rgba(59,130,246,0.2)]">
              <h2 className="text-5xl font-black text-blue-500 mb-2 uppercase tracking-tighter italic">Game Set</h2>
              <p className="text-slate-500 mb-10 uppercase tracking-[0.4em] text-[10px] font-bold border-b border-slate-800 pb-4">Match Statistics</p>
              
              <div className="text-3xl font-black text-white mb-2">
                {winnerData?.winnerNickname === myNickname ? "🏆 VICTORY!" : "GG! NICE TRY"}
              </div>
              <p className="text-slate-400 text-sm mb-10">
                Winner: <span className="text-blue-400 font-bold">{winnerData?.winnerNickname}</span>
              </p>

              <div className="flex justify-center mb-12">
                <div className={`flex items-center gap-3 px-8 py-3 rounded-full font-black text-sm border-2
                  ${winnerData?.winnerNickname === myNickname 
                    ? 'bg-blue-500/10 border-blue-500/40 text-blue-400' 
                    : 'bg-red-500/10 border-red-500/40 text-red-400'}`}>
                  <span className="opacity-60">RP RATING</span>
                  <span>{winnerData?.winnerNickname === myNickname ? "▲ UP" : "▼ DOWN"}</span>
                </div>
              </div>

              <button 
                onClick={handleReturnToLobby}
                className="w-full py-5 bg-white text-black rounded-3xl font-black hover:bg-blue-600 hover:text-white transition-all transform active:scale-95 shadow-2xl uppercase tracking-tighter"
              >
                Return to Lobby
              </button>
            </div>
          </div>
        )}
      </div>
    </DndContext>
  );
}