"use client"

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginSuccessPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const token = searchParams.get("token");
        if (token) {
            localStorage.setItem("token", token);
            router.push("/rooms");
        } else {
            router.push("auth/login");
        }
    }, [searchParams, router]);

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
            <div className="text-white text-xl animate-pluse">로그인 중입니다...</div>
        </div>
    );
}