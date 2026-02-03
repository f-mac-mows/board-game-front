// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import AuthProvider from "@/components/providers/authProvider";
import QueryProvider from "@/components/providers/queryProvider";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: {
    default: "Walrung Online | 실시간 보드게임",
    template: "%s | Walrung Online",
  },
  description: "야추, 오목, 원카드, 블랙잭! 왈렁이와 멍낑이랑 실시간 보드 게임을 즐겨보세요.",
  // ✨ 구글/네이버 인증 코드 삽입 (도메인 결정 후 발급받아 교체)
  verification: {
    google: "GOOGLE_VERIFICATION_CODE",
    other: {
      "naver-site-verification": "NAVER_VERIFICATION_CODE",
    },
  },
  // ✨ 검색 로봇 설정
  robots: "index, follow",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="antialiased selection:bg-blue-500/30 flex flex-col min-h-screen">
        <QueryProvider>
          <AuthProvider>
            <main className="flex-1 overflow-auto">{children}</main>
          </AuthProvider>
        </QueryProvider>

        {/* ⚓ 광고 영역 */}
        <footer className="h-22.5 w-full bg-slate-950 border-t border-slate-900 flex flex-col items-center justify-center shrink-0">
          <div className="text-[8px] text-slate-700 mb-1 tracking-widest uppercase font-mono">Sponsored Advertisement</div>
          <div id="persistent-anchor-ad" className="w-full max-w-182 h-full bg-slate-900/10 flex items-center justify-center border border-dashed border-slate-900/50 rounded-sm">
            <span className="text-slate-800 text-[10px] font-mono">AD UNIT (728x90)</span>
          </div>
        </footer>

        <Toaster position="bottom-center" />
      </body>
    </html>
  );
}