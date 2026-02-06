import { ErrorResponse } from "@/types/game";

export const handleGameError = (error: any) => {
    const { code, message } = error.response?.data as ErrorResponse;
    
    // 코드별 커스텀 메시지 전략
    const errorMap: Record<string, string> = {
        'YACHT_2001': '상대방의 차례입니다!',
        'YACHT_2002': '주사위 굴리기 기회를 모두 사용했습니다.',
        'YACHT_2003': '이미 점수가 기록된 칸입니다.',
        'COMMON_1003': '게임 정보를 찾을 수 없습니다.'
    };

    const displayMessage = errorMap[code] || message || '오류가 발생했습니다.';
    
    // toast.error(displayMessage); // 사용 중인 토스트 라이브러리 연결
    console.error(`[${code}] ${displayMessage}`);
};