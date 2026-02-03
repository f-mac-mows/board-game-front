import { notFound } from "next/navigation";
import { GAME_TYPE_CONFIG, GameTypeCode } from "@/types/rooms";
import MdReader from "@/components/common/MdReader";
import MetaTag from "@/components/common/MetaTag";
import { getWikiContent } from "@/lib/wiki";

// 1. Metadata 부분도 await 적용
export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ gameType: string }> 
}) {
  const { gameType } = await params;
  const type = gameType.toUpperCase() as GameTypeCode;
  const config = GAME_TYPE_CONFIG[type];

  if (!config) return { title: "Walrung Online" };

  return {
    title: `${config.description} 가이드 - Walrung Online`,
    description: `${config.description}의 상세 규칙과 전략을 확인하세요.`,
  };
}

// 2. 메인 페이지 컴포넌트
export default async function WikiDetailPage({ 
  params 
}: { 
  params: Promise<{ gameType: string }> 
}) {
  // 핵심: params 자체를 await로 먼저 풀어줍니다.
  const { gameType } = await params;

  // 값이 없거나 이상할 경우 방어 코드
  if (!gameType) return notFound();

  const type = gameType.toUpperCase() as GameTypeCode;
  const config = GAME_TYPE_CONFIG[type];
  const content = getWikiContent(gameType);

  if (!config || !content) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-950 px-6 py-12">
      <MetaTag 
        title={`${config.description} 가이드`}
        description={`${config.description}의 모든 것`}
        url={`https://walrung.ddns.net/wiki/${gameType}`}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Game",
          "name": config.description
        }}
      />

      <article className="max-w-3xl mx-auto">
        <MdReader content={content} />
      </article>
    </div>
  );
}