"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { useRummikubStore } from "@/store/useRummikubStore";
import { RummikubValidator } from "@/utils/rummikubValidator";
import { rummikubApi } from "@/api/rummikub";
import { useWebSocket } from "@/contexts/WebSocketContext"; // 야추와 동일한 컨텍스트 사용
import { toast } from "react-hot-toast";

import RummikubCell from "./RummikubCell";
import RummikubTile from "./RummikubTile";
import { useUserStore } from "@/store/useUserStore";

export default function RummikubGame({ roomId }: { roomId: string }) {
  const router = useRouter();
  const { user } = useUserStore();
  const numericRoomId = Number(roomId);
  const { subscribe, isConnected } = useWebSocket();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  // --- Rummikub 전용 스토어 ---
  const { 
    boardTiles, handTiles, moveTile, sortHand, initializeGame,
    myNickname, currentTurnNickname, isBoardValid, setBoardValid,
    setMyNickname, setCurrentTurn 
  } = useRummikubStore();

  // --- 상태 관리 로직 ---
  const [timer, setTimer] = useState(60);
  const [tilePoolCount, setTilePoolCount] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [winnerData, setWinnerData] = useState<any>(null);
  const [invalidIds, setInvalidIds] = useState<string[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  const isMyTurn = useMemo(() => currentTurnNickname === myNickname, [currentTurnNickname, myNickname]);

  // --- 로직 1: 데이터 동기화 ---
  const syncGameStatus = useCallback(async () => {
    setIsSyncing(true);
    try {
      const res = await rummikubApi.sync(numericRoomId);
      const data = res.data;

      // 상단 정보 업데이트
      if (user?.nickname) {
        setMyNickname(user.nickname);
      }
      setCurrentTurn(data.currentTurn);
      setTilePoolCount(data.tilePoolCount);
      setTimer(data.remainingSeconds);

      // 좌표 매핑 로직
      const mappedHand = data.myHand.map((t: any, i: number) => ({
        ...t, x: Math.floor(i / 20), y: i % 20 
      }));
      const mappedTable = (data.table || []).flatMap((row: any[], rIdx: number) => 
        row.map((tile, cIdx) => ({
          ...tile, x: rIdx, y: cIdx
        }))
      );

      initializeGame({ table: mappedTable, myHand: mappedHand });
    } catch (err) {
      console.error("Rummikub sync failed:", err);
      toast.error("데이터 동기화에 실패했습니다.");
    } finally {
      setIsSyncing(false);
    }
  }, [numericRoomId, initializeGame, setMyNickname, setCurrentTurn]);

  // --- 로직 2: 소켓 연결 및 이벤트 핸들링 ---
  useEffect(() => {
    if (!isConnected) return;

    syncGameStatus();

    const unsubscribe = subscribe(`/topic/game/RUMMIKUB/${roomId}`, (event: any) => {
      handleGameEvent(event);
    });

    return () => unsubscribe();
  }, [roomId, isConnected, subscribe, syncGameStatus]);

  const handleGameEvent = (event: any) => {
    // 공통 시간 동기화
    if (event.remainingSeconds !== undefined) setTimer(event.remainingSeconds);

    switch (event.type) {
      case 'TILE_DRAWN':
      case 'TURN_CHANGED':
        syncGameStatus(); // 턴이 바뀌거나 타일을 뽑으면 전체 동기화
        break;
      
      case 'TILE_MOVED':
        // 상대방이 움직인 경우 실시간 위치 반영
        if (event.sender !== myNickname) {
          moveTile(event.data.tileId.toString(), 'board', event.data.toX, event.data.toY);
        }
        break;

      case 'GAME_OVER':
        setWinnerData(event.data);
        setIsGameOver(true);
        break;
    }
  };

  // --- 로직 3: 독립 타이머 ---
  useEffect(() => {
    if (isGameOver) return;
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isGameOver]);

  // --- 로직 4: 유효성 검사 실시간 반영 ---
  useEffect(() => {
    const { isValid, invalidTileIds } = RummikubValidator.validateBoard(boardTiles);
    setInvalidIds(invalidTileIds);
    setBoardValid(isValid);
  }, [boardTiles, setBoardValid]);

  // --- 액션 함수 ---
  const handleDragEnd = async (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || !isMyTurn) return;

    const [area, x, y] = (over.id as string).split("-");
    const toX = Number(x), toY = Number(y);
    const tileId = Number(active.id);

    // 선반영 (Optimistic Update)
    moveTile(active.id.toString(), area as any, toX, toY);

    if (area === "board") {
      try {
        await rummikubApi.move(numericRoomId, { tileId, toX, toY });
      } catch (err) {
        console.error("Movement sync failed");
      }
    }
  };

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
      // 소켓 이벤트를 기다리기 전, 즉시 최신 상태를 한 번 더 가져옵니다.
      await syncGameStatus(); 
    } catch (err: any) {
      // 서버에서 보낸 에러 메시지가 있다면 표시
      const errorMsg = err.response?.data?.message || "제출에 실패했습니다.";
      toast.error(errorMsg);
    }
  };

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      {/* UI: 기존 Rummikub의 입체감 있는 디자인 유지 */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(2,6,23,0.6)_100%)] z-0" />

      <div className="relative z-10 min-h-screen flex flex-col gap-6 p-4 md:p-8 max-w-450 mx-auto overflow-hidden">
        
        {/* 상단 액션 바 */}
        <header className="flex flex-wrap items-center justify-between bg-slate-900/40 backdrop-blur-xl p-4 px-6 rounded-4xl border border-slate-800 shadow-2xl">
          <div className="flex items-center gap-6">
            <div className={`flex items-center gap-3 px-5 py-2 rounded-full border transition-all duration-500
              ${isMyTurn ? 'bg-blue-600/20 border-blue-500/50' : 'bg-slate-800/50 border-slate-700'}`}>
              <div className={`w-2 h-2 rounded-full ${isMyTurn ? 'bg-blue-400 animate-pulse' : 'bg-slate-600'}`} />
              <span className={`text-xs font-black uppercase tracking-widest ${isMyTurn ? 'text-blue-400' : 'text-slate-500'}`}>
                {isMyTurn ? "Your Strategy" : `${currentTurnNickname}'s Turn`}
              </span>
            </div>

            <div className="flex items-center gap-6 border-l border-slate-800 pl-6">
              <div className="text-center">
                <p className="text-[10px] text-slate-500 font-bold uppercase">Pool</p>
                <p className="text-lg font-black text-amber-500">{tilePoolCount}</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] text-slate-500 font-bold uppercase">Timer</p>
                <p className={`text-lg font-black font-mono ${timer < 10 ? 'text-red-500 animate-pulse' : 'text-blue-400'}`}>
                  00:{timer < 10 ? `0${timer}` : timer}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex bg-slate-950/50 p-1 rounded-2xl border border-slate-800">
              <button onClick={() => sortHand('color')} className="px-4 py-2 text-[10px] font-black hover:text-blue-400 transition-colors uppercase">Color</button>
              <button onClick={() => sortHand('number')} className="px-4 py-2 text-[10px] font-black hover:text-blue-400 transition-colors uppercase">Number</button>
            </div>
            <button 
              onClick={handleSubmit} 
              disabled={!isMyTurn || !isBoardValid || isSyncing}
              className={`px-8 py-3 rounded-2xl font-black text-sm transition-all shadow-xl active:scale-95
                ${isMyTurn && isBoardValid 
                  ? 'bg-blue-600 text-white hover:bg-blue-500 shadow-blue-600/20' 
                  : 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700'}`}
            >
              SUBMIT TURN
            </button>
          </div>
        </header>

        {/* 메인 게임 보드 */}
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

        {/* 하단 손패 선반 (Rack) */}
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

        {/* 결과 모달 */}
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