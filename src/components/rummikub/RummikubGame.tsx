"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { DndContext, DragEndEvent, DragMoveEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { throttle } from "lodash";
import toast from "react-hot-toast";

import { useRummikubStore } from "@/store/useRummikubStore";
import { useRummikubActions } from "@/hooks/useRummikub";
import { useWebSocket } from "@/contexts/WebSocketContext";
import { useUserStore } from "@/store/useUserStore";

import RummikubBoardArea from "./RummikubBoardArea";
import RummikubTile from "./RummikubTile";
import RummikubHeader from "./RummikubHeader";
import RummikubGameOver from "./RummikubGameOver";
import { RummikubSubmitRequest } from "@/types/rummikub";

const ACTIVATION_CONSTRAINT = { distance: 5 };

export default function RummikubGame({ roomId }: { roomId: string }) {
  const numericRoomId = Number(roomId);
  const { user } = useUserStore();
  const { subscribe, isConnected, sendMessage } = useWebSocket();
  const { submitTurn, drawTile, moveTileApi, moveBatchApi, syncGame } = useRummikubActions(numericRoomId);

  const { 
    boardTiles, handTiles, moveTile, moveGroup, updateFromRemote, remoteMoveTile,
    myNickname, currentTurnNickname, setMyNickname, isProcessing, setIsProcessing 
  } = useRummikubStore();

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: ACTIVATION_CONSTRAINT }));
  const [timer, setTimer] = useState(60);
  const [isGameOver, setIsGameOver] = useState(false);
  const [winnerData, setWinnerData] = useState<any>(null);
  const hasSynced = useRef(false);

  const isMyTurn = myNickname === currentTurnNickname;
  const canInteract = isMyTurn && !isProcessing && !isGameOver;

  // 1. 실시간 드래그 전파 (백엔드 /app 접두사 반영)
  const sendDragUpdate = useCallback(
    throttle((data: any) => {
      sendMessage(`/app/game/rummikub/${roomId}/move`, data);
    }, 80), [roomId, sendMessage]
  );

  const sendBatchDragUpdate = useCallback(
    throttle((updates: any[]) => {
      sendMessage(`/app/game/rummikub/${roomId}/move-batch`, { updates });
    }, 80), [roomId, sendMessage]
  );

  // 2. 드래그 중 실시간 핸들러
  const handleDragMove = (e: DragMoveEvent) => {
    if (!canInteract) return;
    const { active, delta } = e;
    const dragData = active.data.current;
    if (!dragData) return;

    const tileId = Number(active.id.toString().replace('tile-', ''));

    if (dragData.type === 'group' && dragData.setId) {
      const updates = boardTiles
        .filter(t => t.setId === dragData.setId)
        .map(t => ({
          tileId: t.tileId,
          toX: t.x + delta.x,
          toY: t.y + delta.y,
          setId: t.setId.startsWith('temp') ? 0 : Number(t.setId)
        }));
      sendBatchDragUpdate(updates);
    } else {
      sendDragUpdate({
        tileId: tileId,
        toX: dragData.x + delta.x,
        toY: dragData.y + delta.y,
        setId: String(dragData.setId).startsWith('temp') ? 0 : Number(dragData.setId || 0)
      });
    }
  };

  // 3. 드래그 종료 핸들러 (최종 좌표 확정)
  const handleDragEnd = async (e: DragEndEvent) => {
    if (!canInteract) return;
    const { active, over, delta } = e;
    const dragData = active.data.current;
    if (!over || !dragData) return;

    const tileId = Number(active.id.toString().replace('tile-', ''));
    const isBoardArea = over.id === "game-board-area";

    if (dragData.type === 'group' && dragData.setId) {
      moveGroup(dragData.setId, delta.x, delta.y);
      setTimeout(() => {
        const finalUpdates = useRummikubStore.getState().boardTiles
          .filter(t => t.setId === dragData.setId)
          .map(t => ({ tileId: t.tileId, toX: t.x, toY: t.y, setId: Number(t.setId) }));
        if (finalUpdates.length > 0) moveBatchApi(finalUpdates);
      }, 0);
    } else {
      moveTile(tileId, dragData.x + delta.x, dragData.y + delta.y);
      if (isBoardArea) {
        setTimeout(() => {
          const finalTile = useRummikubStore.getState().boardTiles.find(t => t.tileId === tileId);
          if (finalTile) {
            moveTileApi({
              tileId: finalTile.tileId,
              toX: finalTile.x,
              toY: finalTile.y,
              setId: finalTile.setId.startsWith('temp') ? 0 : Number(finalTile.setId)
            });
          }
        }, 0);
      }
    }
  };

  // 4. 소켓 이벤트 통합 핸들러
  const handleGameEvent = useCallback((event: any) => {
    if (event.remainingSeconds !== undefined) setTimer(event.remainingSeconds);

    switch (event.type) {
      case 'REFRESH_SIGNAL':
        if (event.data) {
          updateFromRemote(event.data);
          if (event.sender !== user?.nickname) {
            toast(`${event.sender}님이 턴을 마쳤습니다.`, { icon: '🔔', id: 'remote-action' });
          }
        }
        break;
      case 'GAME_OVER':
        if (event.data) setWinnerData(event.data);
        setIsGameOver(true);
        break;
      default:
        // 타 플레이어 드래그 이동 반영
        if (event.nickname && event.nickname !== user?.nickname) {
          if (event.tileId) {
            remoteMoveTile(event.tileId, String(event.setId), event.x, event.y);
          } else if (event.updates) {
            event.updates.forEach((u: any) => remoteMoveTile(u.tileId, String(u.setId), u.toX, u.toY));
          }
        }
    }
  }, [updateFromRemote, remoteMoveTile, user?.nickname]);

  // 5. 초기화 및 구독
  useEffect(() => {
    if (!isConnected) return;
    if (!hasSynced.current) {
      syncGame().then(() => { hasSynced.current = true; });
    }
    const unsubscribe = subscribe(`/topic/game/RUMMIKUB/${roomId}`, handleGameEvent);
    return () => unsubscribe();
  }, [roomId, isConnected, subscribe, handleGameEvent, syncGame]);

  // 6. 턴 제출 핸들러 (그룹핑 로직 포함)
  const handleSubmit = async () => {
    if (isProcessing || !isMyTurn) return;
    
    const { boardTiles, handTiles } = useRummikubStore.getState();
    const assignedTiles: any[] = [];
    const visited = new Set<number>();
    let currentSetId = 1;

    // 클라이언트 사이드 인접 타일 그룹핑 로직
    boardTiles.forEach((startTile) => {
      if (visited.has(startTile.tileId)) return;
      const group: any[] = [];
      const queue = [startTile];
      visited.add(startTile.tileId);

      while (queue.length > 0) {
        const current = queue.shift()!;
        group.push(current);
        boardTiles.forEach((nextTile) => {
          if (!visited.has(nextTile.tileId)) {
            const isNearX = Math.abs(current.x - nextTile.x) < 70;
            const isSameY = Math.abs(current.y - nextTile.y) < 30;
            if (isNearX && isSameY) {
              visited.add(nextTile.tileId);
              queue.push(nextTile);
            }
          }
        });
      }
      group.sort((a, b) => a.x - b.x).forEach(t => {
        assignedTiles.push({ ...t, setId: currentSetId });
      });
      currentSetId++;
    });

    try {
      await submitTurn({
        nickname: myNickname,
        boardTiles: assignedTiles,
        newHand: handTiles.map(t => ({ id: t.id, number: t.number, color: t.color })) as any
      });
    } catch (err) {
      syncGame(); // 실패 시 서버 상태로 롤백
    }
  };

  const handleDrawClick = async () => {
    await drawTile();
  };

  return (
    <DndContext sensors={sensors} onDragMove={handleDragMove} onDragEnd={handleDragEnd}>
      <div className="relative z-10 min-h-screen flex flex-col gap-6 p-8 max-w-350 mx-auto text-white">
        <RummikubHeader 
          timer={timer} 
          onDraw={handleDrawClick} 
          onSubmit={handleSubmit}
          isProcessing={isProcessing || !isMyTurn}
          isBoardValid={true}
        />
        <main className="flex-1 min-h-150 border border-white/10 rounded-xl bg-black/20 backdrop-blur-sm overflow-hidden relative">
          <RummikubBoardArea>
            {boardTiles.map((tile) => <RummikubTile key={`board-${tile.tileId}`} tile={tile} disabled={!canInteract} />)}
            {handTiles.map((tile) => (
              <RummikubTile 
                key={`hand-${tile.id}`} 
                tile={{ 
                  tileId: tile.id, 
                  tileValue: tile.color === 'JOKER' ? 'JOKER' : `${tile.color}_${tile.number}`, 
                  x: tile.x, y: tile.y, setId: "0" 
                }}
                disabled={!canInteract}
              />
            ))}
          </RummikubBoardArea>
        </main>
      </div>
      <RummikubGameOver isVisible={isGameOver} data={winnerData} />
    </DndContext>
  );
}