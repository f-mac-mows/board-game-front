import type { Metadata } from "next";
import "./globals.css";
import AuthProvider from "@/components/providers/authProvider";
import QueryProvider from "@/components/providers/queryProvider";

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
      </body>
    </html>
  )
}