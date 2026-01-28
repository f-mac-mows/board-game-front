"use client";

import { useEffect, useState } from "react";

interface DiceProps {
    value: number | string; // number 외에 'e' 같은 문자열도 허용
    isRolling: boolean;
    isKeep: boolean;
    onClick: () => void;
}

export default function Dice({ value, isRolling, isKeep, onClick }: DiceProps) {
    // 초기값이 'e'인 경우 렌더링용 상태도 맞춰줌
    const [displayValue, setDisplayValue] = useState<number | string>(value);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isRolling && !isKeep) {
            interval = setInterval(() => {
                // 롤링 중에는 숫자만 보여줌
                setDisplayValue(Math.floor(Math.random() * 6) + 1);
            }, 100);
        } else {
            // 롤링이 끝나면 실제 서버에서 온 value(숫자 혹은 'e')를 세팅
            setDisplayValue(value);
        }
        return () => clearInterval(interval);
    }, [isRolling, value, isKeep]);

    // 실제 화면에 출력할 값 결정
    const renderValue = () => {
    // 1. 현재 굴러가는 중이라면 (랜덤 숫자 표시 중)
    if (isRolling && !isKeep) {
        return isNaN(Number(displayValue)) ? "0" : displayValue;
    }

    // 2. 굴러가는 중이 아닐 때 실제 값(value) 처리
    // value가 'e' 이거나, null, undefined, 혹은 실제 NaN인 경우를 모두 방어
    if (typeof value !== 'number' || isNaN(value)) {
        return "0"; // 혹은 "" (빈 값)
    }

    // 3. 정상적인 숫자일 때만 숫자 반환
    return value;
};

    return (
        <button
            onClick={onClick}
            // 아직 굴리지 않은 상태('e')에서는 클릭(KEEP) 못하게 막기
            disabled={typeof value !== 'number'}
            className={`
                relative w-16 h-16 lg:w-24 lg:h-24 rounded-2xl text-3xl lg:text-4xl font-black 
                flex items-center justify-center transition-all duration-300
                ${isRolling && !isKeep ? "animate-dice" : ""}
                ${isKeep 
                    ? "bg-blue-600 border-4 border-blue-400 -translate-y-3 shadow-[0_20px_40px_rgba(37,99,235,0.3)]" 
                    : "bg-slate-800 border-2 border-slate-700 hover:border-slate-500 shadow-xl"}
                ${typeof value !== 'number' ? "opacity-50 cursor-default" : "cursor-pointer"}
            `}
        >
            <span className={isRolling && !isKeep ? "opacity-50" : "opacity-100"}>
                {String(renderValue())}
            </span>
            
            {isKeep && (
                <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-[10px] bg-blue-400 text-black px-2 py-0.5 rounded font-black tracking-tighter">
                    KEEP
                </span>
            )}
        </button>
    );
}