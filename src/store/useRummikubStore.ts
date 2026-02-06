import { create } from 'zustand';
import { RummikubTile } from '@/types/rummikub';

export interface BoardTile extends RummikubTile {
    x: number;
    y: number;
}

interface RummikubState {
    boardTiles: BoardTile[];
    handTiles: BoardTile[];
    myNickname: string;
    currentTurnNickname: string;
    isBoardValid: boolean;
    
    // Actions
    setMyNickname: (name: string) => void;
    setCurrentTurn: (name: string) => void;
    setBoardValid: (isValid: boolean) => void;
    initializeGame: (data: { table: RummikubTile[][], myHand: RummikubTile[] }) => void;
    moveTile: (tileId: string, to: 'board' | 'hand', x: number, y: number) => void;
    moveTileRemote: (tileId: number, x: number, y: number) => void;
    sortHand: (type: 'number' | 'color') => void;
}

export const useRummikubStore = create<RummikubState>((set) => ({
    boardTiles: [],
    handTiles: [],
    myNickname: '',
    currentTurnNickname: '',
    isBoardValid: true,

    setMyNickname: (name) => set({ myNickname: name }),
    setCurrentTurn: (name) => set({ currentTurnNickname: name }),
    setBoardValid: (isValid) => set({ isBoardValid: isValid }),

    initializeGame: (data) => set(() => {
        // 보드 타일 배치: 서버 세트별로 행(Row)을 나누어 배치
        const mappedBoard = (data.table || []).flatMap((chunk, rowIndex) => 
            chunk.map((tile, colIndex) => ({ ...tile, x: rowIndex, y: colIndex }))
        );
        // 손패 배치: 20열씩 끊어서 배치
        const mappedHand = (data.myHand || []).map((tile, i) => ({
            ...tile, x: Math.floor(i / 20), y: i % 20
        }));

        return { boardTiles: mappedBoard, handTiles: mappedHand };
    }),

    moveTile: (tileId, to, x, y) => set((state) => {
        // 1. 전체 타일에서 움직일 타일 찾기
        const allTiles = [...state.boardTiles, ...state.handTiles];
        const movingTile = allTiles.find(t => t.id.toString() === tileId.toString());
        
        if (!movingTile) return state;

        // 2. 기존 위치에서 제거
        const filteredBoard = state.boardTiles.filter(t => t.id.toString() !== tileId.toString());
        const filteredHand = state.handTiles.filter(t => t.id.toString() !== tileId.toString());

        // 3. 목적지에 타일 추가 (좌표 업데이트)
        const updatedTile = { ...movingTile, x, y };

        return to === 'board' 
            ? { boardTiles: [...filteredBoard, updatedTile], handTiles: filteredHand }
            : { boardTiles: filteredBoard, handTiles: [...filteredHand, updatedTile] };
    }),

    moveTileRemote: (tileId, x, y) => set((state) => ({
        // 원격 이동은 보드 내에서의 이동만 처리하는 경우가 많음
        boardTiles: state.boardTiles.map(t => 
            t.id.toString() === tileId.toString() ? { ...t, x, y } : t
        )
    })),

    sortHand: (type) => set((state) => {
        const sorted = [...state.handTiles].sort((a, b) => 
            type === 'color' 
                ? (a.color.localeCompare(b.color) || a.number - b.number) 
                : (a.number - b.number || a.color.localeCompare(b.color))
        );
        return { 
            handTiles: sorted.map((t, i) => ({ ...t, x: Math.floor(i / 20), y: i % 20 })) 
        };
    })
}));