import { notFound } from "next/navigation";
import { GAME_TYPE_CONFIG, GameTypeCode } from "@/types/rooms";
import MdReader from "@/components/common/MdReader";
import MetaTag from "@/components/common/MetaTag";
import { getWikiContent, getAllWikiSlugs } from "@/lib/wiki";
import { Metadata } from "next";

export const dynamicParams = false;
export const dynamic = 'force-static';
export const revalidate = false; // 정적 파일이므로 캐시 갱신 불필요

// [핵심] 빌드 시점에 생성할 경로들을 정의합니다.
export async function generateStaticParams() {
  const slugs = getAllWikiSlugs(); // 레지스트리의 키 값들을 가져옴
  return slugs.map((slug) => ({
    gameType: slug,
  }));
}

// 1. Metadata 생성 - SEO 최적화
export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ gameType: string }> 
}): Promise<Metadata> {
  const { gameType } = await params;
  const type = gameType.toUpperCase() as GameTypeCode;
  const config = GAME_TYPE_CONFIG[type];

  if (!config) return { title: "Walrung Online" };

  const title = `${config.description} 가이드 및 승리 전략 - 왈렁 온라인`;
  const description = `${config.description}의 규칙, 금수 규정, 고급 전략을 확인하고 실력을 향상시키세요.`;
  const url = `https://walrung.com/wiki/${gameType.toLowerCase()}`;

  // 💡 방어 로직: 이미지가 있는 게임만 특정 이미지를 쓰고, 나머지는 공통 이미지 사용
  // (나중에 모든 이미지를 다 그리시면 이 조건문을 없애고 바로 `${gameType}.webp`를 쓰시면 됩니다!)
  const hasCustomOg = ["yacht", "gomoku"].includes(gameType.toLowerCase());
  const ogImage = hasCustomOg 
    ? `/images/og/${gameType.toLowerCase()}.webp` 
    : `/main-og.webp`; // public 폴더 루트에 있는 메인 이미지

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "article",
      siteName: "왈렁 온라인",
      images: [
        { 
          url: ogImage,
          width: 1200,
          height: 630,
        }
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

// 2. 메인 페이지 컴포넌트
export default async function WikiDetailPage({ 
  params 
}: { 
  params: Promise<{ gameType: string }> 
}) {
  const resolvedParams = await params;
  // 슬러그를 소문자로 통일하여 검색
  const gameType = resolvedParams.gameType.toLowerCase();

  const type = gameType.toUpperCase() as GameTypeCode;
  const config = GAME_TYPE_CONFIG[type];
  
  // 중요: 빌드 로그에서 성공했던 로직 그대로 호출되는지 확인
  const content = getWikiContent(gameType);

  if (!config || !content) {
    notFound();
  }

  // 검색 엔진용 구조화 데이터 (JSON-LD)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle", // 가이드 문서에 적합한 타입
    "headline": `${config.description} 공식 가이드`,
    "description": `${config.description} 게임의 규칙과 전략에 대한 상세 설명`,
    "author": {
      "@type": "Organization",
      "name": "왈렁 온라인"
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://walrung.com/wiki/${gameType.toLowerCase()}`
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 px-6 py-12">
      {/* 클라이언트 사이드 태그 주입 (JSON-LD 전용) */}
      <MetaTag 
        title={`${config.description} 가이드`}
        description={`${config.description}의 모든 것`}
        url={`https://walrung.com/wiki/${gameType.toLowerCase()}`}
        jsonLd={jsonLd}
      />

      <article className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* 헤더 섹션 디자인 보강 */}
        <header className="mb-12 border-b border-slate-900 pb-8">
          <span className="text-blue-500 text-[10px] font-black tracking-[0.4em] uppercase mb-2 block">
            Official Wiki
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-white italic tracking-tighter uppercase">
            {config.description}
          </h1>
        </header>

        <section className="prose prose-invert prose-slate max-w-none">
          <MdReader content={content} />
        </section>
      </article>
    </div>
  );
}