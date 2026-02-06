export default function UserLoading() {
  return (
    <div className="min-h-screen bg-slate-950 p-6 md:p-10">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* 상단 프로필 헤더 스켈레톤 */}
        <div className="flex items-center gap-6 pb-10 border-b border-slate-900">
          <div className="w-20 h-20 bg-slate-900 rounded-2xl animate-pulse" />
          <div className="space-y-3 flex-1">
            <div className="h-8 bg-slate-900 rounded-lg w-1/4 animate-pulse" />
            <div className="h-4 bg-slate-900 rounded-lg w-1/3 animate-pulse" />
          </div>
        </div>

        {/* 그리드 카드 스켈레톤 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-40 bg-slate-900/50 rounded-3xl border border-slate-800 animate-pulse" />
          <div className="h-40 bg-slate-900/50 rounded-3xl border border-slate-800 animate-pulse" />
        </div>

        {/* 하단 리스트 스켈레톤 */}
        <div className="space-y-4">
          <div className="h-6 bg-slate-900 rounded w-1/6 animate-pulse" />
          <div className="h-64 bg-slate-900/30 rounded-3xl border border-slate-800 animate-pulse" />
        </div>
      </div>
    </div>
  );
}