"use client"

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { userApi } from "@/api/user";
import { useUserStore } from "@/store/useUserStore";

export default function SetNicknamePage() {
    const { setUser } = useUserStore();
    const [nickname, setNickname] = useState("");
    const [error, setError] = useState({
        nickname: "",
    });
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    // 유효성 검사 함수
    const validateField = (name: string, value: string) => {
        let error = "";
        if (name === "nickname") {
            if (value.length < 2) error = "닉네임은 최소 2자 이상입니다.";
            else if (value.length > 16) error = "닉네임은 최대 16자 이하입니다.";
        }
        setError(prev => ({ ...prev, [name]: error}));
    };

    const handleChange = ( e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        setNickname(value);
        validateField(name, value);
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (nickname.length < 2 || nickname.length > 16 || error.nickname) return;

        setIsLoading(true);
        try {
            await userApi.updateNickname(nickname);

            const response = await userApi.getMyInfo();
            
            setUser(response.data);

            alert("닉네임 설정이 완료되었습니다!");
            router.push("/");
        } catch (err: any) {
            console.error("에러 발생 세부사항:", err.response);
            setError({nickname: err.response?.data?.message || "사용할 수 없는 닉네임입니다."});
        } finally {
            setIsLoading(false);
        }
    };

    const isInvalid = nickname.length < 2 || nickname.length > 16 || error.nickname !== "";

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-slate-900 p-8 rounded-2xl border border-slate-800">
                <h2 className="text-2xl font-bold text-blue-500 mb-6 text-center">프로필 완성하기</h2>
                <p className="text-slate-400 mb-8 text-center text-sm">
                    보드게임에서 사용할 닉네임을 설정해주세요. <br/> 이후에는 변경이 불가능합니다.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative">
                        <input
                            name="nickname"
                            type="text"
                            required
                            placeholder="닉네임 입력 (2~16자)"
                            className={`mt-1 block w-full px-4 py-3 bg-slate-800 border rounded-lg text-white focus:ring-2 transition-all ${
                                error.nickname ? 'border-red-500 focus:ring-red-500' : 'border-slate-700 focus:ring-blue-500'
                            }`}
                            value={nickname}
                            onChange={handleChange}
                        />
                        <span className="absolute right-3 top-3.5 text-xs text-slate-500">
                            {nickname.length}/16
                        </span>
                    </div>
                    {error.nickname && (
                        <p className="text-red-500 text-xs animate-in fade-in slide-in-from-top-1">
                            {error.nickname}
                        </p>
                    )}
                    <button 
                        disabled={isInvalid || isLoading}
                        className={`w-full py-3 font-bold rounded-lg transition-all ${
                            isInvalid || isLoading 
                                ? 'bg-slate-700 text-slate-400 cursor-not-allowed' 
                                : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                    >
                        {isLoading ? "처리 중..." : "시작하기"}
                    </button>
                </form>
            </div>
        </div>
    );
}