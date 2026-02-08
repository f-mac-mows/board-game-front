"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { DndContext, DragEndEvent, DragMoveEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
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

  const { 
    boardTiles, handTiles, moveTile, sortHand, initializeGame,
    myNickname, currentTurnNickname, isBoardValid,
    setMyNickname, setCurrentTurn, moveGroup, setBoardTiles, remoteMoveTile
  } = useRummikubStore();

  const { submitTurn, drawTile, moveTileApi, moveBatchApi, syncGame, isSubmitting, isDrawing } = useRummikubActions(numericRoomId);

  const [timer, setTimer] = useState(60);
  const [tilePoolCount, setTilePoolCount] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [winnerData, setWinnerData] = useState<any>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const isMyTurn = useMemo(() => currentTurnNickname === myNickname, [currentTurnNickname, myNickname]);
  const lastSendTime = useRef<number>(0);
  const hasSynced = useRef(false);

  const syncGameStatus = useCallback(async () => {
    if (hasSynced.current) return;
    setIsSyncing(true);
    try {
      const res = await syncGame(); 
      if (user?.nickname) setMyNickname(user.nickname);
      setCurrentTurn(res.currentTurn);
      setTilePoolCount(res.tilePoolCount);
      setTimer(res.remainingSeconds);
      initializeGame({ table: res.table || [], myHand: res.myHand || [] });
      hasSynced.current = true;
    } catch (err) {
      console.error("Game sync failed", err);
    } finally {
      setIsSyncing(false);
    }
  }, [syncGame, user?.nickname, initializeGame, setMyNickname, setCurrentTurn]);

  const handleGameEvent = useCallback((event: any) => {
    if (event.remainingSeconds !== undefined) setTimer(event.remainingSeconds);

    switch (event.type) {
      case 'TURN_CHANGED':
        // 🚩 내 턴이 아닐 때만 서버 보드로 갱신하여 충돌 방지
        if (event.data?.boardTiles) {
          useRummikubStore.setState({ boardTiles: event.data.boardTiles });
        }
        setCurrentTurn(event.nextTurn);
        if (event.nextTurn === myNickname) toast.success("당신의 턴입니다!");
        break;

      case 'TILE_DRAG':
        if (event.nickname !== myNickname) remoteMoveTile(event.tileId, event.x, event.y);
        break;
      
      case 'GAME_OVER':
        setWinnerData(event.data);
        setIsGameOver(true);
        break;
    }
  }, [myNickname, remoteMoveTile, setCurrentTurn]);

  useEffect(() => {
    if (!isConnected || hasSynced.current) return;
    syncGameStatus();
  }, [isConnected, syncGameStatus]);

  useEffect(() => {
    if (!isConnected) return;
    const unsubscribe = subscribe(`/topic/game/RUMMIKUB/${roomId}`, handleGameEvent);
    return () => unsubscribe();
  }, [roomId, isConnected, subscribe, handleGameEvent]);

  const handleDragMove = (e: DragMoveEvent) => {
    if (!isMyTurn || !isConnected) return;
    const now = Date.now();
    if (now - lastSendTime.current < 50) return;

    const { active, delta } = e;
    const dragData = active.data.current;

    if (dragData?.type === 'individual') {
      sendMessage(`/topic/game/RUMMIKUB/${numericRoomId}/drag`, {
        type: 'TILE_DRAG',
        nickname: myNickname,
        tileId: dragData.tileId,
        x: dragData.x + delta.x,
        y: dragData.y + delta.y
      });
    }
    lastSendTime.current = now;
  };

  const handleDragEnd = async (e: DragEndEvent) => {
    const { active, over, delta } = e;
    if (!isMyTurn) return;

    const dragData = active.data.current;
    if (!dragData) return;

    const destination = over?.id === "game-board-area" ? 'board' : 'hand';
    
    if (dragData.type === 'group') {
      const setId = dragData.setId;
      moveGroup(setId, delta.x, delta.y);
      const updates = useRummikubStore.getState().boardTiles
        .filter(t => t.setId === setId)
        .map(t => ({ tileId: t.tileId, toX: t.x, toY: t.y, setId: t.setId }));
      moveBatchApi(updates);
    } else {
      const tileId = Number(dragData.tileId);
      const nextX = dragData.x + delta.x;
      const nextY = dragData.y + delta.y;

      moveTile(tileId, destination, nextX, nextY);

      if (destination === 'board') {
        const updated = useRummikubStore.getState().boardTiles.find(t => t.tileId === tileId);
        if (updated) moveTileApi({ tileId, toX: updated.x, toY: updated.y, setId: updated.setId });
      }
    }
  };

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
    <DndContext sensors={sensors} onDragMove={handleDragMove} onDragEnd={handleDragEnd}>
      {/* JSX 구조 생략 (기존과 동일) */}
      <div className="relative z-10 min-h-screen flex flex-col gap-6 p-8 max-w-325 mx-auto text-white">
        <header className="flex justify-between items-center bg-slate-900/40 p-6 rounded-4xl border border-slate-800 backdrop-blur-xl">
          <div className="flex gap-6 items-center">
            <div className={`px-5 py-2 rounded-full border ${isMyTurn ? 'bg-blue-600/20 border-blue-500' : 'bg-slate-800'}`}>
              <span className="text-xs font-black">{isMyTurn ? "YOUR TURN" : `${currentTurnNickname}'S TURN`}</span>
            </div>
            <button onClick={() => drawTile()} disabled={!isMyTurn || isDrawing} className="w-20 h-20 bg-amber-500 rounded-2xl font-black">DRAW ({tilePoolCount})</button>
            <div className="text-center"><p className="text-[10px] text-slate-500 font-bold">TIMER</p><p className="text-2xl font-black">{timer}</p></div>
          </div>
          <div className="flex gap-4">
            <button onClick={() => sortHand('color')} className="px-4 py-2 bg-slate-800 rounded-xl text-xs font-bold">COLOR</button>
            <button onClick={() => sortHand('number')} className="px-4 py-2 bg-slate-800 rounded-xl text-xs font-bold">NUMBER</button>
            <button onClick={handleSubmit} disabled={!isMyTurn || !isBoardValid || isSubmitting} className="px-8 py-3 bg-blue-600 rounded-2xl font-black">SUBMIT</button>
          </div>
        </header>

        <main className="flex-1 min-h-0">
          <RummikubBoardArea isMyTurn={isMyTurn}>
            {boardTiles.map((tile) => (
              <RummikubTile key={`tile-${tile.tileId}`} tile={tile} />
            ))}
            {handTiles.map((tile) => (
              <RummikubTile 
                key={`tile-${tile.id}`} 
                tile={{ tileId: tile.id, tileValue: `${tile.color}_${tile.number}`, x: tile.x, y: tile.y, setId: 0 }} 
              />
            ))}
          </RummikubBoardArea>
        </main>
      </div>

      <AnimatePresence>
        {isGameOver && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} className="fixed inset-0 bg-black/90 flex items-center justify-center z-100">
             <div className="bg-slate-900 p-12 rounded-[50px] border border-slate-800 text-center">
               <h2 className="text-5xl font-black text-blue-500 mb-6 italic">GAME OVER</h2>
               <p className="text-white text-2xl mb-10">Winner: {winnerData?.winnerNickname}</p>
               <button onClick={() => router.push('/rooms')} className="w-full py-5 bg-white text-black rounded-3xl font-black">Lobby</button>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </DndContext>
  );
}