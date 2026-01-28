"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authApi } from "@/api/auth";

export default function SignUpPage() {
    const [step, setStep] = useState(1); // 1: 이메일 인증, 2: 상세 정보 입력
    const [formData, setFormData] = useState({
        email: "",
        code: "",
        password: "",
        confirmPassword: "",
        nickname: "",
    });
    const [errors, setErrors] = useState({
        email: "",
        password: "",
        nickname: "",
        confirmPassword: "",
    });
    const [isEmailVerified, setIsEmailVerified] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState({ type: "", text: ""});
    
    const isFormInvalid = 
    !formData.nickname || 
    !formData.password || 
    !!errors.email ||
    !!errors.nickname ||   // 문자열이 있으면 true, 없으면 false로 변환
    !!errors.password || 
    !!errors.confirmPassword;

    const router = useRouter();

    // 유효성 검사 함수
    const validateField = (name: string, value: string) => {
        let error = "";
        switch (name) {
            case "email":
                if (value.length > 50) error = "이메일은 50자 이하로 입력해주세요.";
                else if (value && !/\S+@\S+\.\S+/.test(value)) error = "올바른 이메일 형식이 아닙니다.";
                break;
            case "password":
                if (value.length > 0 && value.length < 8) error = "비밀번호는 최소 8자 이상입니다.";
                else if (value.length > 20) error = "비밀번호는 최대 20자 이하입니다.";

                if (formData.confirmPassword && value !== formData.confirmPassword) {
                    setErrors(prev => ({ ...prev, confirmPassword: "비밀번호가 일치하지 않습니다." }));
                } else {
                    setErrors(prev => ({ ...prev, confirmPassword: "" }));
                }
                break;
            case "confirmPassword":
                if (value !== formData.password) error = "비밀번호가 일치하지 않습니다.";
                break;
            case "nickname":
                if (value.length > 0 && value.length < 2) error = "닉네임은 최소 2자 이상입니다.";
                else if (value.length > 16) error = "닉네임은 최대 16자 이하입니다.";
                break;
        }
        setErrors(prev => ({ ...prev, [name]: error}));
    };

    // 입력 핸들러 수정
    const handleChange = ( e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        validateField(name, value);
    }

    // 1. 이메일 인증번호 요청
    const handleEmailRequest = async () => {
        setIsLoading(true);
        try {
            await authApi.emailRequest({ email: formData.email});
            setMessage({ type: "success", text: "인증번호가 발송되었습니다."});
        } catch (err: any) {
            setMessage({ type: "error", text: "인증번호 발송 실패: " + err.response?.data?.message});
        } finally {
            setIsLoading(false);
        }
    };

    // 2. 이메일 인증번호 확인
    const handleEmailVerify = async () => {
        setIsLoading(true);
        try {
            await authApi.emailVerify({ email: formData.email, code: formData.code });
            setIsEmailVerified(true);
            setMessage({ type: "success", text: "이메일 인증이 완료되었습니다." });
            setStep(2); // 다음 단계로 이동
        } catch (err: any) {
            setMessage({ type: "error", text: "인증번호가 일치하지 않습니다." });
        } finally {
            setIsLoading(false)
        }
    };

    // 3. 최종 회원가입 제출
    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.password != formData.confirmPassword) {
            return setMessage({ type: "error", text: "비밀번호가 일치하지 않스빈다." });
        }

        setIsLoading(true);
        try {
            await authApi.signup({
                email: formData.email,
                password: formData.password,
                nickname: formData.nickname,
            });
            alert("회원가입이 완료되었습니다! 로그인 페이지로 이동합니다.");
            router.push("/auth/login");
        } catch (err: any) {
            setMessage({ type: "error", text: err.response?.data?.message || "가입 실패" });
        } finally {
            setIsLoading(false);
        }
    };

    // 4. Google OAuth2 로그인 핸들러
    const handleGoogleLogin = () => {
        // 백엔드에서 설정한 OAuth2 엔드포인트로 리다이렉트
        window.location.href = `http://walrung.ddns.net:8080/oauth2/authorization/google`;
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 py-12">
            <div className="max-x-md w-full space-y-8 bg-slate-900 p-8 rounded-2xl border border-slate-800 shadow-xl">
                <div className="text-center">
                    <h2 className="text-3xl font-extrabold text-blue-500">Create Account</h2>
                    <p className="mt-2 text-sm text-slate-400">이길 수 없다면 합류하세요.</p>
                </div>

                {/* 단계별 가입 폼 */}
                <form className="space-y-4" onSubmit={handleSignUp}>
                {step === 1 && isEmailVerified == false ? (
                    <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-300">이메일 주소</label>
                        <div className="mt-1 flex gap-2">
                        <input
                            name="email"
                            type="email"
                            required
                            className={`flex-1 px-4 py-3 bg-slate-800 border rounded-lg text-white focus:ring-2 focus:outline-none transition-all ${
                                errors.email ? 'border-red-500 focus:ring-red-500' : 'border-slate-700 focus:ring-blue-500'
                            }`}
                            value={formData.email}
                            onChange={handleChange}
                        />
                        <button
                            type="button"
                            onClick={handleEmailRequest}
                            className="px-4 py-2 bg-slate-700 text-sm font-bold rounded-lg hover:bg-slate-600 transition-colors"
                        >
                            인증요청
                        </button>
                        </div>
                        {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300">인증번호</label>
                        <div className="mt-1 flex gap-2">
                        <input
                            name="code"
                            type="text"
                            className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            value={formData.code}
                            onChange={(e) => setFormData({...formData, code: e.target.value})}
                        />
                        <button
                            type="button"
                            onClick={handleEmailVerify}
                            className="px-4 py-2 bg-blue-600 text-sm font-bold rounded-lg hover:bg-blue-500 transition-colors"
                        >
                            확인
                        </button>
                        </div>
                    </div>
                    </div>
                ) : (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-300">닉네임</label>
                        <span className={`text-xs ${formData.nickname.length > 16 ? 'text-red-400' : 'text-slate-500'}`}>
                            {formData.nickname.length}/16
                        </span>
                        <input
                        name="nickname"
                        type="text"
                        required
                        placeholder="닉네임 입력 (2자~16자)"
                        maxLength={16}
                        className={`mt-1 block w-full px-4 py-3 bg-slate-800 border rounded-lg text-white focus:ring-2 transition-all ${
                            errors.nickname ? 'border-red-500 focus:ring-red-500' : 'border-slate-700 focus:ring-blue-500'
                        }`}
                        value={formData.nickname}
                        onChange={handleChange}
                        />
                        {errors.nickname && <p className="mt-1 text-xs text-red-400 animate-pulse">{errors.nickname}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300">비밀번호 (8~20자)</label>
                        <input
                        name="password"
                        type="password"
                        required
                        maxLength={20}
                        className={`mt-1 block w-full px-4 py-3 bg-slate-800 border rounded-lg text-white focus:ring-2 ${
                            errors.password ? 'border-red-500 focus:ring-red-500' : 'border-slate-700 focus:ring-blue-500'
                        }`}
                        value={formData.password}
                        onChange={handleChange}
                        />
                        {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300">비밀번호 확인</label>
                        <input
                        name="confirmPassword"
                        type="password"
                        required
                        className={`mt-1 block w-full px-4 py-3 bg-slate-800 border rounded-lg text-white focus:ring-2 transition-all ${
                            errors.confirmPassword ? 'border-red-500 focus:ring-red-500' : 'border-slate-700 focus:ring-blue-500'
                        }`}
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        />
                        {errors.confirmPassword && <p className="mt-1 text-xs text-red-400">{errors.confirmPassword}</p>}
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading || isFormInvalid}
                        className={`w-full py-3 px-4 font-bold rounded-lg transition-all ${
                            isFormInvalid ? 'bg-slate-700 cursor-not-allowed text-slate-400' : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                    >
                        가입 완료
                    </button>
                    </div>
                )}
                </form>

                {message.text && (
                <p className={`text-sm text-center ${message.type === "success" ? "text-green-400" : "text-red-400"}`}>
                    {message.text}
                </p>
                )}

                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-800"></span></div>
                    <div className="relative flex justify-center text-xs uppercase"><span className="bg-slate-900 px-2 text-slate-500">Or continue with</span></div>
                </div>

                {/* 소셜 로그인 섹션 */}
                <div className="mt-6">
                    <button
                        onClick={handleGoogleLogin}
                        className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white text-slate-900 font-bold rounded-lg hober:bg-slate-100 transition-colors"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        Google로 시작하기
                    </button>
                </div>

                <div className="text-center text-sm">
                <span className="text-slate-500">이미 계정이 있으신가요? </span>
                <Link href="/auth/login" className="text-blue-400 hover:underline font-medium">로그인</Link>
                </div>
            </div>
        </div>
    )
}