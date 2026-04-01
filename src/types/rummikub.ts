// 1. 기초 타일 정보
export type TileColor = 'JOKER' | 'RED' | 'BLUE' | 'YELLOW' | 'BLACK';

export interface RummikubTile {
    id: number;
    number: number; // 조커는 0
    color: TileColor;
}

/**
 * [수정] 백엔드 응답 규격 (SyncData)
 * submit, draw, sync API가 공통으로 반환하는 구조입니다.
 */
export interface RummikubSyncResponse {
    table: RummikubBoardTile[];
    players: RummikubPlayerInfo[];
    currentTurn: string;
    tilePoolCount: number;
    remainingSeconds: number;
    myHand?: RummikubTile[];    // 본인 손패
    status?: 'IN_PROGRESS' | 'FINISHED';
}

// 3. 실시간 소켓 이벤트 (다이어트 버전)
// 이제 소켓은 데이터를 실어 나르기보다 "사건 발생"을 알리는 용도입니다.
export type RummikubSocketType = 
    | 'REFRESH_SIGNAL' // 누군가 턴을 마침 -> 다같이 sync API 호출
    | 'TILE_DRAG'      // 실시간 드래그 좌표
    | 'BATCH_MOVE'     // 그룹 드래그 좌표
    | 'GAME_OVER'      // 게임 종료 상세 결과
    | 'USER_DISCONNECTED';

export interface RummikubSocketEvent {
    type: RummikubSocketType;
    sender: string;
    data?: any; // GAME_OVER 시에는 RummikubResultResponse가 담김
}

// 4. 게임 종료 상세 결과 (buildResultResponse 매칭)
export interface RummikubPlayerScore {
    nickname: string;
    score: number; // 페널티 점수
    remainingTiles: RummikubTile[];
    winner: boolean;
}

export interface RummikubResultResponse {
    winnerNickname: string;
    gameId: number;
    finalScores: RummikubPlayerScore[];
}

// 5. 드래그 및 이동 요청
export interface TileMoveRequest {
    tileId: number;
    tileValue: string;
    toX: number;
    toY: number;
    setId: number;
}

export interface RummikubBatchMoveRequest {
    updates: TileMoveRequest[];
}

/**
 * 플레이어 정보 요약
 */
export interface RummikubPlayerInfo {
    nickname: string;
    handCount: number;
    isHasMelded: boolean;
}

/**
 * 복기용 로그 데이터 (GET /rummikub/{gameId}/replay)
 */
export interface RummikubGameLogResponse {
    id: string;            // MongoDB ID
    nickname: string;
    action: 'TURN_SUBMIT' | 'DRAW_TILE' | 'GAME_START' | 'GAME_END' | 'INITIAL_MELD' | 'TIMEOUT';
    tileId?: number;       // DRAW_TILE 시 뽑은 타일
    tileIds?: number[];    // TURN_SUBMIT 시 관여된 타일들
    boardSnapshot: string; // JSON.parse() 하면 RummikubBoardTile[]가 되는 데이터
    memo: string;
    timestamp: string;
}

// 보드 위 타일 (UI 전용 setId: string)
export interface RummikubBoardTile {
    tileId: number;
    tileValue: string;
    x: number;
    y: number;
    setId: string; // UI에서는 string
    isRemote?: boolean;
}

// 손패 타일
export interface HandTile {
    id: number;
    number: number;
    color: TileColor;
    x: number;
    y: number;
}

// API 전송용 (Server 규격: setId: number)
export interface RummikubSubmitRequest {
    nickname: string;
    boardTiles: {
        tileId: number;
        tileValue: string;
        x: number;
        y: number;
        setId: number; // 서버는 number를 기대함
    }[];
    newHand: RummikubTile[];
}