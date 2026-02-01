import type { Metadata } from "next";
import "./globals.css";
import AuthProvider from "@/components/providers/authProvider";
import QueryProvider from "@/components/providers/queryProvider";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "Board Game Online",
  description: "왈렁이와 멍낑이랑 실시간 보드 게임을 즐겨보세요."
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="anitialiased selection:bg-blue-500/30">
      <QueryProvider>
        <AuthProvider>
          {children}
        </AuthProvider>
      </QueryProvider>
      <Toaster 
          position="bottom-center" // 위치 설정
          toastOptions={{
            style: {
              background: '#1e293b', // slate-800
              color: '#fff',
              borderRadius: '1rem',
              border: '1px solid #334155',
            },
          }}
        />
      </body>
    </html>
  )
}