"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  DndContext, 
  DragEndEvent, 
  DragMoveEvent, 
  PointerSensor, 
  useSensor, 
  useSensors 
} from "@dnd-kit/core";
import { useRummikubStore } from "@/store/useRummikubStore";
import { useRummikubActions } from "@/hooks/useRummikub";
import { useWebSocket } from "@/contexts/WebSocketContext";
import { useUserStore } from "@/store/useUserStore";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

import RummikubBoardArea from "./RummikubBoardArea";
import RummikubTile from "./RummikubTile";

export default function RummikubGame({ roomId }: { roomId: string }) {
  const router = useRouter();
  const { user } = useUserStore();
  const numericRoomId = Number(roomId);
  const { subscribe, isConnected, sendMessage } = useWebSocket();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  // 스토어 상태 및 액션
  const { 
    boardTiles, handTiles, moveTile, sortHand, initializeGame,
    myNickname, currentTurnNickname, isBoardValid, setBoardValid,
    setMyNickname, setCurrentTurn, moveGroup, setBoardTiles, remoteMoveTile
  } = useRummikubStore();

  // API 액션 훅
  const { submitTurn, drawTile, moveTileApi, moveBatchApi, syncGame, isSubmitting, isDrawing } = useRummikubActions(numericRoomId);

  // 로컬 UI 상태
  const [timer, setTimer] = useState(60);
  const [tilePoolCount, setTilePoolCount] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [winnerData, setWinnerData] = useState<any>(null);
  const [invalidIds, setInvalidIds] = useState<number[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  // 현재 내 턴인지 확인
  const isMyTurn = useMemo(() => currentTurnNickname === myNickname, [currentTurnNickname, myNickname]);

  // 실시간 드래그 전송 최적화 (Throttle)를 위한 Ref
  const lastSendTime = useRef<number>(0);

  // --- [로직] 초기 데이터 동기화 ---
  const syncGameStatus = useCallback(async () => {
  setIsSyncing(true);
  try {
    // 🚩 fetch 대신 훅의 syncGame 사용
    const res = await syncGame(); 
    
    if (user?.nickname) setMyNickname(user.nickname);
    setCurrentTurn(res.currentTurn);
    setTilePoolCount(res.tilePoolCount);
    setTimer(res.remainingSeconds);
    
    initializeGame({ 
      table: res.table || [], 
      myHand: res.myHand || [] 
    });
  } catch (err) {
    console.error("Game sync failed", err);
  } finally {
    setIsSyncing(false);
  }
}, [syncGame, user?.nickname, initializeGame, setMyNickname, setCurrentTurn]);

  // --- [로직] 소켓 이벤트 핸들러 ---
  const handleGameEvent = useCallback((event: any) => {
    if (event.remainingSeconds !== undefined) setTimer(event.remainingSeconds);

    switch (event.type) {
      case 'TURN_CHANGED':
        if (event.data?.boardTiles) setBoardTiles(event.data.boardTiles);
        setCurrentTurn(event.nextTurn);
        toast.success(`${event.nextTurn}님의 차례입니다.`);
        break;

      case 'TILE_DRAG': // 다른 유저의 단일 드래그
        if (event.nickname !== myNickname) {
          remoteMoveTile(event.tileId, event.x, event.y);
        }
        break;

      case 'TILE_BATCH_DRAG': // 다른 유저의 그룹 드래그
        if (event.nickname !== myNickname) {
          event.updates.forEach((u: any) => remoteMoveTile(u.tileId, u.toX, u.toY));
        }
        break;

      case 'GAME_OVER':
        setWinnerData(event.data);
        setIsGameOver(true);
        break;
    }
  }, [myNickname, remoteMoveTile, setBoardTiles, setCurrentTurn]);

  useEffect(() => {
    if (!isConnected) return;
    syncGameStatus();
    const unsubscribe = subscribe(`/topic/game/RUMMIKUB/${roomId}`, handleGameEvent);
    return () => unsubscribe();
  }, [roomId, isConnected, subscribe, syncGameStatus, handleGameEvent]);

  // --- [액션] 드래그 중 실시간 소켓 전송 (onDragMove) ---
  const handleDragMove = (e: DragMoveEvent) => {
    if (!isMyTurn || !isConnected) return;
    
    const now = Date.now();
    if (now - lastSendTime.current < 50) return; // 50ms 간격으로 전송 제한 (성능 최적화)

    const { active, delta } = e;
    const dragData = active.data.current;

    if (dragData?.type === 'individual') {
      const tile = boardTiles.find(t => t.tileId === dragData.tileId);
      if (tile) {
        sendMessage(`/topic/game/RUMMIKUB/${numericRoomId}/drag`, {
          type: 'TILE_DRAG',
          nickname: myNickname,
          tileId: tile.tileId,
          x: tile.x + delta.x,
          y: tile.y + delta.y
        });
      }
    }
    lastSendTime.current = now;
  };

  // --- [액션] 드래그 종료 시 DB 반영 (onDragEnd) ---
  const handleDragEnd = async (e: DragEndEvent) => {
    const { active, delta } = e;
    if (!isMyTurn) return;

    const dragData = active.data.current;
    
    if (dragData?.type === 'group') {
      const setId = dragData.setId;
      moveGroup(setId, delta.x, delta.y);
      
      const updates = useRummikubStore.getState().boardTiles
        .filter(t => t.setId === setId)
        .map(t => ({ tileId: t.tileId, toX: t.x, toY: t.y, setId: t.setId }));

      moveBatchApi(updates);

    } else if (dragData?.type === 'individual') {
      const tileId = Number(dragData.tileId);
      const tile = boardTiles.find(t => t.tileId === tileId) || handTiles.find(t => t.id === tileId);
      if (!tile) return;

      const nextX = (tile as any).x + delta.x;
      const nextY = (tile as any).y + delta.y;
      const destination = nextY < 600 ? 'board' : 'hand';

      moveTile(tileId, destination, nextX, nextY);

      if (destination === 'board') {
        const updatedTile = useRummikubStore.getState().boardTiles.find(t => t.tileId === tileId);
        if (updatedTile) {
          moveTileApi({ 
            tileId, 
            toX: updatedTile.x, 
            toY: updatedTile.y, 
            setId: updatedTile.setId 
          });
        }
      }
    }
  };

  // --- [액션] 턴 제출 및 드로우 ---
  const handleSubmit = () => {
    if (!isBoardValid) return;
    const currentHand = useRummikubStore.getState().handTiles.map(({x, y, ...rest}) => rest);
    submitTurn({
      nickname: myNickname,
      boardTiles: boardTiles.map(t => ({ tileId: t.tileId, x: t.x, y: t.y, setId: t.setId })),
      newHand: currentHand
    });
  };

  return (
    <DndContext 
      sensors={sensors} 
      onDragMove={handleDragMove} 
      onDragEnd={handleDragEnd}
    >
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(2,6,23,0.6)_100%)] z-0" />

      <div className="relative z-10 min-h-screen flex flex-col gap-6 p-4 md:p-8 max-w-325 mx-auto overflow-hidden text-white">
        
        {/* 상단 헤더 영역 (타이머, 드로우 버튼 등) */}
        <header className="flex flex-wrap items-center justify-between bg-slate-900/40 backdrop-blur-xl p-4 px-6 rounded-4xl border border-slate-800 shadow-2xl">
          <div className="flex items-center gap-6">
            <div className={`flex items-center gap-3 px-5 py-2 rounded-full border transition-all duration-500
              ${isMyTurn ? 'bg-blue-600/20 border-blue-500/50' : 'bg-slate-800/50 border-slate-700'}`}>
              <div className={`w-2 h-2 rounded-full ${isMyTurn ? 'bg-blue-400 animate-pulse' : 'bg-slate-600'}`} />
              <span className="text-xs font-black uppercase tracking-widest">
                {isMyTurn ? "Your Turn" : `${currentTurnNickname}'s Turn`}
              </span>
            </div>

            <div className="flex items-center gap-5 border-l border-slate-800 pl-6">
              <button 
                onClick={() => drawTile()}
                disabled={!isMyTurn || isSyncing || isDrawing}
                className="group relative w-20 h-20 bg-amber-500 rounded-2xl border-b-4 border-amber-700 active:border-0 active:translate-y-1 transition-all disabled:opacity-50"
              >
                <span className="text-[10px] font-black text-amber-900 block">DRAW</span>
                <span className="text-2xl font-black text-white">{tilePoolCount}</span>
              </button>

              <div className="bg-slate-950/40 px-4 py-2 rounded-2xl border border-slate-800 text-center min-w-16">
                <p className="text-[9px] text-slate-500 font-bold">TIMER</p>
                <p className={`text-xl font-black ${timer < 10 ? 'text-red-500' : 'text-blue-400'}`}>{timer}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex bg-slate-950/50 p-1 rounded-2xl border border-slate-800">
              <button onClick={() => sortHand('color')} className="px-4 py-2 text-[10px] font-black hover:text-blue-400">COLOR</button>
              <button onClick={() => sortHand('number')} className="px-4 py-2 text-[10px] font-black hover:text-blue-400">NUMBER</button>
            </div>
            <button 
              onClick={handleSubmit} 
              disabled={!isMyTurn || !isBoardValid || isSubmitting}
              className="px-8 py-3 bg-blue-600 rounded-2xl font-black text-sm hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600"
            >
              SUBMIT
            </button>
          </div>
        </header>

        {/* 게임 메인 보드 */}
        <main className="flex-1 min-h-0 relative">
          <RummikubBoardArea isMyTurn={isMyTurn}>
            {boardTiles.map((tile) => (
              <RummikubTile 
                key={`tile-${tile.tileId}`}
                tile={tile} 
                isError={invalidIds.includes(tile.tileId)} 
              />
            ))}
            {handTiles.map((tile) => (
              <RummikubTile 
                key={`tile-${tile.id}`} 
                tile={{
                  tileId: tile.id,
                  tileValue: `${tile.color}_${tile.number}`,
                  x: tile.x,
                  y: tile.y,
                  setId: 0
                }} 
              />
            ))}
          </RummikubBoardArea>
        </main>

        {/* 결과창 모달 */}
        <AnimatePresence>
          {isGameOver && (
            <motion.div initial={{opacity:0}} animate={{opacity:1}} className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-100 p-4">
               {/* 위 결과 모달 UI 코드 동일 */}
               <div className="bg-slate-900 p-12 rounded-[50px] text-center border border-slate-800">
                 <h2 className="text-5xl font-black text-blue-500 mb-6 italic">GAME OVER</h2>
                 <p className="text-white text-2xl mb-10">Winner: {winnerData?.winnerNickname}</p>
                 <button onClick={() => router.push('/rooms')} className="w-full py-5 bg-white text-black rounded-3xl font-black uppercase">Lobby</button>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DndContext>
  );
}