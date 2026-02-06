"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { useRummikubStore } from "@/store/useRummikubStore";
import { RummikubValidator } from "@/utils/rummikubValidator";
import { rummikubApi } from "@/api/rummikub";
import { useWebSocket } from "@/contexts/WebSocketContext";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

import RummikubCell from "./RummikubCell";
import RummikubTile from "./RummikubTile";
import { useUserStore } from "@/store/useUserStore";

export default function RummikubGame({ roomId }: { roomId: string }) {
  const router = useRouter();
  const { user } = useUserStore();
  const numericRoomId = Number(roomId);
  const { subscribe, isConnected } = useWebSocket();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const { 
    boardTiles, handTiles, moveTile, sortHand, initializeGame,
    myNickname, currentTurnNickname, isBoardValid, setBoardValid,
    setMyNickname, setCurrentTurn 
  } = useRummikubStore();

  const [timer, setTimer] = useState(60);
  const [tilePoolCount, setTilePoolCount] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [winnerData, setWinnerData] = useState<any>(null);
  const [invalidIds, setInvalidIds] = useState<string[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  const [isDrawing, setIsDrawing] = useState(false);

  const isMyTurn = useMemo(() => currentTurnNickname === myNickname, [currentTurnNickname, myNickname]);

  // --- [로직 1] 데이터 동기화 ---
  const syncGameStatus = useCallback(async () => {
    setIsSyncing(true);
    try {
      const res = await rummikubApi.sync(numericRoomId);
      const data = res.data;

      if (user?.nickname) setMyNickname(user.nickname);
      setCurrentTurn(data.currentTurn);
      setTilePoolCount(data.tilePoolCount);
      setTimer(data.remainingSeconds);

      initializeGame({ 
        table: data.table || [], 
        myHand: data.myHand || [] 
      });
    } catch (err) {
      console.error("Rummikub sync failed:", err);
    } finally {
      setIsSyncing(false);
    }
  }, [numericRoomId, initializeGame, setMyNickname, setCurrentTurn, user?.nickname]);

  // --- [로직 2] 소켓 핸들링 (타이머 동기화 포함) ---
  const handleGameEvent = useCallback((event: any) => {
    // 서버에서 남은 시간을 내려줄 때마다 클라이언트 타이머 보정
    if (event.remainingSeconds !== undefined) {
      setTimer(event.remainingSeconds);
    }

    switch (event.type) {
      case 'TURN_CHANGED':
      case 'TILE_DRAWN':
        syncGameStatus();
        break;
      
      case 'TILE_MOVED':
        if (event.sender !== myNickname) {
          moveTile(event.data.tileId.toString(), 'board', event.data.toX, event.data.toY);
        }
        break;

      case 'GAME_OVER':
        setWinnerData(event.data);
        setIsGameOver(true);
        break;
    }
  }, [myNickname, moveTile, syncGameStatus]);

  useEffect(() => {
    if (!isConnected) return;
    syncGameStatus();
    const unsubscribe = subscribe(`/topic/game/RUMMIKUB/${roomId}`, handleGameEvent);
    return () => unsubscribe();
  }, [roomId, isConnected, subscribe, syncGameStatus, handleGameEvent]);

  // --- [로직 3] 클라이언트 타이머 보정 ---
  useEffect(() => {
    if (isGameOver) return;
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1 && isMyTurn) {
          // 시간이 다 되면 서버가 타임아웃 처리할 시간을 벌어준 뒤 동기화
          setTimeout(() => syncGameStatus(), 1500);
          return 0;
        }
        return prev > 0 ? prev - 1 : 0;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isGameOver, isMyTurn, syncGameStatus]);

  // --- [로직 4] 유효성 검사 ---
  useEffect(() => {
    const { isValid, invalidTileIds } = RummikubValidator.validateBoard(boardTiles);
    setInvalidIds(invalidTileIds);
    setBoardValid(isValid);
  }, [boardTiles, setBoardValid]);

  // --- [액션 1] 타일 드로우 (턴 넘기기) ---
  const handleDraw = async () => {
    if (!isMyTurn || isSyncing) return;
    
    setIsDrawing(true); // 애니메이션 시작
    try {
      await rummikubApi.draw(numericRoomId);
      // 애니메이션이 보여질 시간을 살짝 줍니다.
      setTimeout(async () => {
        await syncGameStatus();
        setIsDrawing(false);
      }, 600);
    } catch (err: any) {
      setIsDrawing(false);
      toast.error(err.response?.data?.message || "드로우 실패");
    }
  };

  // --- [액션 2] 드래그 종료 ---
  const handleDragEnd = async (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || !isMyTurn) return;

    const [area, x, y] = (over.id as string).split("-");
    const toX = Number(x), toY = Number(y);
    const tileId = Number(active.id);

    moveTile(active.id.toString(), area as any, toX, toY);

    if (area === "board") {
      try {
        await rummikubApi.move(numericRoomId, { tileId, toX, toY });
      } catch (err) {
        console.error("Movement sync failed");
      }
    }
  };

  // --- [액션 3] 제출 ---
  const handleSubmit = async () => {
    if (!isBoardValid) return toast.error("조합이 올바르지 않습니다.");
    try {
      const tableSets = RummikubValidator.getRowsWithChunks(boardTiles);
      const cleanTable = tableSets.map(set => set.map(({ x, y, ...rest }: any) => rest));
      const cleanHand = handTiles.map(({ x, y, ...rest }) => rest);

      await rummikubApi.submit(numericRoomId, {
        nickname: myNickname,
        newTable: cleanTable,
        newHand: cleanHand
      });

      toast.success("턴을 마쳤습니다.");
      await syncGameStatus(); 
    } catch (err: any) {
      toast.error(err.response?.data?.message || "제출 실패");
    }
  };

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(2,6,23,0.6)_100%)] z-0" />

      <div className="relative z-10 min-h-screen flex flex-col gap-6 p-4 md:p-8 max-w-450 mx-auto overflow-hidden text-white">
        
        {/* 상단 액션 바 (드로우 버튼 포함) */}
        <header className="flex flex-wrap items-center justify-between bg-slate-900/40 backdrop-blur-xl p-4 px-6 rounded-4xl border border-slate-800 shadow-2xl">
          <div className="flex items-center gap-6">
            <div className={`flex items-center gap-3 px-5 py-2 rounded-full border transition-all duration-500
              ${isMyTurn ? 'bg-blue-600/20 border-blue-500/50' : 'bg-slate-800/50 border-slate-700'}`}>
              <div className={`w-2 h-2 rounded-full ${isMyTurn ? 'bg-blue-400 animate-pulse' : 'bg-slate-600'}`} />
              <span className={`text-xs font-black uppercase tracking-widest ${isMyTurn ? 'text-blue-400' : 'text-slate-500'}`}>
                {isMyTurn ? "Your Strategy" : `${currentTurnNickname}'s Turn`}
              </span>
            </div>

            {/* 타일 풀 & 드로우 버튼 영역 */}
            <div className="flex items-center gap-5 border-l border-slate-800 pl-6">
              <div className="relative">
                {/* 🚀 날아가는 타일 애니메이션 */}
                <AnimatePresence>
                  {isDrawing && (
                    <motion.div
                      initial={{ x: 0, y: 0, opacity: 1, scale: 1, rotate: 0 }}
                      animate={{ 
                        x: 0, 
                        y: 300, // 아래쪽(손패 방향)으로 이동
                        opacity: 0, 
                        scale: 0.5,
                        rotate: 15 
                      }}
                      transition={{ duration: 0.6, ease: "backIn" }}
                      className="absolute inset-0 z-50 bg-white rounded-lg border-2 border-amber-200 shadow-2xl flex items-center justify-center"
                    >
                      <div className="w-4 h-6 bg-slate-200 rounded-sm animate-pulse" />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* 드로우 버튼 */}
                <button 
                  onClick={handleDraw}
                  disabled={!isMyTurn || isSyncing || isDrawing}
                  className={`
                    group relative w-20 h-20 rounded-2xl transition-all duration-300 shadow-2xl
                    flex flex-col items-center justify-center border-b-4 active:border-b-0 active:translate-y-1
                    ${isMyTurn 
                      ? 'bg-amber-500 border-amber-700 hover:bg-amber-400 cursor-pointer' 
                      : 'bg-slate-800 border-slate-900 opacity-50 cursor-not-allowed'}
                  `}
                >
                  {/* 타일 겹침 효과 (뒷면 타일들) */}
                  <div className="absolute -top-1 -left-1 w-full h-full bg-amber-600/30 rounded-2xl -z-10" />
                  
                  <span className={`text-[10px] font-black mb-1 leading-none ${isMyTurn ? 'text-amber-900' : 'text-slate-500'}`}>
                    DRAW
                  </span>
                  <span className={`text-2xl font-black leading-none ${isMyTurn ? 'text-white' : 'text-slate-400'}`}>
                    {tilePoolCount}
                  </span>

                  {/* 가이드 문구 */}
                  {isMyTurn && !isDrawing && (
                    <>
                      <span className="absolute -top-1 -right-1 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-200"></span>
                      </span>
                      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[9px] font-bold text-amber-500 animate-bounce whitespace-nowrap">
                        CLICK TO DRAW
                      </div>
                    </>
                  )}
                </button>
              </div>

              {/* 타이머 */}
              <div className="flex flex-col items-center justify-center bg-slate-950/40 px-4 py-2 rounded-2xl border border-slate-800 min-w-17.5">
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter">Time Left</p>
                <p className={`text-xl font-black font-mono leading-none ${timer < 10 ? 'text-red-500 animate-pulse' : 'text-blue-400'}`}>
                  {timer}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex bg-slate-950/50 p-1 rounded-2xl border border-slate-800">
              <button onClick={() => sortHand('color')} className="px-4 py-2 text-[10px] font-black hover:text-blue-400 transition-colors uppercase">Color</button>
              <button onClick={() => sortHand('number')} className="px-4 py-2 text-[10px] font-black hover:text-blue-400 transition-colors uppercase">Num</button>
            </div>
            <button 
              onClick={handleSubmit} 
              disabled={!isMyTurn || !isBoardValid || isSyncing}
              className={`px-8 py-3 rounded-2xl font-black text-sm transition-all shadow-xl active:scale-95
                ${isMyTurn && isBoardValid 
                  ? 'bg-blue-600 text-white hover:bg-blue-500 shadow-blue-600/20' 
                  : 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700'}`}
            >
              SUBMIT
            </button>
          </div>
        </header>

        {/* 메인 게임 보드 (동일) */}
        <main className={`flex-1 min-h-0 relative p-6 rounded-[3rem] border-4 border-slate-800/30 bg-slate-900/20 shadow-inner overflow-x-auto custom-scrollbar transition-all
          ${!isMyTurn && 'grayscale-[0.4] brightness-75 opacity-70 cursor-not-allowed'}`}>
          <div className="grid grid-cols-20 gap-2.5 min-w-350">
            {Array.from({ length: 8 * 20 }).map((_, i) => {
              const r = Math.floor(i / 20), c = i % 20;
              const cellId = `board-${r}-${c}`;
              const tile = boardTiles.find(t => t.x === r && t.y === c);
              return (
                <RummikubCell key={cellId} id={cellId}>
                  {tile && <RummikubTile tile={tile} isError={invalidIds.includes(tile.id.toString())} />}
                </RummikubCell>
              );
            })}
          </div>
        </main>

        {/* 손패 선반 (동일) */}
        <footer className="relative p-8 pb-10 rounded-[3rem] bg-linear-to-b from-slate-800/50 to-slate-950 border-t-8 border-slate-900 shadow-2xl overflow-x-auto custom-scrollbar">
          <div className="absolute -top-4 left-8 bg-[#020617] px-4 py-1 rounded-full border border-slate-800 text-[9px] font-black text-slate-500 tracking-widest uppercase">
            Your Rack • {myNickname}
          </div>
          <div className="grid grid-cols-20 gap-3 min-w-350">
            {Array.from({ length: 2 * 20 }).map((_, i) => {
              const r = Math.floor(i / 20), c = i % 20;
              const cellId = `hand-${r}-${c}`;
              const tile = handTiles.find(t => t.x === r && t.y === c);
              return (
                <RummikubCell key={cellId} id={cellId}>
                  {tile && <RummikubTile tile={tile} />}
                </RummikubCell>
              );
            })}
          </div>
        </footer>

        {/* 결과 모달 (동일) */}
        {isGameOver && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-100 p-4">
            <div className="bg-slate-900 border border-slate-800 p-12 rounded-[50px] text-center max-w-md w-full shadow-2xl">
              <h2 className="text-5xl font-black text-blue-500 mb-2 italic">GAME SET</h2>
              <div className="text-3xl font-black text-white mb-10">
                {winnerData?.winnerNickname === myNickname ? "🏆 VICTORY!" : "GG! NICE TRY"}
              </div>
              <button 
                onClick={() => router.push('/rooms')}
                className="w-full py-5 bg-white text-black rounded-3xl font-black hover:bg-blue-600 hover:text-white transition-all shadow-2xl"
              >
                RETURN TO LOBBY
              </button>
            </div>
          </div>
        )}
      </div>
    </DndContext>
  );
}