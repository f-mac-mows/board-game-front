// components/common/MetaTag.tsx
interface MetaTagProps {
  title: string;
  description: string;
  url: string;
  image?: string;
  jsonLd?: object;
}

export default function MetaTag({ title, description, url, image, jsonLd }: MetaTagProps) {
  return (
    <>
      {/* JSON-LD: 구글 검색 결과에 리치 스니펫(별점, 가격, 카테고리 등) 노출 도움 */}
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
    </>
  );
}