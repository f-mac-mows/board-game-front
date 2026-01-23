"use client"

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import api from "@/lib/axios";

export default function SetNicknamePage() {
    const [nickname, setNickname] = useState("");
    const [error, setError] = useState("");
    const searchParams = useSearchParams();
    const router = useRouter();

    useEffect(() => {
        const token = searchParams.get("token");
        if (token) {
            localStorage.setItem("token", token); // 임시 토큰 저장 (Patch 요청을 위해)
        } else {
            router.push("/login");
        }
    }, [searchParams, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.patch("/user/nickname", {nickname});
            router.push("/rooms");
        } catch (err: any) {
            setError(err.response?.data?.message || "사용할 수 없는 닉네임입니다.");
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-slate-900 p-8 rounded-2xl border border-slate-800">
                <h2 className="text-2xl font-bold text-blue-500 mb-6 text-center">프로필 완성하기</h2>
                <p className="text-slate-400 mb-8 text-center text-sm">
                    보드게임에서 사용할 닉네임을 설정해주세요. <br/> 이후에는 변경이 불가능합니다.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="text"
                        required
                        placeholder="닉네임 입력 (2~10자)"
                        className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 outline-none"
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                    />
                    {error && <p className="text-red-500 text-xs">{error}</p>}
                    <button className="w-full py-3 bg-blue-600 hober:bg-blue-700 text-white font-bold rounded-lg transition-all">
                        시작하기
                    </button>
                </form>
            </div>
        </div>
    );
}