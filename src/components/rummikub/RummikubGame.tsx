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

const ACTIVATION_CONSTRAINT = { distance: 5 };

export default function RummikubGame({ roomId }: { roomId: string }) {
  const numericRoomId = Number(roomId);
  const { user } = useUserStore();
  const { subscribe, isConnected, sendMessage } = useWebSocket();
  const { submitTurn, drawTile, syncGame } = useRummikubActions(numericRoomId);

  const { 
    boardTiles, handTiles, moveTile, moveGroup, updateFromRemote, remoteMoveTile,
    myNickname, currentTurnNickname, setMyNickname, isProcessing, remainingSeconds
  } = useRummikubStore();

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: ACTIVATION_CONSTRAINT }));
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [isGameOver, setIsGameOver] = useState(false);
  const [winnerData, setWinnerData] = useState<any>(null);
  const hasSynced = useRef(false);

  const isMyTurn = myNickname === currentTurnNickname;
  const canInteract = isMyTurn && !isProcessing && !isGameOver;
  const userNicknameRef = useRef(user?.nickname);
  

  // 🚩 1. 유저 정보가 들어오면 스토어에 내 닉네임 강제 주입
  useEffect(() => {
    if (user?.nickname && myNickname !== user.nickname) {
      setMyNickname(user.nickname);
    }
  }, [user?.nickname, myNickname, setMyNickname]);

  // 🚩 syncGame을 안전하게 호출하기 위한 Ref
  const syncRef = useRef(syncGame);
    useEffect(() => {
      syncRef.current = syncGame;
    }, [syncGame]);
    
  useEffect(() => {
    timerRef.current = setInterval(() => {
      // 스토어의 값을 직접 set하는 대신, 내부 로직으로 1초씩 줄어들게 함
      useRummikubStore.setState((state) => ({
        remainingSeconds: state.remainingSeconds > 0 ? state.remainingSeconds - 1 : 0
      }));
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  
  useEffect(() => {
    userNicknameRef.current = user?.nickname;
  }, [user?.nickname]);
  
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
    
    // 🚩 [방어 로직] dragData에 값이 없으면 스토어를 뒤져서라도 찾아냅니다.
    let currentTileValue = dragData.tileValue;
    
    if (!currentTileValue) {
      const state = useRummikubStore.getState();
      // 보드 타일에서 찾거나, 손패 타일에서 찾아서 조합
      const foundBoard = state.boardTiles.find(t => t.tileId === tileId);
      const foundHand = state.handTiles.find(t => t.id === tileId);
      
      if (foundBoard) {
        currentTileValue = foundBoard.tileValue;
      } else if (foundHand) {
        currentTileValue = foundHand.color === 'JOKER' ? 'JOKER' : `${foundHand.color}_${foundHand.number}`;
      }
    }

    // 🚩 만약 여전히 값이 없다면 전송을 차단해서 404 에러(Axios Fallback)를 막습니다.
    if (!currentTileValue) return;

    sendDragUpdate({
      tileId,
      tileValue: currentTileValue, // 🚩 null이 아닌 값을 강제로 주입
      toX: dragData.x + delta.x,
      toY: dragData.y + delta.y,
      setId: String(dragData.setId || 0).startsWith('temp') ? 0 : Number(dragData.setId || 0)
    });
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
        sendBatchDragUpdate(finalUpdates);
      }, 0);
    } else {
      moveTile(tileId, dragData.x + delta.x, dragData.y + delta.y);
      if (isBoardArea) {
        setTimeout(() => {
          const finalTile = useRummikubStore.getState().boardTiles.find(t => t.tileId === tileId);
          if (finalTile) {
            sendDragUpdate({
              tileId: finalTile.tileId,
              tileValue: finalTile.tileValue,
              toX: finalTile.x,
              toY: finalTile.y,
              setId: finalTile.setId.startsWith('temp') ? 0 : Number(finalTile.setId)
            });
          }
        }, 0);
      }
    }
  };

  /**
   * 3. 소켓 이벤트 통합 핸들러 (Ref 기반 최적화)
   * 의존성 배열을 비워 리렌더링 시 함수가 재생성되는 것을 막습니다.
   */
  const handleGameEvent = useCallback((event: any) => {
    switch (event.type) {
      case 'REFRESH_SIGNAL':
        if (event.data) {
          updateFromRemote(event.data);
          // Ref를 사용하여 외부 의존성 제거
          if (event.sender !== userNicknameRef.current) {
            toast(`${event.sender}님이 턴을 마쳤습니다.`, { icon: '🔔', id: 'remote-action' });
          }
        }
        syncRef.current();
        break;
      case 'GAME_OVER':
        if (event.data) setWinnerData(event.data);
        setIsGameOver(true);
        break;
      default:
        if (event.nickname && event.nickname !== userNicknameRef.current) {
          if (event.tileId) {
            remoteMoveTile(event.tileId, String(event.setId), event.x, event.y, event.tileValue);
          } else if (event.updates) {
            event.updates.forEach((u: any) => remoteMoveTile(u.tileId, String(u.setId), u.toX, u.toY, u.tileValue));
          }
        }
    }
  }, [updateFromRemote, remoteMoveTile]); 

  // 1. 이벤트 핸들러 로직을 Ref에 담습니다.
  const eventHandlerRef = useRef(handleGameEvent);
    useEffect(() => {
      eventHandlerRef.current = handleGameEvent;
    }, [handleGameEvent]);

  // 2. useEffect의 의존성을 최소화합니다.
  useEffect(() => {
    if (!isConnected) return;

    if (!hasSynced.current) {
      hasSynced.current = true;
      syncRef.current();
    }

    // 🚩 직접 handleGameEvent를 넘기지 않고, Ref를 실행하는 익명 함수를 넘깁니다.
    // 이렇게 하면 handleGameEvent가 아무리 변해도 이 이펙트는 다시 실행되지 않습니다.
    const unsubscribe = subscribe(
      `/topic/game/RUMMIKUB/${roomId}`, 
      (event) => eventHandlerRef.current(event)
    );
    
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [isConnected, roomId, subscribe]); // 🚩 handleGameEvent를 의존성에서 제거!

  // 6. 턴 제출 핸들러 (그룹핑 로직 포함)
  const handleSubmit = async () => {
    if (isProcessing || !isMyTurn) return;
    
    const { boardTiles, handTiles } = useRummikubStore.getState();
    const myActionTiles = boardTiles.filter(t => !t.isRemote);

    const assignedTiles: any[] = [];
    const visited = new Set<number>();
    let currentSetId = 1;

    // 클라이언트 사이드 인접 타일 그룹핑 로직
    myActionTiles.forEach((startTile) => {
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
      await syncGame();
    } catch (err) {
      syncGame(); // 실패 시 서버 상태로 롤백
    }
  };

  const handleDrawClick = async () => {
    if (isProcessing) return;

    try {
      // 🚩 1. 타일을 뽑습니다. (이 API의 응답에는 새로 뽑힌 타일이 포함된 myHand가 들어있어야 합니다.)
      await drawTile();
      
      // 🚩 2. 뽑은 직후, 서버에 저장된 내 최신 핸드 정보를 가져와서 화면을 갱신합니다.
      // 이렇게 하면 다음 턴을 기다릴 필요 없이 즉시 내 핸드에 타일이 추가됩니다.
      await syncGame(); 
      
      // 🚩 3. (선택 사항) 만약 타일이 추가되었는데 화면에 안 보인다면 
      // 새로운 타일들을 핸드 영역 적절한 위치에 배치하는 로직이 스토어에 있어야 합니다.
    } catch (err) {
      console.error("드로우 에러:", err);
    }
  };

  return (
    <DndContext sensors={sensors} onDragMove={handleDragMove} onDragEnd={handleDragEnd}>
      <div className="relative z-10 min-h-screen flex flex-col gap-6 p-8 max-w-350 mx-auto text-white">
        <RummikubHeader 
          timer={remainingSeconds} 
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
                  x: tile.x, y: tile.y, setId: "0" , isRemote: false
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