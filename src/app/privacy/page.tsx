"use client";

import { useRouter } from 'next/navigation';
import { ArrowLeft, ShieldCheck, Lock, Eye, Trash2, Cookie } from 'lucide-react';

export default function PrivacyPolicyPage() {
  const router = useRouter();
  const SERVICE_NAME = "Walrung Online";

  return (
    <main className="min-h-screen bg-slate-950 text-slate-300 p-6 md:p-12 lg:p-20 font-sans selection:bg-blue-500/30">
      <div className="max-w-3xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* 뒤로가기 및 헤더 */}
        <header className="space-y-6">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-slate-500 hover:text-blue-400 transition-colors group"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-bold uppercase tracking-widest">Back to Home</span>
          </button>
          
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-black text-white italic tracking-tighter">
              PRIVACY <span className="text-blue-500">POLICY</span>
            </h1>
            <p className="text-slate-500 text-sm font-medium">최초 시행일: 2026. 02. 02</p>
          </div>
        </header>

        <div className="h-px w-full bg-linear-to-r from-slate-800 via-slate-700 to-transparent" />

        {/* 정책 본문 섹션 */}
        <div className="space-y-10 text-sm md:text-base leading-relaxed">
          
          {/* 1. 수집 목적 */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-white font-bold text-lg">
              <Eye size={20} className="text-blue-500" />
              <h3>1. 개인정보의 수집 및 이용 목적</h3>
            </div>
            <p>
              &apos;{SERVICE_NAME}&apos;은 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이 변경되는 경우에는 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.
            </p>
            <ul className="list-disc pl-5 space-y-2 text-slate-400">
              <li>사용자 식별 및 본인 확인 (Google OAuth 2.0 이용)</li>
              <li>게임 서비스 제공 (전적 관리, 랭킹 시스템 운영)</li>
              <li>서비스 부정 이용 방지 및 보안 사고(DDoS, 해킹 등) 대응</li>
            </ul>
          </section>

          {/* 2. 수집 항목 */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-white font-bold text-lg">
              <ShieldCheck size={20} className="text-blue-500" />
              <h3>2. 수집하는 개인정보의 항목</h3>
            </div>
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div>
                <h4 className="font-bold text-slate-200 mb-1">필수 항목 (Google OAuth 2.0)</h4>
                <p className="text-slate-400">이메일 주소, 프로필 이름, 프로필 이미지</p>
              </div>
              <div>
                <h4 className="font-bold text-slate-200 mb-1">자동 수집 항목</h4>
                <p className="text-slate-400">IP 주소, 서비스 이용 기록(접속 시간, 게임 전적), 브라우저 정보</p>
              </div>
              <div>
                <h4 className="font-bold text-slate-200 mb-1">브라우저 저장소 (localStorage)</h4>
                <p className="text-slate-400">이용자 환경 설정(UI 테마, 닉네임 캐싱 등) 저장용</p>
              </div>
            </div>
          </section>

          {/* 3. 쿠키 및 애드센스 */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-white font-bold text-lg">
              <Cookie size={20} className="text-blue-500" />
              <h3>3. 쿠키 및 자동 수집 장치의 운영</h3>
            </div>
            <div className="space-y-4">
              <p>
                본 서비스는 이용자에게 개인화된 서비스를 제공하고 보안을 강화하기 위해 &apos;쿠키(cookie)&apos;를 사용합니다.
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-xl">
                  <h4 className="font-bold text-blue-400 mb-2 underline decoration-blue-500/30">필수 쿠키 (httpOnly)</h4>
                  <p className="text-xs text-slate-400">보안 및 세션 유지를 위해 사용됩니다. 자바스크립트 접근이 차단되어 세션 하이재킹을 방지합니다.</p>
                </div>
                <div className="p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-xl">
                  <h4 className="font-bold text-indigo-400 mb-2 underline decoration-indigo-500/30">제3자 쿠키 (Google AdSense)</h4>
                  <p className="text-xs text-slate-400">이용자의 방문 기록을 바탕으로 맞춤형 광고를 제공하기 위해 구글에서 수집하며, 사용자는 구글 설정에서 이를 거부할 수 있습니다.</p>
                </div>
              </div>
            </div>
          </section>

          {/* 4. 보유 및 파기 */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-white font-bold text-lg">
              <Trash2 size={20} className="text-blue-500" />
              <h3>4. 개인정보의 보유 및 파기</h3>
            </div>
            <p>
              이용자의 개인정보는 원칙적으로 <strong>회원 탈퇴 시 지체 없이 파기</strong>합니다. 단, 서비스 부정 이용 기록은 부정 가입 및 이용 방지를 위해 탈퇴 후 3개월간 보관될 수 있으며, 관련 법령에 따라 보존할 필요가 있는 경우 해당 기간 동안 보관합니다.
            </p>
          </section>

          {/* 5. 담당자 고지 */}
          <section className="p-8 bg-slate-900 border border-slate-800 rounded-[2.5rem] space-y-2">
            <div className="flex items-center gap-2 text-white font-bold mb-2">
              <Lock size={18} className="text-blue-500" />
              <h3>5. 개인정보 보호책임자</h3>
            </div>
            <p className="text-sm">이름: 왈렁</p>
            <p className="text-sm">이메일: <span className="text-blue-400 hover:underline cursor-pointer">[walrung.board@gmail.com]</span></p>
          </section>
        </div>

        {/* 푸터 영역 */}
        <footer className="pt-10 pb-15 border-t border-slate-900 text-center">
          <p className="text-[11px] font-bold text-slate-600 tracking-widest uppercase italic">
            © 2026 {SERVICE_NAME}. Protection of User Data is Our Priority.
          </p>
        </footer>
      </div>
    </main>
  );
}