"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Cookie, ShieldCheck, BarChart3, Settings, MousePointer2 } from 'lucide-react';

export default function CookiePolicyPage() {
  const router = useRouter();
  const SERVICE_NAME = "Walrung Online"; // TODO 이름 수정

  return (
    <main className="min-h-screen bg-slate-950 text-slate-300 p-6 md:p-12 lg:p-20 font-sans selection:bg-blue-500/30">
      <div className="max-w-3xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* 헤더 섹션 */}
        <header className="space-y-6">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-slate-500 hover:text-blue-400 transition-colors group"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-bold uppercase tracking-widest">Back to Home</span>
          </button>
          
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-black text-white italic tracking-tighter uppercase">
              Cookie <span className="text-blue-500">Policy</span>
            </h1>
            <p className="text-slate-500 text-sm font-medium">최종 수정일: 2026. 02. 02</p>
          </div>
        </header>

        <div className="h-px w-full bg-linear-to-r from-slate-800 via-slate-700 to-transparent" />
        
        <br/>
        {/* 본문 섹션 */}
        <div className="space-y-12 text-sm md:text-base leading-relaxed">
          
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-white font-bold text-lg">
              <Cookie size={20} className="text-blue-500" />
              <h3>1. 쿠키(Cookie)란 무엇인가요?</h3>
            </div>
            <p>
              쿠키는 이용자가 웹사이트를 방문할 때 브라우저에 저장되는 작은 텍스트 파일입니다. 이는 이용자의 기본 설정을 기억하고, 보안 로그인을 유지하며, 맞춤형 광고를 제공하는 등 더 나은 웹 경험을 위해 사용됩니다.
            </p>
          </section>
        
          <br/>
          <section className="space-y-6">
            <div className="flex items-center gap-2 text-white font-bold text-lg">
              <Settings size={20} className="text-blue-500" />
              <h3>2. 사용되는 쿠키의 종류</h3>
            </div>
            
            <div className="grid gap-4">
              {/* 필수적 쿠키 */}
              <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-4xl space-y-3">
                <div className="flex items-center gap-2 text-blue-400 font-black italic tracking-tight">
                  <ShieldCheck size={18} /> Essential Cookies
                </div>
                <p className="text-sm text-slate-400">
                  서비스의 핵심 기능을 작동시키기 위해 반드시 필요한 쿠키입니다. 본 서비스는 **httpOnly** 속성을 가진 세션 쿠키를 사용하여 로그인 상태를 안전하게 유지하며, 이는 자바스크립트를 통한 탈취를 방지합니다.
                </p>
              </div>

              {/* 분석 및 성능 쿠키 */}
              <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-4xl space-y-3">
                <div className="flex items-center gap-2 text-emerald-400 font-black italic tracking-tight">
                  <BarChart3 size={18} /> Performance & Analytics
                </div>
                <p className="text-sm text-slate-400">
                  이용자가 서비스를 어떻게 이용하는지 파악하여 성능을 개선하는 데 사용됩니다. 접속 빈도, 게임 플레이 시간 등을 익명화된 데이터로 수집합니다.
                </p>
              </div>

              {/* 광고 쿠키 */}
              <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-4xl space-y-3">
                <div className="flex items-center gap-2 text-indigo-400 font-black italic tracking-tight">
                  <MousePointer2 size={18} /> Advertising (Google AdSense)
                </div>
                <p className="text-sm text-slate-400">
                  구글 등 제3자 광고 사업자가 이용자의 방문 기록을 바탕으로 맞춤형 광고를 노출하기 위해 사용합니다. 이를 통해 무료 서비스를 유지하는 데 필요한 수익을 창출합니다.
                </p>
              </div>
            </div>
          </section>

          <br/>
          {/* 쿠키 설정 관리 */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-white font-bold text-lg">
              <Settings size={20} className="text-blue-500" />
              <h3>3. 쿠키 설정 및 거부 방법</h3>
            </div>
            <p>
              이용자는 웹 브라우저의 옵션을 설정함으로써 모든 쿠키를 허용하거나, 쿠키가 저장될 때마다 확인을 거치거나, 아니면 모든 쿠키의 저장을 거부할 수 있습니다.
            </p>
            <div className="bg-slate-900/30 p-5 rounded-2xl border border-white/5 text-xs text-slate-500 space-y-2">
              <p>• <strong>Chrome:</strong> 설정 &gt; 개인정보 및 보안 &gt; 쿠키 및 기타 사이트 데이터</p>
              <p>• <strong>Safari:</strong> 환경설정 &gt; 개인정보 보호 &gt; 쿠키 및 웹사이트 데이터 차단</p>
              <p>• <strong>Edge:</strong> 설정 &gt; 쿠키 및 사이트 권한 &gt; 쿠키 및 사이트 데이터 관리 및 삭제</p>
            </div>
            <p className="text-xs text-yellow-500/70 italic">
              * 단, 필수적 쿠키 저장을 거부할 경우 로그인이 필요한 일부 서비스 이용에 어려움이 있을 수 있습니다.
            </p>
          </section>

        </div>

        {/* 푸터 영역 */}
        <footer className="pt-10 pb-15 border-t border-slate-900 text-center">
          <p className="text-[11px] font-bold text-slate-600 tracking-widest uppercase italic">
            © 2026 {SERVICE_NAME}. We Value Your Privacy Options.
          </p>
        </footer>
      </div>
    </main>
  );
}