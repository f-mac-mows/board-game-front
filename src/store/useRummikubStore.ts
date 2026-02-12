"use client";

import { create } from 'zustand';
import { 
  RummikubBoardTile, 
  RummikubTile, 
  TileColor, 
  HandTile,
  RummikubSyncResponse 
} from '@/types/rummikub';
import { RummikubValidator } from '@/utils/rummikubValidator';
import { RummikubSorter } from '@/utils/rummikubSorter';

const TILE_WIDTH = 55;
const TILE_HEIGHT = 80;
const BOARD_WIDTH = 1200;
const RACK_Y_START = 560;
const PADDING = 10;

interface RummikubState {
  boardTiles: RummikubBoardTile[];
  handTiles: HandTile[];
  myNickname: string;
  currentTurnNickname: string;
  isBoardValid: boolean;
  invalidTileIds: number[];
  currentBoardScore: number;
  tilePoolCount: number;
  isProcessing: boolean;
  remainingSeconds: number;
  originalBoardIds: Set<number>;

  setMyNickname: (nickname: string) => void;
  setIsProcessing: (loading: boolean) => void;
  updateFromRemote: (data: RummikubSyncResponse) => void;
  moveTile: (tileId: number, x: number, y: number) => void;
  moveGroup: (setId: string, deltaX: number, deltaY: number) => void;
  remoteMoveTile: (tileId: number, setId: number | string, x: number, y: number) => void;
  sortHand: (type: 'color' | 'number') => void;
  validateCurrentBoard: () => void;
}

export const useRummikubStore = create<RummikubState>((set, get) => ({
  boardTiles: [],
  handTiles: [],
  originalBoardIds: new Set(),
  myNickname: '',
  currentTurnNickname: '',
  isBoardValid: true,
  invalidTileIds: [],
  currentBoardScore: 0,
  remainingSeconds: 60,
  tilePoolCount: 106,
  isProcessing: false,

  setMyNickname: (nickname) => set((state) => {
    // 🚩 현재 저장된 닉네임과 들어온 값이 같으면 아무것도 하지 않음
    if (state.myNickname === nickname) return state; 
    return { myNickname: nickname };
  }),

  setIsProcessing: (isProcessing) => set({ isProcessing }),

  // useRummikubStore.ts

  updateFromRemote: (data: RummikubSyncResponse) => {
    if (!data) return;

    set((state) => {
      const serverBoardIds = new Set(data.table?.map(t => t.tileId) || []);
      const remoteHand = data.myHand || [];
      
      // 1. 기존 타일들의 좌표를 Map으로 보관 (ID 유지용)
      const currentHandCoords = new Map(state.handTiles.map(t => [t.id, { x: t.x, y: t.y }]));
      
      // 2. 최종 결과가 담길 배열 (충돌 검사용으로도 사용됨)
      const nextHand: HandTile[] = [];

      // 겹침 확인 및 위치 수정 함수 (resolveCollision 응용)
      const findEmptySpot = (startX: number, startY: number, tiles: HandTile[]): { x: number, y: number } => {
        let targetX = startX;
        let targetY = startY;
        const gap = 5;

        // 현재 배치된 타일들 중 겹치는게 있는지 확인
        while (tiles.some(t => 
          Math.abs(t.y - targetY) < 40 && 
          targetX < t.x + TILE_WIDTH && 
          targetX + TILE_WIDTH > t.x
        )) {
          // 겹치면 오른쪽으로 밀기
          targetX += TILE_WIDTH + gap;

          // 화면 오른쪽 끝을 벗어나면 다음 줄로 내리기
          if (targetX + TILE_WIDTH > BOARD_WIDTH - PADDING) {
            targetX = PADDING;
            targetY += TILE_HEIGHT + 10;
          }
        }
        return { x: targetX, y: targetY };
      };

      // 3. 순회하며 좌표 결정
      remoteHand.forEach((t, idx) => {
        const existingPos = currentHandCoords.get(t.id);

        if (existingPos) {
          // ✅ 기존 타일은 그 자리 그대로 유지
          nextHand.push({
            ...t,
            x: existingPos.x,
            y: existingPos.y
          });
        } else {
          // ✅ 새 타일: 기본 위치를 잡고 빈 공간을 찾아 배치
          // 기본 위치는 랙의 첫 번째 줄(idx 기반)로 설정하되 findEmptySpot이 보정함
          const defaultX = PADDING + (idx * 60) % (BOARD_WIDTH - 100);
          const defaultY = RACK_Y_START;
          
          const safePos = findEmptySpot(defaultX, defaultY, nextHand);
          
          nextHand.push({
            ...t,
            x: safePos.x,
            y: safePos.y
          });
        }
      });

      return {
        boardTiles: (data.table || []).map(t => ({ ...t, setId: String(t.setId) })),
        handTiles: nextHand,
        originalBoardIds: serverBoardIds,
        currentTurnNickname: data.currentTurn,
        tilePoolCount: data.tilePoolCount,
        remainingSeconds: data.remainingSeconds ?? state.remainingSeconds,
        isBoardValid: true,
        isProcessing: false
      };
    });
  },

  moveTile: (tileId, x, y) => set((state) => {
    // 1. 기본 경계값 설정
    const BOARD_MAX_X = BOARD_WIDTH - TILE_WIDTH - PADDING;
    const BOARD_MAX_Y = RACK_Y_START - TILE_HEIGHT - 20; // 보드 영역 하단 한계
    const RACK_MAX_Y = 800; // 전체 캔버스 하단 한계 (UI에 맞춰 조절)

    const isToBoard = y < RACK_Y_START - 20;
    const target = state.boardTiles.find(t => t.tileId === tileId) || state.handTiles.find(t => t.id === tileId);

    if (!target) return state;

    let nextBoard = [...state.boardTiles.filter(t => t.tileId !== tileId)];
    let nextHand = [...state.handTiles.filter(t => t.id !== tileId)];

    // 🚩 2. X 좌표 1차 경계 제한 (좌/우 가출 방지)
    let finalX = Math.max(PADDING, Math.min(x, BOARD_MAX_X));
    let finalY = y;

    const resolveCollision = (targetX: number, targetY: number, tiles: any[], idKey: string): number => {
      const gap = 5;
      const overlapIdx = tiles.findIndex(t => 
        t[idKey] !== tileId && 
        Math.abs(t.y - targetY) < 30 && 
        targetX < t.x + TILE_WIDTH && 
        targetX + TILE_WIDTH > t.x
      );

      if (overlapIdx !== -1) {
        const overlappedTile = tiles[overlapIdx];
        let nextPushX = overlappedTile.x + TILE_WIDTH + gap;

        // 🚩 3. 밀어내기 중 경계 제한 (오른쪽 끝에 닿으면 반대 방향으로 밀거나 멈춤)
        if (nextPushX + TILE_WIDTH > BOARD_WIDTH - PADDING) {
          return targetX - (TILE_WIDTH + gap);
        }

        tiles[overlapIdx] = { 
          ...overlappedTile, 
          x: resolveCollision(nextPushX, targetY, tiles, idKey) 
        };
      }
      return targetX;
    };

    if (isToBoard) {
      // 🚩 4. 보드 영역 Y 좌표 제한 (위/아래 가출 방지)
      finalY = Math.max(PADDING, Math.min(y, BOARD_MAX_Y));

      let finalSetId = `temp-${Date.now()}`;
      const neighbor = nextBoard.find(t => 
        Math.abs(t.y - finalY) < 40 && Math.abs(t.x - finalX) < TILE_WIDTH + 20
      );

      if (neighbor) {
        finalY = neighbor.y;
        finalX = finalX > neighbor.x ? neighbor.x + TILE_WIDTH + 5 : neighbor.x - (TILE_WIDTH + 5);
        finalSetId = neighbor.setId;
      }

      finalX = resolveCollision(finalX, finalY, nextBoard, 'tileId');

      const newBoardTile: RummikubBoardTile = {
        tileId: tileId,
        tileValue: 'tileValue' in target ? target.tileValue : 
                   target.color === 'JOKER' ? 'JOKER' : `${target.color}_${target.number}`,
        x: finalX,
        y: finalY,
        setId: finalSetId
      };
      
      setTimeout(() => get().validateCurrentBoard(), 0);
      return { boardTiles: [...nextBoard, newBoardTile], handTiles: nextHand };
    } 
    else {
      // 🚩 5. 손패 영역 Y 좌표 제한
      finalY = Math.max(RACK_Y_START, Math.min(y, RACK_MAX_Y));
      finalX = resolveCollision(finalX, finalY, nextHand, 'id');
      
      const parsed = 'tileValue' in target 
        ? RummikubValidator.parseTileValue(target.tileValue) 
        : { color: target.color, number: target.number };
      
      const newHandTile: HandTile = {
        id: tileId,
        color: parsed.color as TileColor,
        number: parsed.number,
        x: finalX,
        y: finalY
      };
      
      setTimeout(() => get().validateCurrentBoard(), 0);
      return { boardTiles: nextBoard, handTiles: [...nextHand, newHandTile] };
    }
  }),

  moveGroup: (setId, deltaX, deltaY) => set((state) => ({
    boardTiles: state.boardTiles.map(t => 
      t.setId === setId ? { ...t, x: t.x + deltaX, y: t.y + deltaY } : t
    )
  })),

  remoteMoveTile: (tileId, setId, x, y) => {
    if (get().myNickname === get().currentTurnNickname) return;

    set((state) => ({
      boardTiles: state.boardTiles.map(t => 
        t.tileId === tileId ? { ...t, setId: String(setId), x, y } : t
      )
    }));
  },

  sortHand: (type) => {
    const { handTiles } = get();
    
    // 🚩 HandTile 리스트를 RummikubTile(Sorter 입력 규격) 리스트로 명확히 변환
    const rawTiles: RummikubTile[] = handTiles.map(t => ({
      id: t.id,
      number: t.number,
      color: t.color
    }));

    const sorted = type === 'color' 
      ? RummikubSorter.sortByColor(rawTiles) 
      : RummikubSorter.sortByNumber(rawTiles);
    
    set({
      handTiles: sorted.map((t, idx) => {
        // 🚩 Sorter가 반환한 것은 RummikubBoardTile 형식이므로 
        // 다시 HandTile 형식(id, number, color)으로 파싱해서 저장
        const parsed = RummikubValidator.parseTileValue(t.tileValue);
        
        return {
          id: t.tileId,
          number: parsed.number,
          color: parsed.color as TileColor,
          x: PADDING + (idx * 60) % (BOARD_WIDTH - 100),
          y: RACK_Y_START + (Math.floor((idx * 60) / (BOARD_WIDTH - 100)) * 90)
        };
      })
    });
  },

  validateCurrentBoard: () => {
    // 🚩 로직 비움: 이제 프론트에서 에러를 계산하지 않음
  }
}));