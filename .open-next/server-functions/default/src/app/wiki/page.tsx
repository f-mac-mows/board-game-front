import Link from "next/link";
import { GAME_TYPE_CONFIG, GameTypeCode } from "@/types/rooms";

export default function WikiMainPage() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <header className="mb-12">
        <h1 className="text-4xl font-black italic text-white mb-4">WIKI DIRECTORY</h1>
        <p className="text-slate-500 text-sm max-w-lg">
          왈렁 온라인에서 제공하는 모든 보드게임의 규칙과 승리 전략을 확인하세요. 
          뉴비부터 고수까지 아우르는 팁을 제공합니다.
        </p>
      </header>

      {/* 카드 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(GAME_TYPE_CONFIG).map(([key, detail]) => {
          const gameKey = key as GameTypeCode; 
          const IconComponent = detail.icon; // 아이콘 컴포넌트를 가져옵니다
          const colorClass = `group-hover:border-${detail.color}-500/50 group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.4),0_0_20px_rgba(var(--color-${detail.color}-500-rgb),0.1)]`;
          const iconColorClass = `text-${detail.color}-400 group-hover:text-${detail.color}-300`;
          const hoverBgColorClass = `bg-${detail.color}-600/10 group-hover:bg-${detail.color}-600/20`;

          return (
            <Link key={gameKey} href={`/wiki/${key.toLowerCase()}`} className="group">
              <div className={`relative h-64 bg-slate-900 rounded-4xl border border-slate-800 p-8 
                              transition-all duration-300 group-hover:-translate-y-2 ${colorClass} 
                              overflow-hidden flex flex-col justify-between`}>
                
                {/* 배경 장식 (호버 시 발광) */}
                <div className={`absolute -right-4 -top-4 w-32 h-32 rounded-full blur-3xl 
                                transition-all ${hoverBgColorClass}`} />

                {/* 아이콘 및 게임 타입 */}
                <div className="flex justify-between items-start mb-4 relative z-10">
                  <div className={`flex items-center gap-2 text-[10px] font-black tracking-[0.2em] uppercase ${iconColorClass}`}>
                    <IconComponent size={16} className={iconColorClass} /> {/* 아이콘 적용 */}
                    {key}
                  </div>
                  <div className="px-2 py-1 rounded-md bg-slate-950 text-[9px] font-bold text-slate-500 border border-slate-800">
                    {detail.minPlayers === detail.maxPlayers 
                      ? `${detail.minPlayers} PLAYERS` 
                      : `${detail.minPlayers}-${detail.maxPlayers} PLAYERS`}
                  </div>
                </div>

                {/* 게임 설명 */}
                <h2 className="text-3xl font-black text-white group-hover:text-blue-400 transition-colors relative z-10">
                  {detail.description}
                </h2>

                {/* 가이드 보기 링크 */}
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500 group-hover:text-white transition-colors relative z-10">
                  VIEW GUIDE
                  <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" 
                       fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}