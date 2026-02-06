"use client"

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { userApi } from "@/api/user";
import { useUserStore } from "@/store/useUserStore";
import { Check, ExternalLink } from "lucide-react"; // 아이콘 추가

export default function SetNicknamePage() {
    const { setUser } = useUserStore();
    const [nickname, setNickname] = useState("");
    const [agreed, setAgreed] = useState(false); // 약관 동의 상태 추가
    const [error, setError] = useState({
        nickname: "",
    });
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const validateField = (name: string, value: string) => {
        let error = "";
        if (name === "nickname") {
            if (value.length < 2) error = "닉네임은 최소 2자 이상입니다.";
            else if (value.length > 16) error = "닉네임은 최대 16자 이하입니다.";
        }
        setError(prev => ({ ...prev, [name]: error}));
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        setNickname(value);
        validateField(name, value);
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // 닉네임 유효성 + 약관 동의 확인
        if (nickname.length < 2 || nickname.length > 16 || error.nickname || !agreed) return;

        setIsLoading(true);
        try {
            await userApi.updateNickname(nickname);
            const response = await userApi.getMyInfo();
            setUser(response.data);
            router.push("/");
        } catch (err: any) {
            console.error("에러 발생 세부사항:", err.response);
            setError({nickname: err.response?.data?.message || "사용할 수 없는 닉네임입니다."});
        } finally {
            setIsLoading(false);
        }
    };

    // 버튼 비활성화 조건: 닉네임 에러가 있거나, 길이가 안 맞거나, 약관 동의 안 했거나
    const isInvalid = nickname.length < 2 || nickname.length > 16 || error.nickname !== "" || !agreed;

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 shadow-2xl animate-in fade-in zoom-in duration-500">
                <h2 className="text-3xl font-black text-white mb-2 text-center italic tracking-tighter">WELCOME!</h2>
                <p className="text-slate-500 mb-10 text-center text-sm font-medium">
                    보드게임에서 사용할 닉네임을 설정하고<br/>서비스 이용약관에 동의해 주세요.
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* 닉네임 입력란 */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nickname</label>
                        <div className="relative">
                            <input
                                name="nickname"
                                type="text"
                                required
                                placeholder="2~16자 사이의 멋진 이름"
                                className={`block w-full px-5 py-4 bg-slate-950 border rounded-2xl text-white focus:ring-2 transition-all outline-none ${
                                    error.nickname ? 'border-red-500/50 focus:ring-red-500/20' : 'border-slate-800 focus:ring-blue-500/20 shadow-inner'
                                }`}
                                value={nickname}
                                onChange={handleChange}
                            />
                            <span className="absolute right-5 top-4.5 text-xs font-mono text-slate-600">
                                {nickname.length}/16
                            </span>
                        </div>
                        {error.nickname && (
                            <p className="text-red-500 text-[11px] font-bold ml-1 animate-in slide-in-from-top-1">
                                {error.nickname}
                            </p>
                        )}
                    </div>

                    {/* ✨ 약관 동의 섹션 추가 */}
                    <div className="bg-slate-950/50 p-5 rounded-2xl border border-slate-800/50 space-y-3">
                        <label className="flex items-start gap-3 cursor-pointer group">
                            <div className="relative mt-0.5">
                                <input 
                                    type="checkbox" 
                                    className="peer sr-only"
                                    checked={agreed}
                                    onChange={(e) => setAgreed(e.target.checked)}
                                />
                                <div className="w-5 h-5 border-2 border-slate-700 rounded-md bg-slate-900 peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-all flex items-center justify-center">
                                    <Check size={14} className={`text-white transition-opacity ${agreed ? 'opacity-100' : 'opacity-0'}`} strokeWidth={4} />
                                </div>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-sm font-bold text-slate-300 group-hover:text-white transition-colors">
                                    서비스 이용 약관 전체 동의
                                </span>
                                <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                                    본 서비스 이용을 위해 <button type="button" onClick={() => window.open('/terms')} className="text-blue-500 hover:underline inline-flex items-center gap-0.5">이용약관<ExternalLink size={10}/></button> 및 
                                    <button type="button" onClick={() => window.open('/privacy')} className="text-blue-500 hover:underline inline-flex items-center gap-0.5 ml-1">개인정보 처리방침<ExternalLink size={10}/></button>에 동의합니다.
                                </p>
                            </div>
                        </label>
                    </div>

                    <button 
                        disabled={isInvalid || isLoading}
                        className={`w-full py-5 font-black rounded-2xl transition-all text-lg shadow-xl ${
                            isInvalid || isLoading 
                                ? 'bg-slate-800 text-slate-600 cursor-not-allowed scale-100' 
                                : 'bg-blue-600 hover:bg-blue-500 text-white hover:scale-[1.02] active:scale-[0.98] shadow-blue-500/10'
                        }`}
                    >
                        {isLoading ? "CREATING..." : "START JOURNEY"}
                    </button>
                </form>
            </div>
        </div>
    );
}