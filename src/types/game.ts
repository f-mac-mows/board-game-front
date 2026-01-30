// 게임의 전적 및 상태를 나타내는 인터페이스
export interface ScoreCard {
    nickname: string;
    ones?: number;
    twos?: number;
    threes?: number;
    fours?: number;
    fives?: number;
    sixes?: number;
    choice?: number;
    fourOfAKind?: number;
    fullHouse?: number;
    smallStraight?: number;
    largeStraight?: number;
    yacht?: number;
    totalScore: number;
}

// 주사위 롤링 결과 데이터
export interface DiceStatus {
    diceValues: number[]
    remainingRolls: number;
    turnNickname: string;
}

// 최종 게임 결과 데이터
export interface GameResult {
    winnerNickname: string;
    draw: boolean;
    scoreCards: ScoreCard[];
}

// 공통 베이스 인터페이스를 만들면 관리가 편합니다
interface BaseGameEvent {
    sender: string;
    remainingSeconds: number; // 서버에서 보내주는 필수 필드로 정의
}

interface KeepUpdatedEvent extends BaseGameEvent {
    type: 'KEEP_UPDATED';
    keepIndices: number[];
}

interface DiceRollEvent extends BaseGameEvent {
    type: 'DICE_ROLLED';
    data: DiceStatus;
    nextTurn?: string;
}

interface ScoreRecordedEvent extends BaseGameEvent {
    type: 'SCORE_RECORDED';
    data: ScoreCard[];
    nextTurn?: string;
}

interface GameOverEvent extends BaseGameEvent {
    type: 'GAME_OVER';
    data: GameResult;
    roomId: number;
}

interface SystemMessageEvent extends BaseGameEvent {
    type: 'TURN_CHANGED' | 'USER_DISCONNECTED';
    sender: 'SYSTEM';
    data: string;
    nextTurn?: string;
}

// 게임 이벤트
export type YachtGameEvent = DiceRollEvent | ScoreRecordedEvent | GameOverEvent | SystemMessageEvent | KeepUpdatedEvent;

// 다이스 카테고리
export type ScoreCategory = 'ONES' | 'TWOS' | 'THREES' | 'FOURS' | 'FIVES' | 'SIXES' | 'CHOICE' | 'FOUR_OF_A_KIND' | 'FULL_HOUSE' | 'SMALL_STRAIGHT' | 'LARGE_STRAIGHT' | 'YACHT';

export const CategoryLabel: Record<ScoreCategory, string> = {
    ONES: 'Ones',
    TWOS: 'Twos',
    THREES: 'Threes',
    FOURS: 'Fours',
    FIVES: 'Fives',
    SIXES: 'Sixes',
    CHOICE: 'Choice',
    FOUR_OF_A_KIND: '4 of a Kind',
    FULL_HOUSE: 'Full House',
    SMALL_STRAIGHT: 'Small Straight',
    LARGE_STRAIGHT: 'Large Straight',
    YACHT: 'Yacht',
};

// 서버 공통 에러 응답 규격
export interface ErrorResponse {
    errorCode: string;
    message: string;
}

// 자주 발생하는 에러 코드 모음
export type GameErrorCode = 'NOT_YOUR_TURN' | 'NO_MORE_ROLLS' | 'ALREADY_FILLED' | 'INVALID_CATEGORY' | 'INTERNAL_SERVER_ERROR';