export interface UserTitleResponse {
    code: string;           // 칭호 고유 코드 (예: 'START_DASH')
    name: string;           // 칭호 이름 (예: '보드게임 입문자')
    description: string;    // 칭호 설명
    rarityColor: string;    // UI에 표시할 색상 코드
    isEquipped: boolean;    // 현재 장착 여부
    acquiredAt: string;     // 획득 일자 (ISO 8601)
}

// 칭호 장착 변경 시 사용할 요청 타입
export interface EquipTitleRequest {
    code: string;
}