import { useState, useEffect } from "react";

/**
 * @param value 디바운싱할 대상 값
 * @param delay 지연 시간 (ms)
 * @returns 지연된 값
 */
export function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        // delay 시간이 지나면 debouncedValue를 업데이트합니다.
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        // value가 바뀌거나 컴포넌트가 언마운트되면 이전 타이머를 취소합니다.
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}