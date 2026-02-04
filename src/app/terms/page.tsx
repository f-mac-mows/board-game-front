"use client";

import { useRouter } from 'next/navigation';
import { ArrowLeft, Gavel, Scale, Ban, AlertTriangle, ShieldAlert } from 'lucide-react';

export default function TermsOfServicePage() {
  const router = useRouter();
  const SERVICE_NAME = "Walrung Online";

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
            <h1 className="text-4xl md:text-5xl font-black text-white italic tracking-tighter">
              TERMS OF <span className="text-blue-500">SERVICE</span>
            </h1>
            <p className="text-slate-500 text-sm font-medium">최종 수정일: 2026. 02. 02</p>
          </div>
        </header>

        <div className="h-px w-full bg-linear-to-r from-slate-800 via-slate-700 to-transparent" />

        {/* 본문 섹션 */}
        <div className="space-y-12 text-sm md:text-base leading-relaxed">
          <br/>
          {/* 1. 목적 */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-white font-bold text-lg">
              <Scale size={20} className="text-blue-500" />
              <h3>1. 목적</h3>
            </div>
            <p>
              본 약관은 &apos;{SERVICE_NAME}&apos;(이하 &apos;서비스&apos;)이 제공하는 모든 서비스의 이용 조건 및 절차, 이용자와 서비스 간의 권리, 의무 및 책임 사항을 규정함을 목적으로 합니다.
            </p>
          </section>
        
          <br/>
          {/* 2. 서비스 이용 및 계정 */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-white font-bold text-lg">
              <Gavel size={20} className="text-blue-500" />
              <h3>2. 서비스 이용 및 계정</h3>
            </div>
            <ul className="list-disc pl-5 space-y-2 text-slate-400">
              <li>이용자는 Google OAuth 2.0 등 외부 플랫폼 연동을 통해 서비스를 이용할 수 있습니다.</li>
              <li>계정 정보 관리의 책임은 이용자 본인에게 있으며, 타인에게 계정을 대여하거나 양도하여 발생한 손해에 대해 서비스는 책임을 지지 않습니다.</li>
              <li>서비스는 안정적인 게임 환경 제공을 위해 정기 점검을 실시할 수 있으며, 이 경우 사전 공지합니다.</li>
            </ul>
          </section>

          <br/>
          {/* 3. 금지 행위 및 이용 제한 (중요) */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-white font-bold text-lg">
              <Ban size={20} className="text-red-500" />
              <h3>3. 금지 행위 및 이용 제한</h3>
            </div>
            <p>이용자는 서비스 이용 시 다음 각 호의 행위를 하여서는 안 됩니다. 위반 시 사전 통보 없이 서비스 이용이 영구 제한될 수 있습니다.</p>
            <div className="grid gap-3 pt-2">
              {[
                { title: "비정상적 이용", desc: "매크로, 핵 프로그램, 데이터 조작 등 비정상적인 방법으로 게임 결과에 영향을 주는 행위" },
                { title: "타인 비방 및 도용", desc: "타인의 닉네임 도용, 욕설, 도배 등 건전한 커뮤니티 환경을 저해하는 행위" },
                { title: "시스템 취약점 악용", desc: "서비스 내 버그를 악용하여 부당한 이득(MMR, 전적 등)을 취하는 행위" }
              ].map((item, idx) => (
                <div key={idx} className="p-4 bg-red-500/5 border border-red-500/10 rounded-2xl flex gap-4 items-start">
                  <ShieldAlert size={18} className="text-red-500 mt-1 shrink-0" />
                  <div>
                    <h4 className="font-bold text-slate-200">{item.title}</h4>
                    <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <br/>
          {/* 4. 면책 조항 */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-white font-bold text-lg">
              <AlertTriangle size={20} className="text-yellow-500" />
              <h3>4. 면책 조항</h3>
            </div>
            <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 text-slate-400 text-sm space-y-3">
              <p>• 서비스는 천재지변, 서버 점검, 통신 장애 등 불가항력적인 사유로 인해 서비스를 제공할 수 없는 경우 책임을 지지 않습니다.</p>
              <p>• 이용자 간의 분쟁이나 이용자의 귀책사유로 인한 서비스 이용 장애에 대해 책임을 지지 않습니다.</p>
              <p>• 베타 테스트 기간 중 발생하는 데이터(전적, 랭킹 등)의 초기화 가능성에 대해 고지하며, 이에 따른 보상 의무가 없습니다.</p>
            </div>
          </section>

          <br/>
          {/* 5. 약관의 변경 */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-white font-bold text-lg">
              <Scale size={20} className="text-blue-500" />
              <h3>5. 약관의 변경</h3>
            </div>
            <p>
              서비스는 필요한 경우 관련 법령을 위배하지 않는 범위 내에서 본 약관을 개정할 수 있습니다. 변경된 약관은 공지사항 또는 서비스 하단 링크를 통해 게시하며, 게시일로부터 7일 이후에 효력이 발생합니다.
            </p>
          </section>
        </div>

        {/* 푸터 영역 */}
        <footer className="pt-10 pb-15 border-t border-slate-900 text-center">
          <p className="text-[11px] font-bold text-slate-600 tracking-widest uppercase italic">
            © 2026 {SERVICE_NAME}. Fair Play & Respect Others.
          </p>
        </footer>
      </div>
    </main>
  );
}