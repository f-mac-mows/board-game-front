import { notFound } from "next/navigation";
import { Metadata } from "next";
import { GAME_TYPE_CONFIG, GameTypeCode } from "@/types/rooms";
import MdReader from "@/components/common/MdReader";
import MetaTag from "@/components/common/MetaTag";
import { getWikiContent, getAllWikiSlugs } from "@/lib/wiki"; // 수정된 함수들 임포트

/**
 * 1. 정적 경로 생성 (SSG)
 * 빌드 로그에 찍혔던 그 경로들을 Cloudflare가 물리적 파일로 인식하게 만듭니다.
 */
export async function generateStaticParams() {
  const slugs = getAllWikiSlugs();
  return slugs.map((slug) => ({
    gameType: slug.toLowerCase(),
  }));
}

/**
 * 2. Metadata 생성
 */
export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ gameType: string }> 
}): Promise<Metadata> {
  const { gameType } = await params;
  const type = gameType.toUpperCase() as GameTypeCode;
  const config = GAME_TYPE_CONFIG[type];

  if (!config) return { title: "Walrung Online" };

  const title = `${config.description} 가이드 - 왈렁 온라인`;
  const description = `${config.description}의 규칙과 전략을 확인하세요.`;
  const url = `https://walrung.com/wiki/${gameType.toLowerCase()}`;
  
  const hasCustomOg = ["yacht", "gomoku"].includes(gameType.toLowerCase());
  const ogImage = hasCustomOg 
    ? `/images/og/${gameType.toLowerCase()}.webp` 
    : `/main-og.webp`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      images: [{ url: ogImage }],
    },
  };
}

/**
 * 3. 페이지 컴포넌트
 */
export default async function WikiDetailPage({ 
  params 
}: { 
  params: Promise<{ gameType: string }> 
}) {
  const { gameType } = await params;

  if (!gameType) return notFound();

  const type = gameType.toUpperCase() as GameTypeCode;
  const config = GAME_TYPE_CONFIG[type];
  
  // Base64 디코딩 로직이 포함된 getWikiContent 호출
  const content = getWikiContent(gameType);

  if (!config || !content) {
    notFound();
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    "headline": `${config.description} 공식 가이드`,
    "author": { "@type": "Organization", "name": "왈렁 온라인" }
  };

  return (
    <div className="min-h-screen bg-slate-950 px-6 py-12">
      <MetaTag 
        title={`${config.description} 가이드`}
        description={`${config.description}의 모든 것`}
        url={`https://walrung.com/wiki/${gameType.toLowerCase()}`}
        jsonLd={jsonLd}
      />

      <article className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
        <header className="mb-12 border-b border-slate-900 pb-8">
          <span className="text-blue-500 text-[10px] font-black tracking-[0.4em] uppercase mb-2 block">
            Official Wiki
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-white italic tracking-tighter uppercase">
            {config.description}
          </h1>
        </header>

        <section className="prose prose-invert prose-slate max-w-none prose-headings:italic">
          <MdReader content={content} />
        </section>
      </article>
    </div>
  );
}