import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Board Game Online",
  description: "실시간 보드 게임을 즐겨보세요."
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="anitialiased selection:bg-blue-500/30">
        {children}
      </body>
    </html>
  )
}