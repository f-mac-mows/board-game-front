// app/wiki/layout.tsx
import WikiNav from "@/components/wiki/WikiNav";

export default function WikiLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* 클라이언트 내비게이션 컴포넌트 */}
      <WikiNav />

      <main className="flex-1">
        {children}
      </main>

      <footer className="py-12 border-t border-slate-900 text-center">
        <p className="text-[10px] text-slate-600 uppercase tracking-widest">
          Walrung Online Board Game Guide
        </p>
      </footer>
    </div>
  );
}