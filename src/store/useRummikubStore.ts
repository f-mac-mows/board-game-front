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

    initializeGame: (data) => set(() => ({
        boardTiles: data.table.flatMap((chunk, rowIndex) => 
            chunk.map((tile, colIndex) => ({ ...tile, x: rowIndex, y: colIndex }))
        ),
        handTiles: data.myHand.map((tile, i) => ({
            ...tile, x: Math.floor(i / 20), y: i % 20
        }))
    })),

    moveTile: (tileId, to, x, y) => set((state) => {
        const isBoard = to === 'board';
        const all = [...state.boardTiles, ...state.handTiles];
        const moving = all.find(t => t.id.toString() === tileId);
        if (!moving) return state;

        const newBoard = state.boardTiles.filter(t => t.id.toString() !== tileId);
        const newHand = state.handTiles.filter(t => t.id.toString() !== tileId);
        
        const targetList = isBoard ? [...newBoard] : [...newHand];
        targetList.push({ ...moving, x, y });

        return isBoard ? { boardTiles: targetList, handTiles: newHand } : { boardTiles: newBoard, handTiles: targetList };
    }),

    moveTileRemote: (tileId, x, y) => set((state) => ({
        boardTiles: state.boardTiles.map(t => t.id === tileId ? { ...t, x, y } : t)
    })),

    sortHand: (type) => set((state) => {
        const sorted = [...state.handTiles].sort((a, b) => 
            type === 'color' ? (a.color.localeCompare(b.color) || a.number - b.number) 
                             : (a.number - b.number || a.color.localeCompare(b.color))
        );
        return { handTiles: sorted.map((t, i) => ({ ...t, x: Math.floor(i / 20), y: i % 20 })) };
    })
}));