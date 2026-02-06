// 타일 기본 타입
export type TileColor = 'RED' | 'BLUE' | 'YELLOW' | 'BLACK' | 'JOKER';

export interface RummikubTile {
    id: number;
    number: number; // 조커는 보통 0 또는 특정 숫자로 처리 (백엔드와 일치 필요)
    color: TileColor;
    joker: boolean;
}

// 플레이어 점수 및 상태
export interface RummikubPlayerScore {
    nickname: string;
    score: number;        // 벌점 합계
    winner: boolean;
    remainingTiles?: RummikubTile[];
}

// 루미큐브 이벤트 타입
export type RummikubEventType = 'TILE_DRAWN' | 'TURN_SUBMITTED' | 'TURN_CHANGED' | 'GAME_OVER' | 'USER_DISCONNECTED';

interface BaseRummikubEvent {
    type: RummikubEventType;
    sender: string;
    remainingSeconds: number;
    nextTurn?: string;
}

export interface RummikubGameEvent extends BaseRummikubEvent {
    data: {
        tableSets?: RummikubTile[][];
        winnerNickname?: string;
        finalScores?: RummikubPlayerScore[];
        message?: string;
    };
}

// 제출 시 보낼 데이터
export interface RummikubSubmitRequest {
    nickname: string;
    newTable: RummikubTile[][];
    newHand: RummikubTile[];
}