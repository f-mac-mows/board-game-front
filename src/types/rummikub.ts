// 타일 색상 정의
export type TileColor = 'JOKER'| 'RED' | 'BLUE' | 'YELLOW' | 'BLACK';

// 기본 타일 정보 (손패 등에 사용)
export interface RummikubTile {
    id: number;
    number: number; // 조커는 0
    color: TileColor;
}

/**
 * 바닥에 놓인 타일 (좌표 및 세트 정보 포함)
 * 백엔드의 RummikubBoardTile 엔티티와 1:1 매칭
 */
export interface RummikubBoardTile {
    tileId: number;
    tileValue: string; // "RED_10", "JOKER_0" 등 (파싱하여 이미지 렌더링에 사용)
    x: number;
    y: number;
    setId: number;    // 같은 뭉치인지 판별 (검증 시 중요)
}

/**
 * 턴 제출 요청 (POST /{roomId}/submit)
 */
export interface RummikubSubmitRequest {
    nickname: string;
    boardTiles: {
        tileId: number;
        tileValue: string;
        x: number;
        y: number;
        setId: number;
    }[];
    newHand: RummikubTile[]; // 제출 후 남은 손패 리스트
}

/**
 * 복기용 로그 데이터 (GET /rummikub/{gameId}/replay)
 */
export interface RummikubGameLogResponse {
    id: string;            // MongoDB ID
    nickname: string;
    action: 'TURN_SUBMIT' | 'DRAW_TILE' | 'GAME_START' | 'GAME_END' | 'INITIAL_MELD';
    tileId?: number;       // DRAW_TILE 시 뽑은 타일
    tileIds?: number[];    // TURN_SUBMIT 시 관여된 타일들
    boardSnapshot: string; // JSON.parse() 하면 RummikubBoardTile[]가 됨
    memo: string;
    timestamp: string;
}

export type RummikubEventType = 'TURN_CHANGED' | 'GAME_OVER' | 'USER_DISCONNECTED';

export interface RummikubGameEvent {
    type: RummikubEventType;
    sender: string;       // 액션을 취한 유저
    roomId: number;
    remainingSeconds: number;
    nextTurn: string;     // 다음 순서 유저
    data: {
        // [중요] TURN_CHANGED 시 최신 바닥 상태를 내려주므로 프론트에서 자동 동기화 가능
        boardTiles?: RummikubBoardTile[]; 
        winnerNickname?: string;
        finalScores?: RummikubPlayerResult[]; // 게임 종료 시에만 포함
        message?: string;
    };
}

// 게임 종료 시 개별 플레이어의 결과
export interface RummikubPlayerResult {
    nickname: string;
    score: number;               // 벌점 (조커 페널티 적용됨)
    winner: boolean;
    remainingTiles: RummikubTile[]; 
}

export interface RummikubDragEvent {
    type: 'TILE_DRAG';
    nickname: string;
    tileId: number;
    x: number;
    y: number;
}

export interface TileMoveRequest {
  tileId: number;
  toX: number;
  toY: number;
  setId: number; // 👈 백엔드 updateTileLocation에 전달될 값
}